"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { uploadBookingDocument } from "@/services/bookingService";
import type { BookingDocument } from "@/types/booking";

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

  const onUpload = async () => {
    if (!selectedFile) {
      setSubmitError("Choose a PDF or image to upload.");
      return;
    }

    setSubmitError(null);
    setIsUploading(true);

    try {
      await uploadBookingDocument(bookingId, selectedFile);
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
    <div className="mt-4 rounded-xl border border-violet-100 bg-white/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-lg bg-violet-100 px-3 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-200"
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
        <p className="text-sm text-slate-600">
          {selectedFile ? selectedFile.name : "PDF or image"}
        </p>
        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}

      <div className="mt-4 space-y-2">
        {documents.length === 0 && (
          <p className="text-sm text-slate-600">No documents uploaded yet.</p>
        )}
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex flex-col gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-700">{getDocumentLabel(document.file_url)}</p>
            <div className="flex gap-3 text-sm">
              <a
                href={document.file_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-violet-700 hover:underline"
              >
                Open
              </a>
              <a
                href={document.file_url}
                download
                className="font-medium text-violet-700 hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
