"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { uploadBookingDocument } from "@/services/bookingService";
import type { BookingDocument, BookingDocumentKind } from "@/types/booking";

interface BookingDocumentsPanelProps {
  bookingId: string;
  documents: BookingDocument[];
}

function getDocumentLabel(fileUrl: string): string {
  const fileName = fileUrl.split("/").pop() ?? "document";
  const parts = fileName.split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : fileName;
}

export function BookingDocumentsPanel({
  bookingId,
  documents,
}: BookingDocumentsPanelProps) {
  const router = useRouter();
  const inputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentKind, setDocumentKind] = useState<BookingDocumentKind>("checkin");
  const bookingDocuments = documents.filter((document) => document.document_kind === "booking");
  const checkinDocuments = documents.filter((document) => document.document_kind === "checkin");

  const onUpload = async () => {
    if (!selectedFile) {
      setSubmitError("Choose a PDF or image to upload.");
      return;
    }

    setSubmitError(null);
    setIsUploading(true);

    try {
      await uploadBookingDocument(bookingId, selectedFile, documentKind);
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to upload document",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-violet-500/20 bg-slate-950/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-lg bg-violet-500/20 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
        >
          Choose document
        </label>
        <input
          id={inputId}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
          }}
        />
        <p className="text-sm text-slate-300">
          {selectedFile ? selectedFile.name : "PDF or image"}
        </p>
        <select
          value={documentKind}
          onChange={(event) => setDocumentKind(event.target.value as BookingDocumentKind)}
          className="rounded-lg border border-slate-700 bg-[#06111d] px-3 py-2 text-sm text-white outline-none ring-violet-300 focus:ring-2"
        >
          <option value="checkin">Check-in document</option>
          <option value="booking">Booking document</option>
        </select>
        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
            Booking documents
          </p>
          <div className="mt-2 space-y-2">
            {bookingDocuments.length === 0 && (
              <p className="text-sm text-slate-300">No booking documents uploaded yet.</p>
            )}
            {bookingDocuments.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-2 rounded-lg border border-violet-500/15 bg-violet-500/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="break-all text-sm text-slate-200">{getDocumentLabel(document.file_url)}</p>
                <div className="flex gap-3 text-sm">
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-violet-200 hover:underline"
                  >
                    Open
                  </a>
                  <a
                    href={document.file_url}
                    download
                    className="font-medium text-violet-200 hover:underline"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Check-in documents
          </p>
          <div className="mt-2 space-y-2">
            {checkinDocuments.length === 0 && (
              <p className="text-sm text-slate-300">No check-in documents uploaded yet.</p>
            )}
            {checkinDocuments.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-2 rounded-lg border border-cyan-500/15 bg-cyan-500/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="break-all text-sm text-slate-200">{getDocumentLabel(document.file_url)}</p>
                <div className="flex gap-3 text-sm">
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-cyan-200 hover:underline"
                  >
                    Open
                  </a>
                  <a
                    href={document.file_url}
                    download
                    className="font-medium text-cyan-200 hover:underline"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
