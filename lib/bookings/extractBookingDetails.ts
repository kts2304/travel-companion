"use client";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

import type { BookingType } from "@/types/booking";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.mjs",
  import.meta.url,
).toString();

export interface ExtractedBookingDetails {
  type: BookingType;
  title: string;
  startDate: string;
  endDate: string;
  notes: string;
  rawText: string;
  hotelName: string;
  roomNumber: string;
  place: string;
  onwardOrigin: string;
  onwardDestination: string;
  onwardFlightNumber: string;
  onwardDepartureAt: string;
  onwardSeatNumber: string;
  onwardPnr: string;
  returnOrigin: string;
  returnDestination: string;
  returnFlightNumber: string;
  returnDepartureAt: string;
  returnSeatNumber: string;
  returnPnr: string;
}

interface ExtractBookingDetailsOptions {
  travelerName?: string;
}

function toDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function detectBookingType(text: string): BookingType {
  const lowerText = text.toLowerCase();
  const typeMatchers: Record<BookingType, RegExp[]> = {
    flight: [/flight/, /boarding/, /airline/, /pnr/, /departure/, /arrival/],
    bus: [/bus/, /coach/, /operator/, /boarding point/, /drop point/],
    hotel: [/hotel/, /check-?in/, /check-?out/, /reservation/, /room/],
    transport: [/train/, /taxi/, /cab/, /pickup/, /drop/, /transport/],
    activity: [/activity/, /event/, /tour/, /museum/, /show/, /ticket/],
  };

  let bestType: BookingType = "activity";
  let bestScore = -1;

  for (const [type, patterns] of Object.entries(typeMatchers) as [BookingType, RegExp[]][]) {
    const score = patterns.reduce(
      (count, pattern) => count + (pattern.test(lowerText) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return bestType;
}

function extractCandidateDates(text: string): Date[] {
  const candidates = new Set<string>();
  const patterns = [
    /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}\b/g,
    /\b\d{2}[/-]\d{2}[/-]\d{4}\s+\d{2}:\d{2}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{2}[/-]\d{2}[/-]\d{4}\b/g,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\s+\d{1,2}:\d{2}\b/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const match of matches) {
      candidates.add(match);
    }
  }

  return Array.from(candidates)
    .map((candidate) => {
      const normalized = /^\d{2}[/-]\d{2}[/-]\d{4}(?:\s+\d{2}:\d{2})?$/.test(candidate)
        ? candidate.replace(
            /(\d{2})[/-](\d{2})[/-](\d{4})(?:\s+(\d{2}:\d{2}))?/,
            (_match, day, month, year, time) => `${year}-${month}-${day}${time ? `T${time}` : ""}`,
          )
        : candidate;
      return new Date(normalized);
    })
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());
}

function extractTitle(text: string, type: BookingType): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const keywordMap: Record<BookingType, RegExp[]> = {
    flight: [/airline/i, /flight/i, /boarding/i],
    bus: [/bus/i, /coach/i, /operator/i],
    hotel: [/hotel/i, /resort/i, /inn/i],
    transport: [/train/i, /taxi/i, /cab/i, /transport/i],
    activity: [/tour/i, /activity/i, /event/i, /ticket/i],
  };

  const preferredLine =
    lines.find((line) => keywordMap[type].some((pattern) => pattern.test(line))) ??
    lines.find((line) => line.length >= 4 && line.length <= 80) ??
    `${type.charAt(0).toUpperCase()}${type.slice(1)} booking`;

  return preferredLine;
}

