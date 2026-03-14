"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createBooking } from "@/services/bookingService";
import type { BookingType } from "@/types/booking";

const bookingTypes: BookingType[] = ["flight", "hotel", "transport", "activity"];

const addBookingSchema = z.object({
  type: z.enum(bookingTypes),
  title: z.string().trim().min(1, "Title is required"),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type AddBookingFormValues = z.infer<typeof addBookingSchema>;

interface AddBookingFormProps {
  tripId: string;
}

export function AddBookingForm({ tripId }: AddBookingFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddBookingFormValues>({
    resolver: zodResolver(addBookingSchema),
    defaultValues: {
      type: "flight",
    },
  });

  const onSubmit = async (values: AddBookingFormValues) => {
    setSubmitError(null);

    try {
      await createBooking({
        tripId,
        type: values.type,
        title: values.title,
        startDate: values.startDate,
        endDate: values.endDate,
        notes: values.notes,
      });
      reset({
        type: "flight",
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="booking-type" className="block text-sm font-medium">
          Booking type
        </label>
        <select
          id="booking-type"
          {...register("type")}
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

      <div className="space-y-1">
        <label htmlFor="booking-title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="booking-title"
          {...register("title")}
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
