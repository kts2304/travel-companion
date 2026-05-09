"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { getCurrentAuthUser, type AuthUserSummary } from "@/services/authService";
import { addMember } from "@/services/memberService";
import { createTrip } from "@/services/tripService";

const createTripSchema = z.object({
  creatorName: z.string().trim().min(1, "Your name is required"),
  creatorEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  name: z.string().trim().min(1, "Trip name is required"),
  destination: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).superRefine((values, context) => {
  if (values.startDate && values.endDate && values.endDate <= values.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after the start date.",
      path: ["endDate"],
    });
  }
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

function addOneDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const nextDay = new Date(year, month - 1, day + 1);
  const nextYear = nextDay.getFullYear();
  const nextMonth = `${nextDay.getMonth() + 1}`.padStart(2, "0");
  const nextDate = `${nextDay.getDate()}`.padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDate}`;
}

export function CreateTripForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUserSummary | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
  });
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";

  useEffect(() => {
    if (startDate && endDate && endDate <= startDate) {
      setValue("endDate", "", { shouldValidate: true });
    }
  }, [endDate, setValue, startDate]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const user = await getCurrentAuthUser();
      if (!isMounted) {
        return;
      }

      setCurrentUser(user);
      if (user?.email) {
        setValue("creatorEmail", user.email, { shouldValidate: true });
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [setValue]);

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
        email: values.creatorEmail || currentUser?.email || undefined,
        authUserId: currentUser?.id,
      });
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create trip");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="theme-card space-y-4 rounded-[30px] border p-5 shadow-[0_22px_38px_rgba(118,60,145,0.12)]"
    >
      <div className="space-y-1">
        <label htmlFor="creator-name" className="theme-heading block text-sm font-bold">
          Your name
        </label>
        <input
          id="creator-name"
          {...register("creatorName")}
          autoComplete="off"
          className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.creatorName && <p className="text-sm text-red-600">{errors.creatorName.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="creator-email" className="theme-heading block text-sm font-bold">
          Your email (optional)
        </label>
        <input
          id="creator-email"
          type="email"
          {...register("creatorEmail")}
          autoComplete="off"
          className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.creatorEmail && (
          <p className="text-sm text-red-600">{errors.creatorEmail.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="trip-name" className="theme-heading block text-sm font-bold">
          Trip name
        </label>
        <input
          id="trip-name"
          {...register("name")}
          autoComplete="off"
          className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="trip-destination" className="theme-heading block text-sm font-bold">
          Destination
        </label>
        <input
          id="trip-destination"
          {...register("destination")}
          autoComplete="off"
          className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="trip-start-date" className="theme-heading block text-sm font-bold">
            Start date
          </label>
          <input
            id="trip-start-date"
            type="date"
            {...register("startDate")}
            autoComplete="off"
            className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="trip-end-date" className="theme-heading block text-sm font-bold">
            End date
          </label>
          <input
            id="trip-end-date"
            type="date"
            {...register("endDate")}
            min={startDate ? addOneDay(startDate) : undefined}
            autoComplete="off"
            className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
          />
          {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="theme-brand-button rounded-full px-5 py-3 font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create trip"}
      </button>
    </form>
  );
}
