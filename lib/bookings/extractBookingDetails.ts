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
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{2}[/-]\d{2}[/-]\d{4}\b/g,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const match of matches) {
      candidates.add(match);
    }
  }

  return Array.from(candidates)
    .map((candidate) => {
      const normalized = /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(candidate)
        ? candidate.replace(/(\d{2})[/-](\d{2})[/-](\d{4})/, "$3-$2-$1")
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

  return {
    type,
    title,
    startDate,
    endDate,
    notes,
    rawText,
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
