"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteBookingEntry } from "@/services/bookingService";
import type { BookingDocument } from "@/types/booking";

interface DeleteBookingButtonProps {
  bookingId: string;
  bookingLabel: string;
  documents: BookingDocument[];
}

export function DeleteBookingButton({
  bookingId,
  bookingLabel,
  documents,
}: DeleteBookingButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${bookingLabel}"? This will remove the booking and its uploaded documents.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteBookingEntry(bookingId, documents);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete this booking right now.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete entry"}
      </button>
      {deleteError && <p className="mt-2 text-sm text-rose-300">{deleteError}</p>}
    </div>
  );
}
