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
  onwardFlightNumber: string;
  onwardDepartureAt: string;
  onwardSeatNumber: string;
  onwardPnr: string;
  returnFlightNumber: string;
  returnDepartureAt: string;
  returnSeatNumber: string;
  returnPnr: string;
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
  return text.replace(/\s+/g, " ").trim();
}

function extractFirstMatch(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function extractAllMatches(text: string, pattern: RegExp): string[] {
  return Array.from(text.matchAll(pattern)).map((match) => match[1]?.trim() ?? "").filter(Boolean);
}

function normalizeFlightToken(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function extractFlightDetails(rawText: string): Omit<
  ExtractedBookingDetails,
  "type" | "title" | "startDate" | "endDate" | "notes" | "rawText" | "hotelName" | "roomNumber" | "place"
> {
  const airlineFlightMatches = extractAllMatches(
    rawText,
    /\b((?:6E|AI|UK|SG|I5|QP|IX|G8)\s?\d{1,4})\b/gi,
  ).map(normalizeFlightToken);
  const labeledFlightMatches = extractAllMatches(
    rawText,
    /\b(?:flight|flt)\s*(?:no|number|#)?[:\s-]*([A-Z0-9]{2,10})/gi,
  ).map(normalizeFlightToken);
  const allFlightMatches = Array.from(new Set([...airlineFlightMatches, ...labeledFlightMatches]));
  const allSeatMatches = Array.from(
    new Set([
      ...extractAllMatches(rawText, /\bseat\s*(?:no|number|#)?[:\s-]*([A-Z0-9]{1,4})/gi),
      ...extractAllMatches(rawText, /\b(\d{1,2}[A-F])\b/g),
    ]),
  );
  const allPnrMatches = Array.from(
    new Set(
      extractAllMatches(
        rawText,
        /\b(?:pnr|booking reference|booking number|reservation code|ref)\s*[:\s-]*([A-Z0-9]{5,12})/gi,
      ),
    ),
  );
  const dates = extractCandidateDates(rawText).map((date) => toDateTimeLocal(date));

  return {
    onwardFlightNumber: allFlightMatches[0] ?? "",
    onwardDepartureAt: dates[0] ?? "",
    onwardSeatNumber: allSeatMatches[0] ?? "",
    onwardPnr: allPnrMatches[0] ?? "",
    returnFlightNumber: allFlightMatches[1] ?? "",
    returnDepartureAt: dates[1] ?? "",
    returnSeatNumber: allSeatMatches[1] ?? "",
    returnPnr: allPnrMatches[1] ?? "",
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
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
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

function buildExtractedBookingDetails(rawText: string): ExtractedBookingDetails {
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
  const flightDetails =
    type === "flight"
      ? extractFlightDetails(rawText)
      : {
          onwardFlightNumber: "",
          onwardDepartureAt: "",
          onwardSeatNumber: "",
          onwardPnr: "",
          returnFlightNumber: "",
          returnDepartureAt: "",
          returnSeatNumber: "",
          returnPnr: "",
        };

  return {
    type,
    title,
    startDate,
    endDate,
    notes,
    rawText,
    ...hotelDetails,
    ...flightDetails,
  };
}

export async function extractBookingDetailsFromFile(
  file: File,
): Promise<ExtractedBookingDetails> {
  if (file.type === "application/pdf") {
    return buildExtractedBookingDetails(await extractTextFromPdfWithOcrFallback(file));
  }

  if (file.type.startsWith("image/")) {
    return buildExtractedBookingDetails(await extractTextFromImage(file));
  }

  throw new Error("Only PDF and image files are supported for extraction.");
}
