"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { addMember } from "@/services/memberService";
import { createTrip } from "@/services/tripService";

const createTripSchema = z.object({
  creatorName: z.string().trim().min(1, "Your name is required"),
  creatorEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  name: z.string().trim().min(1, "Trip name is required"),
  destination: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

export function CreateTripForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
  });

  const onSubmit = async (values: CreateTripFormValues) => {
    setSubmitError(null);

    try {
      const trip = await createTrip({
        name: values.name,
        destination: values.destination,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      await addMember(trip.id, {
        name: values.creatorName,
        email: values.creatorEmail,
      });
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create trip");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="creator-name" className="block text-sm font-medium">
          Your name
        </label>
        <input
          id="creator-name"
          {...register("creatorName")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-sky-300 focus:ring-2"
        />
        {errors.creatorName && <p className="text-sm text-red-600">{errors.creatorName.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="creator-email" className="block text-sm font-medium">
          Your email (optional)
        </label>
        <input
          id="creator-email"
          type="email"
          {...register("creatorEmail")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-sky-300 focus:ring-2"
        />
        {errors.creatorEmail && (
          <p className="text-sm text-red-600">{errors.creatorEmail.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="trip-name" className="block text-sm font-medium">
          Trip name
        </label>
        <input id="trip-name" {...register("name")} className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-sky-300 focus:ring-2" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="trip-destination" className="block text-sm font-medium">
          Destination
        </label>
        <input
          id="trip-destination"
          {...register("destination")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-sky-300 focus:ring-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="trip-start-date" className="block text-sm font-medium">
            Start date
          </label>
          <input
            id="trip-start-date"
            type="date"
            {...register("startDate")}
            className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-sky-300 focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="trip-end-date" className="block text-sm font-medium">
            End date
          </label>
          <input
            id="trip-end-date"
            type="date"
            {...register("endDate")}
            className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-sky-300 focus:ring-2"
          />
        </div>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-sky-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-sky-700 disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create trip"}
      </button>
    </form>
  );
}