function normalizeRawText(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function normalizeLineText(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractFirstMatch(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function extractAllMatches(text: string, pattern: RegExp): string[] {
  return Array.from(text.matchAll(pattern)).map((match) => match[1]?.trim() ?? "").filter(Boolean);
}

function normalizeFlightToken(value: string): string {
  return value.replace(/\s+/g, "").replace(/-+/g, "-").toUpperCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isMeaningfulToken(value: string): boolean {
  return /^[A-Z0-9-]+$/.test(value) && ![
    "FLIGHT",
    "E-TICKET",
    "ETICKET",
    "TICKET",
    "NUMBER",
    "REF",
    "BOOKING",
    "PNR",
    "IS",
    "OR",
    "NO",
    "NA",
  ].includes(value);
}

function isValidFlightNumber(value: string): boolean {
  const normalized = normalizeFlightToken(value);
  return /^(?:6E|AI|UK|SG|I5|QP|IX|G8)-?\d{1,4}$/.test(normalized);
}

function isValidSeatNumber(value: string): boolean {
  return /^\d{1,2}[A-F]$/i.test(value.trim());
}

function isValidPnr(value: string): boolean {
  const normalized = value.trim().toUpperCase();
  return normalized.length >= 5 && normalized.length <= 12 && isMeaningfulToken(normalized);
}

function toDateTimeLocalFromParts(monthText: string, dayText: string, yearText: string, timeText: string): string {
  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(monthText.slice(0, 3).toLowerCase());

  if (monthIndex === -1) {
    return "";
  }

  const date = new Date(
    Number(yearText),
    monthIndex,
    Number(dayText),
    Number(timeText.slice(0, 2)),
    Number(timeText.slice(3, 5)),
  );

  return Number.isNaN(date.getTime()) ? "" : toDateTimeLocal(date);
}

function extractDateTimeByLabel(rawText: string, label: "departure" | "arrival"): string {
  const directMatch = rawText.match(
    new RegExp(
      `\\b${label}\\s+[^A-Z0-9]{0,10}?([A-Za-z]{3},?\\s+[A-Za-z]{3}\\s+\\d{1,2}\\s+\\d{4}\\s+\\d{1,2}:\\d{2})\\s*(?:Hrs)?`,
      "i",
    ),
  );

  if (directMatch?.[1]) {
    const parts = directMatch[1].match(/[A-Za-z]{3},?\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}:\d{2})/i);
    if (parts) {
      return toDateTimeLocalFromParts(parts[1], parts[2], parts[3], parts[4]);
    }
  }

  return "";
}

function extractTicketPassengerSeat(rawText: string): string {
  const seat = (
    extractFirstMatch(
      rawText,
      /\bseat\s*no\.?\s*[:\s-]*([0-9]{1,2}[A-Z])(?:\s*\(confirmed\))?/i,
    ) ||
    extractFirstMatch(rawText, /\b([0-9]{1,2}[A-Z])\s*\(confirmed\)/i)
  );

  return isValidSeatNumber(seat) ? seat.toUpperCase() : "";
}

function extractFlightPnr(rawText: string): string {
  const pnr = (
    extractFirstMatch(rawText, /\bpnr\s*[:\s-]*([A-Z0-9]{5,10})\b/i) ||
    extractFirstMatch(rawText, /\bbooking\s*(?:number|reference|ref)\s*[:\s-]*([A-Z0-9]{5,12})\b/i) ||
    extractFirstMatch(rawText, /\bticket\s*no\.?\s*[:\s-]*([A-Z0-9]{5,12})\b/i)
  );

  return isValidPnr(pnr) ? pnr.toUpperCase() : "";
}

function buildDateTimeFromParts(dateLabel: string, hourText: string, minuteText: string): string {
  const normalizedDate = new Date(dateLabel);
  if (Number.isNaN(normalizedDate.getTime())) {
    return "";
  }

  normalizedDate.setHours(Number(hourText), Number(minuteText), 0, 0);
  return toDateTimeLocal(normalizedDate);
}

function extractRouteFromChunk(chunk: string): { origin: string; destination: string } {
  const routeMatch = chunk.match(
    /\b([A-Za-z][A-Za-z ]{2,40})\s+([A-Za-z][A-Za-z ]{2,40})\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),/i,
  );

  if (!routeMatch) {
    return { origin: "", destination: "" };
  }

  return {
    origin: routeMatch[1].replace(/\s+/g, " ").trim(),
    destination: routeMatch[2].replace(/\s+/g, " ").trim(),
  };
}

function extractTravelerFlightChunkDetails(chunk: string): {
  origin: string;
  destination: string;
  flightNumber: string;
  departureAt: string;
  seatNumber: string;
  pnr: string;
} {
  const flightNumberMatch = chunk.match(/\b((?:6\s*E|AI|UK|SG|I5|QP|IX|G8)\s*-\s*\d{1,4})\b/i);
  const flightNumber = flightNumberMatch ? normalizeFlightToken(flightNumberMatch[1]) : "";
  const passengerRowMatch = chunk.match(
    /\b(?:\d+\s*kgs?\s*\(Free\)\s*)(\d{1,2})\s*([A-Z])\s*\(Confirmed.*?\)\s*([A-Z0-9]{5,12})/i,
  );
  const seatNumber = passengerRowMatch
    ? `${passengerRowMatch[1]}${passengerRowMatch[2]}`
    : extractTicketPassengerSeat(chunk);
  const pnr = passengerRowMatch?.[3] && isValidPnr(passengerRowMatch[3])
    ? passengerRowMatch[3].toUpperCase()
    : extractFlightPnr(chunk);
  const route = extractRouteFromChunk(chunk);

  const dateMatches = Array.from(
    chunk.matchAll(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4}\b/gi),
  ).map((match) => match[0]);
  const hourMatches = Array.from(chunk.matchAll(/\b(\d{1,2})\s*:/g)).map((match) => match[1]);
  const minuteMatches = Array.from(chunk.matchAll(/\b(\d{2})\s+Hrs\b/gi)).map((match) => match[1]);
  const departureAt =
    dateMatches[0] && hourMatches[0] && minuteMatches[0]
      ? buildDateTimeFromParts(dateMatches[0], hourMatches[0], minuteMatches[0])
      : "";

  return {
    origin: route.origin,
    destination: route.destination,
    flightNumber,
    departureAt,
    seatNumber,
    pnr,
  };
}

