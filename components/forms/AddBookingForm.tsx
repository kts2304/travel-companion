"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { extractBookingDetailsFromFile } from "@/lib/bookings/extractBookingDetails";
import { getCurrentAuthUser } from "@/services/authService";
import { createBooking, uploadBookingDocument } from "@/services/bookingService";
import type { BookingType } from "@/types/booking";
import type { Member } from "@/types/member";

const bookingTypes: BookingType[] = ["flight", "bus", "hotel", "transport", "activity"];
const personalBookingTypes: BookingType[] = ["flight", "bus"];

const addBookingSchema = z.object({
  type: z.enum(bookingTypes),
  memberId: z.string().optional(),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  hotelName: z.string().optional(),
  roomNumber: z.string().optional(),
  place: z.string().optional(),
  onwardFlightNumber: z.string().optional(),
  onwardDepartureAt: z.string().optional(),
  onwardSeatNumber: z.string().optional(),
  onwardPnr: z.string().optional(),
  returnFlightNumber: z.string().optional(),
  returnDepartureAt: z.string().optional(),
  returnSeatNumber: z.string().optional(),
  returnPnr: z.string().optional(),
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

function buildDefaultBookingTitle(
  type: BookingType,
  memberName: string | undefined,
  startDate: string,
  selectedDocument: File | null,
  hotelName?: string,
): string {
  const typeLabel = type === "bus" ? "Bus ticket" : type === "flight" ? "Flight ticket" : `${type} booking`;
  const dateLabel = startDate ? new Date(startDate).toISOString().slice(0, 10) : "schedule";
  const fileLabel = selectedDocument?.name.replace(/\.[^.]+$/, "").slice(0, 60);

  if (type === "hotel" && hotelName?.trim()) {
    return hotelName.trim();
  }

  if (fileLabel) {
    return fileLabel;
  }

  if (memberName) {
    return `${typeLabel} - ${memberName} - ${dateLabel}`;
  }

  return `${typeLabel} - ${dateLabel}`;
}

interface AddBookingFormProps {
  tripId: string;
  members: Member[];
  tripStartDate?: string | null;
  tripEndDate?: string | null;
}

export function AddBookingForm({
  tripId,
  members,
  tripStartDate,
  tripEndDate,
}: AddBookingFormProps) {
  const router = useRouter();
  const fileInputId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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
      notes: "",
      hotelName: "",
      roomNumber: "",
      place: "",
      onwardFlightNumber: "",
      onwardDepartureAt: "",
      onwardSeatNumber: "",
      onwardPnr: "",
      returnFlightNumber: "",
      returnDepartureAt: "",
      returnSeatNumber: "",
      returnPnr: "",
    },
  });
  const selectedType = useWatch({ control, name: "type" }) ?? "flight";
  const selectedMemberId = useWatch({ control, name: "memberId" }) ?? "";
  const isPersonalBooking = personalBookingTypes.includes(selectedType);
  const isHotelBooking = selectedType === "hotel";
  const currentMember = useMemo(() => {
    if (!currentEmail) {
      return null;
    }

    return (
      members.find((member) => member.email?.trim().toLowerCase() === currentEmail) ?? null
    );
  }, [currentEmail, members]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const user = await getCurrentAuthUser();
      if (!isMounted) {
        return;
      }

      setCurrentEmail(user?.email ?? null);
      setIsLoadingUser(false);
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isPersonalBooking && currentMember) {
      setValue("memberId", currentMember.id, { shouldValidate: true });
      return;
    }

    if (isPersonalBooking) {
      return;
    }

    if (selectedMemberId) {
      setValue("memberId", "", { shouldValidate: true });
    }
  }, [currentMember, isPersonalBooking, selectedMemberId, setValue]);

  useEffect(() => {
    if (!isHotelBooking) {
      return;
    }

    if (tripStartDate) {
      setValue("startDate", `${tripStartDate}T12:00`, { shouldValidate: true });
    }

    if (tripEndDate) {
      setValue("endDate", `${tripEndDate}T12:00`);
    }
  }, [isHotelBooking, setValue, tripEndDate, tripStartDate]);

  const onSubmit = async (values: AddBookingFormValues) => {
    setSubmitError(null);
    setExtractSuccess(null);

    try {
      const traveler = members.find((member) => member.id === values.memberId);
      const booking = await createBooking({
        tripId,
        type: values.type,
        scope: personalBookingTypes.includes(values.type) ? "personal" : "shared",
        memberId: personalBookingTypes.includes(values.type) ? values.memberId : undefined,
        title: buildDefaultBookingTitle(
          values.type,
          traveler?.name,
          values.startDate,
          selectedDocument,
          values.hotelName,
        ),
        startDate: values.startDate,
        endDate: values.endDate,
        notes: values.notes,
        hotelName: values.hotelName,
        roomNumber: values.roomNumber,
        place: values.place,
        onwardFlightNumber: values.onwardFlightNumber,
        onwardDepartureAt: values.onwardDepartureAt,
        onwardSeatNumber: values.onwardSeatNumber,
        onwardPnr: values.onwardPnr,
        returnFlightNumber: values.returnFlightNumber,
        returnDepartureAt: values.returnDepartureAt,
        returnSeatNumber: values.returnSeatNumber,
        returnPnr: values.returnPnr,
      });

      if (selectedDocument) {
        await uploadBookingDocument(booking.id, selectedDocument, "booking");
      }

      reset({
        type: "flight",
        memberId: "",
        startDate: "",
        endDate: "",
        notes: "",
        hotelName: "",
        roomNumber: "",
        place: "",
        onwardFlightNumber: "",
        onwardDepartureAt: "",
        onwardSeatNumber: "",
        onwardPnr: "",
        returnFlightNumber: "",
        returnDepartureAt: "",
        returnSeatNumber: "",
        returnPnr: "",
      });
      setSelectedDocument(null);
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
      setValue("startDate", extracted.startDate, { shouldValidate: true });
      setValue("endDate", extracted.endDate || (isHotelBooking && tripEndDate ? `${tripEndDate}T12:00` : ""));
      setValue("notes", extracted.notes);
      setValue("hotelName", extracted.hotelName);
      setValue("roomNumber", extracted.roomNumber);
      setValue("place", extracted.place);
      setValue("onwardFlightNumber", extracted.onwardFlightNumber);
      setValue("onwardDepartureAt", extracted.onwardDepartureAt);
      setValue("onwardSeatNumber", extracted.onwardSeatNumber);
      setValue("onwardPnr", extracted.onwardPnr);
      setValue("returnFlightNumber", extracted.returnFlightNumber);
      setValue("returnDepartureAt", extracted.returnDepartureAt);
      setValue("returnSeatNumber", extracted.returnSeatNumber);
      setValue("returnPnr", extracted.returnPnr);
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
      className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-[0_20px_60px_rgba(1,6,17,0.28)]"
    >
      <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
        <p className="text-sm font-medium text-violet-200">Import details from document</p>
        <p className="mt-1 text-xs text-slate-300">
          Upload a flight, bus, hotel, transport, or activity PDF/image to pre-fill this form.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor={fileInputId}
            className="inline-flex cursor-pointer items-center rounded-lg bg-violet-500/20 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
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
          <p className="text-sm text-slate-300">
            {selectedDocument ? selectedDocument.name : "No file selected"}
          </p>
          <button
            type="button"
            onClick={onExtract}
            disabled={isExtracting}
            className="rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
          >
            {isExtracting ? "Extracting..." : "Extract details"}
          </button>
        </div>
        {extractSuccess && <p className="mt-3 text-sm text-emerald-300">{extractSuccess}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="booking-type" className="block text-sm font-medium text-slate-100">
          Booking type
        </label>
        <select
          id="booking-type"
          {...register("type")}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-violet-300 focus:ring-2"
        >
          {bookingTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#06111d] px-4 py-3 text-sm text-slate-200">
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
          <label className="block text-sm font-medium text-slate-100">Traveler</label>
          {isLoadingUser ? (
            <div className="rounded-xl border border-slate-700 bg-[#06111d] px-4 py-3 text-sm text-slate-300">
              Checking signed-in traveler...
            </div>
          ) : currentMember ? (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50">
              {currentMember.name}
              {currentMember.email ? ` (${currentMember.email})` : ""}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                No signed-in trip member match found. Select the traveler manually for now.
              </div>
              <select
                id="booking-member"
                {...register("memberId")}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-violet-300 focus:ring-2"
              >
                <option value="">Select traveler</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.email ? ` (${member.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          {errors.memberId && <p className="text-sm text-red-600">{errors.memberId.message}</p>}
        </div>
      )}

      {isHotelBooking ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Hotel stay dates follow the trip dates by default.
          <div className="mt-2 text-slate-200">
            {tripStartDate || "-"} to {tripEndDate || "-"}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="booking-start" className="block text-sm font-medium text-slate-100">
              Start date
            </label>
            <input
              id="booking-start"
              type="datetime-local"
              {...register("startDate")}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-violet-300 focus:ring-2"
            />
            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="booking-end" className="block text-sm font-medium text-slate-100">
              End date
            </label>
            <input
              id="booking-end"
              type="datetime-local"
              {...register("endDate")}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-violet-300 focus:ring-2"
            />
          </div>
        </div>
      )}
      <input type="hidden" {...register("notes")} />
      <input type="hidden" {...register("hotelName")} />
      <input type="hidden" {...register("roomNumber")} />
      <input type="hidden" {...register("place")} />
      <input type="hidden" {...register("onwardFlightNumber")} />
      <input type="hidden" {...register("onwardDepartureAt")} />
      <input type="hidden" {...register("onwardSeatNumber")} />
      <input type="hidden" {...register("onwardPnr")} />
      <input type="hidden" {...register("returnFlightNumber")} />
      <input type="hidden" {...register("returnDepartureAt")} />
      <input type="hidden" {...register("returnSeatNumber")} />
      <input type="hidden" {...register("returnPnr")} />

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
