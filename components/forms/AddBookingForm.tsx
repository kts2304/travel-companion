"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { extractBookingDetailsFromFile } from "@/lib/bookings/extractBookingDetails";
import { createBooking } from "@/services/bookingService";
import type { BookingType } from "@/types/booking";
import type { Member } from "@/types/member";

const bookingTypes: BookingType[] = ["flight", "bus", "hotel", "transport", "activity"];
const personalBookingTypes: BookingType[] = ["flight", "bus"];

const addBookingSchema = z.object({
  type: z.enum(bookingTypes),
  memberId: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((values, context) => {
  if (personalBookingTypes.includes(values.type) && !values.memberId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select the traveler for this ticket.",
      path: ["memberId"],
    });
  }
});

type AddBookingFormValues = z.infer<typeof addBookingSchema>;

interface AddBookingFormProps {
  tripId: string;
  members: Member[];
}

export function AddBookingForm({ tripId, members }: AddBookingFormProps) {
  const router = useRouter();
  const fileInputId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddBookingFormValues>({
    resolver: zodResolver(addBookingSchema),
    defaultValues: {
      type: "flight",
      memberId: "",
    },
  });
  const selectedType = useWatch({ control, name: "type" }) ?? "flight";
  const isPersonalBooking = personalBookingTypes.includes(selectedType);

  const onSubmit = async (values: AddBookingFormValues) => {
    setSubmitError(null);
    setExtractSuccess(null);

    try {
      await createBooking({
        tripId,
        type: values.type,
        scope: personalBookingTypes.includes(values.type) ? "personal" : "shared",
        memberId: personalBookingTypes.includes(values.type) ? values.memberId : undefined,
        title: values.title,
        startDate: values.startDate,
        endDate: values.endDate,
        notes: values.notes,
      });
      reset({
        type: "flight",
        memberId: "",
        title: "",
        startDate: "",
        endDate: "",
        notes: "",
      });
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add booking");
    }
  };

  const onExtract = async () => {
    if (!selectedDocument) {
      setSubmitError("Choose a PDF or image file to extract booking details.");
      return;
    }

    setSubmitError(null);
    setExtractSuccess(null);
    setIsExtracting(true);

    try {
      const extracted = await extractBookingDetailsFromFile(selectedDocument);
      setValue("type", extracted.type, { shouldValidate: true });
      if (!personalBookingTypes.includes(extracted.type)) {
        setValue("memberId", "");
      }
      setValue("title", extracted.title, { shouldValidate: true });
      setValue("startDate", extracted.startDate, { shouldValidate: true });
      setValue("endDate", extracted.endDate);
      setValue("notes", extracted.notes);
      setExtractSuccess("Booking details extracted from the document.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to extract booking details",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-4">
        <p className="text-sm font-medium text-violet-900">Import details from document</p>
        <p className="mt-1 text-xs text-violet-800">
          Upload a flight, bus, hotel, transport, or activity PDF/image to pre-fill this form.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor={fileInputId}
            className="inline-flex cursor-pointer items-center rounded-lg bg-violet-100 px-3 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-200"
          >
            Choose file
          </label>
          <input
            id={fileInputId}
            type="file"
            accept=".pdf,application/pdf,image/*"
            autoComplete="off"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedDocument(file);
              setExtractSuccess(null);
            }}
          />
          <p className="text-sm text-slate-600">
            {selectedDocument ? selectedDocument.name : "No file selected"}
          </p>
          <button
            type="button"
            onClick={onExtract}
            disabled={isExtracting}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {isExtracting ? "Extracting..." : "Extract details"}
          </button>
        </div>
        {extractSuccess && <p className="mt-3 text-sm text-emerald-700">{extractSuccess}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="booking-type" className="block text-sm font-medium">
          Booking type
        </label>
        <select
          id="booking-type"
          {...register("type")}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-violet-300 focus:ring-2"
        >
          {bookingTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {isPersonalBooking ? (
          <p>
            {selectedType === "flight" ? "Flight tickets" : "Bus tickets"} are stored as
            personal travel items and shown in the signed-in traveler&apos;s view.
          </p>
        ) : (
          <p>Hotels, activities, and shared transport stay visible to the whole trip.</p>
        )}
      </div>

      {isPersonalBooking && (
        <div className="space-y-1">
          <label htmlFor="booking-member" className="block text-sm font-medium">
            Traveler
          </label>
          <select
            id="booking-member"
            {...register("memberId")}
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-violet-300 focus:ring-2"
          >
            <option value="">Select traveler</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.email ? ` (${member.email})` : ""}
              </option>
            ))}
          </select>
          {errors.memberId && <p className="text-sm text-red-600">{errors.memberId.message}</p>}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="booking-title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="booking-title"
          {...register("title")}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-violet-300 focus:ring-2"
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="booking-start" className="block text-sm font-medium">
            Start date
          </label>
          <input
            id="booking-start"
            type="datetime-local"
            {...register("startDate")}
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-violet-300 focus:ring-2"
          />
          {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="booking-end" className="block text-sm font-medium">
            End date
          </label>
          <input
            id="booking-end"
            type="datetime-local"
            {...register("endDate")}
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-violet-300 focus:ring-2"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="booking-notes" className="block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="booking-notes"
          rows={3}
          {...register("notes")}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-violet-300 focus:ring-2"
        />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add booking"}
      </button>
    </form>
  );
}