function extractFlightDetailsForTraveler(
  rawText: string,
  travelerName: string,
): Omit<
  ExtractedBookingDetails,
  "type" | "title" | "startDate" | "endDate" | "notes" | "rawText" | "hotelName" | "roomNumber" | "place"
> | null {
  const normalizedTravelerName = travelerName.trim();
  if (!normalizedTravelerName) {
    return null;
  }

  const travelerPattern = new RegExp(escapeRegExp(normalizedTravelerName), "gi");
  const travelerChunks = Array.from(rawText.matchAll(travelerPattern))
    .map((match) => {
      const startIndex = match.index ?? 0;
      const nextPageIndex = rawText.indexOf("Download Yatra App", startIndex + normalizedTravelerName.length);
      const endIndex = nextPageIndex === -1 ? rawText.length : nextPageIndex;
      return rawText.slice(startIndex, endIndex);
    })
    .filter(Boolean);

  if (travelerChunks.length === 0) {
    return null;
  }

  const onward = extractTravelerFlightChunkDetails(travelerChunks[0]);
  const returnChunk = travelerChunks[1] ? extractTravelerFlightChunkDetails(travelerChunks[1]) : null;

  return {
    onwardOrigin: onward.origin,
    onwardDestination: onward.destination,
    onwardFlightNumber: onward.flightNumber,
    onwardDepartureAt: onward.departureAt,
    onwardSeatNumber: onward.seatNumber,
    onwardPnr: onward.pnr,
    returnOrigin: returnChunk?.origin ?? "",
    returnDestination: returnChunk?.destination ?? "",
    returnFlightNumber: returnChunk?.flightNumber ?? "",
    returnDepartureAt: returnChunk?.departureAt ?? "",
    returnSeatNumber: returnChunk?.seatNumber ?? "",
    returnPnr: returnChunk?.pnr ?? "",
  };
}

function extractFlightDetails(rawText: string): Omit<
  ExtractedBookingDetails,
  "type" | "title" | "startDate" | "endDate" | "notes" | "rawText" | "hotelName" | "roomNumber" | "place"
> {
  const lines = normalizeLineText(rawText);
  const airlineFlightMatches = extractAllMatches(
    rawText,
    /\b((?:6E|AI|UK|SG|I5|QP|IX|G8)\s?-?\d{1,4})\b/gi,
  )
    .map(normalizeFlightToken)
    .filter(isValidFlightNumber);
  const labeledFlightMatches = extractAllMatches(
    rawText,
    /\b(?:flight|flt)\s*(?:no|number|#)?[:\s.-]*([A-Z0-9-]{2,10})/gi,
  )
    .map(normalizeFlightToken)
    .filter(isValidFlightNumber);
  const lineFlightMatches = lines
    .flatMap((line) => Array.from(line.matchAll(/\b((?:6E|AI|UK|SG|I5|QP|IX|G8)\s?-?\d{1,4})\b/gi)))
    .map((match) => normalizeFlightToken(match[1] ?? ""))
    .filter(isValidFlightNumber);
  const allFlightMatches = Array.from(new Set([...airlineFlightMatches, ...labeledFlightMatches]));
  const dedupedFlightMatches = Array.from(new Set([...allFlightMatches, ...lineFlightMatches]));
  const allSeatMatches = Array.from(
    new Set([
      extractTicketPassengerSeat(rawText),
      ...extractAllMatches(rawText, /\bseat\s*(?:no\.?|number|#)?[:\s.-]*([A-Z0-9]{1,4})/gi),
      ...extractAllMatches(rawText, /\b(\d{1,2}[A-F])\b/g),
    ]
      .filter(Boolean)
      .map((value) => value.toUpperCase())
      .filter(isValidSeatNumber)),
  );
  const extractedPnr = extractFlightPnr(rawText);
  const allPnrMatches = Array.from(
    new Set(
      [
        extractedPnr,
        ...extractAllMatches(
          rawText,
          /\b(?:pnr|booking reference|booking number|reservation code|ref|ticket no\.?)\s*[:\s.-]*([A-Z0-9]{5,12})/gi,
        ),
      ]
        .filter(Boolean)
        .map((value) => value.toUpperCase())
        .filter(isValidPnr),
    ),
  );
  const departureAt = extractDateTimeByLabel(rawText, "departure");
  const dates = extractCandidateDates(rawText).map((date) => toDateTimeLocal(date));
  const hasSecondLegEvidence =
    /\breturn\b/i.test(rawText) ||
    dedupedFlightMatches.length > 1 ||
    allPnrMatches.length > 1;

  return {
    onwardOrigin: "",
    onwardDestination: "",
    onwardFlightNumber: dedupedFlightMatches[0] ?? "",
    onwardDepartureAt: departureAt || dates[0] || "",
    onwardSeatNumber: allSeatMatches[0] ?? "",
    onwardPnr: allPnrMatches[0] ?? "",
    returnOrigin: "",
    returnDestination: "",
    returnFlightNumber: hasSecondLegEvidence ? (dedupedFlightMatches[1] ?? "") : "",
    returnDepartureAt: hasSecondLegEvidence ? (dates[1] || "") : "",
    returnSeatNumber: hasSecondLegEvidence ? (allSeatMatches[1] ?? "") : "",
    returnPnr: hasSecondLegEvidence ? (allPnrMatches[1] ?? "") : "",
  };
}

function extractHotelDetails(
  rawText: string,
  title: string,
): Pick<ExtractedBookingDetails, "hotelName" | "roomNumber" | "place"> {
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hotelName =
    extractFirstMatch(rawText, /\b(?:hotel|property|stay at)\s*[:\s-]*([A-Za-z0-9 .&'-]{3,80})/i) ||
    lines.find((line) => /(hotel|resort|inn|suites|villa)/i.test(line)) ||
    title;
  const roomNumber = extractFirstMatch(
    rawText,
    /\b(?:room|room no|room number|rm)\s*[:#\s-]*([A-Z0-9-]{1,10})/i,
  );
  const place =
    extractFirstMatch(rawText, /\b(?:address|location|city|place)\s*[:\s-]*([A-Za-z0-9, .-]{3,80})/i) ||
    lines.find((line) => /(road|street|nagar|city|goa|delhi|mumbai|bengaluru|bangalore|hyderabad|jaipur|udupi|mysuru|mysore)/i.test(line)) ||
    "";

  return {
    hotelName: hotelName.trim(),
    roomNumber,
    place: place.trim(),
  };
}

async function runOcr(image: string | HTMLCanvasElement): Promise<string> {
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(image);
    return normalizeRawText(result.data.text);
  } finally {
    await worker.terminate();
  }
}

async function renderPdfPageToCanvas(
  pageNumber: number,
  pdf: {
    getPage: (pageNumber: number) => Promise<unknown>;
  },
): Promise<HTMLCanvasElement> {
  const page = (await pdf.getPage(pageNumber)) as {
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: {
      canvasContext: CanvasRenderingContext2D;
      canvas: HTMLCanvasElement;
      viewport: unknown;
    }) => { promise: Promise<void> };
  };
  const viewport = page.getViewport({ scale: 2 }) as { width: number; height: number };
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is not available for OCR.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    canvas,
    viewport,
  }).promise;

  return canvas;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lineMap = new Map<number, Array<{ x: number; text: string }>>();

    for (const item of textContent.items) {
      if (!("str" in item) || !("transform" in item)) {
        continue;
      }

      const text = item.str?.trim();
      if (!text) {
        continue;
      }

      const transform = Array.isArray(item.transform) ? item.transform : [];
      const x = typeof transform[4] === "number" ? transform[4] : 0;
      const y = typeof transform[5] === "number" ? transform[5] : 0;
      const lineKey = Math.round(y);
      const existingLine = lineMap.get(lineKey) ?? [];
      existingLine.push({ x, text });
      lineMap.set(lineKey, existingLine);
    }

    const pageText = Array.from(lineMap.entries())
      .sort((left, right) => right[0] - left[0])
      .map(([, items]) =>
        items
          .sort((left, right) => left.x - right.x)
          .map((entry) => entry.text)
          .join(" "),
      )
      .join("\n");

    pageTexts.push(pageText);
  }

  return normalizeRawText(pageTexts.join("\n"));
}

async function extractTextFromPdfWithOcrFallback(file: File): Promise<string> {
  const text = await extractTextFromPdf(file);
  if (text.length >= 80) {
    return text;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const ocrTexts: string[] = [];
  const maxPages = Math.min(pdf.numPages, 2);

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const canvas = await renderPdfPageToCanvas(pageNumber, pdf);
    ocrTexts.push(await runOcr(canvas));
  }

  return normalizeRawText(ocrTexts.join("\n"));
}

async function extractTextFromImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await runOcr(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function buildExtractedBookingDetails(
  rawText: string,
  options?: ExtractBookingDetailsOptions,
): ExtractedBookingDetails {
  if (!rawText) {
    throw new Error("Could not extract readable text from this file.");
  }

  const type = detectBookingType(rawText);
  const title = extractTitle(rawText, type);
  const dates = extractCandidateDates(rawText);
  const startDate = dates[0] ? toDateTimeLocal(dates[0]) : "";
  const endDate = dates[1] ? toDateTimeLocal(dates[1]) : "";
  const notes = rawText.slice(0, 500);
  const hotelDetails =
    type === "hotel"
      ? extractHotelDetails(rawText, title)
      : {
          hotelName: "",
          roomNumber: "",
          place: "",
        };
  const emptyFlightDetails = {
    onwardOrigin: "",
    onwardDestination: "",
    onwardFlightNumber: "",
    onwardDepartureAt: "",
    onwardSeatNumber: "",
    onwardPnr: "",
    returnOrigin: "",
    returnDestination: "",
    returnFlightNumber: "",
    returnDepartureAt: "",
    returnSeatNumber: "",
    returnPnr: "",
  };
  const travelerFlightDetails =
    type === "flight" && options?.travelerName
      ? extractFlightDetailsForTraveler(rawText, options.travelerName)
      : null;
  const flightDetails =
    type === "flight"
      ? travelerFlightDetails ?? extractFlightDetails(rawText)
      : emptyFlightDetails;
  const resolvedStartDate = flightDetails.onwardDepartureAt || (dates[0] ? toDateTimeLocal(dates[0]) : "");
  const resolvedEndDate = flightDetails.returnDepartureAt || "";

  return {
    type,
    title,
    startDate: resolvedStartDate || startDate,
    endDate: resolvedEndDate || endDate,
    notes,
    rawText,
    ...hotelDetails,
    ...flightDetails,
  };
}

export async function extractBookingDetailsFromFile(
  file: File,
  options?: ExtractBookingDetailsOptions,
): Promise<ExtractedBookingDetails> {
  if (file.type === "application/pdf") {
    return buildExtractedBookingDetails(await extractTextFromPdfWithOcrFallback(file), options);
  }

  if (file.type.startsWith("image/")) {
    return buildExtractedBookingDetails(await extractTextFromImage(file), options);
  }

  throw new Error("Only PDF and image files are supported for extraction.");
}
