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
  onwardOrigin: z.string().optional(),
  onwardDestination: z.string().optional(),
  onwardFlightNumber: z.string().optional(),
  onwardDepartureAt: z.string().optional(),
  onwardSeatNumber: z.string().optional(),
  onwardPnr: z.string().optional(),
  returnOrigin: z.string().optional(),
  returnDestination: z.string().optional(),
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
  allowedTypes?: BookingType[];
  heading?: string;
  description?: string;
}

export function AddBookingForm({
  tripId,
  members,
  tripStartDate,
  tripEndDate,
  allowedTypes,
  heading = "Import details from document",
  description = "Upload a flight, bus, hotel, transport, or activity PDF/image to pre-fill this form.",
}: AddBookingFormProps) {
  const router = useRouter();
  const fileInputId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const availableTypes = allowedTypes?.length ? allowedTypes : bookingTypes;
  const defaultType = availableTypes[0] ?? "flight";

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
      type: defaultType,
      memberId: "",
      notes: "",
      hotelName: "",
      roomNumber: "",
      place: "",
      onwardOrigin: "",
      onwardDestination: "",
      onwardFlightNumber: "",
      onwardDepartureAt: "",
      onwardSeatNumber: "",
      onwardPnr: "",
      returnOrigin: "",
      returnDestination: "",
      returnFlightNumber: "",
      returnDepartureAt: "",
      returnSeatNumber: "",
      returnPnr: "",
    },
  });
  const selectedType = useWatch({ control, name: "type" }) ?? defaultType;
  const selectedMemberId = useWatch({ control, name: "memberId" }) ?? "";
  const selectedStartDate = useWatch({ control, name: "startDate" }) ?? "";
  const selectedEndDate = useWatch({ control, name: "endDate" }) ?? "";
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

  useEffect(() => {
    if (isPersonalBooking && selectedEndDate && !selectedStartDate) {
      setValue("endDate", "");
    }
  }, [isPersonalBooking, selectedEndDate, selectedStartDate, setValue]);

  const onSubmit = async (values: AddBookingFormValues) => {
    setSubmitError(null);
    setExtractSuccess(null);

    try {
      if (isPersonalBooking) {
        if (!selectedDocument) {
          throw new Error("Upload a flight or bus ticket document before saving this booking.");
        }

        if (!values.startDate) {
          throw new Error("We could not detect journey timing from this document. Please try another PDF/image.");
        }
      }

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
        onwardOrigin: values.onwardOrigin,
        onwardDestination: values.onwardDestination,
        onwardFlightNumber: values.onwardFlightNumber,
        onwardDepartureAt: values.onwardDepartureAt,
        onwardSeatNumber: values.onwardSeatNumber,
        onwardPnr: values.onwardPnr,
        returnOrigin: values.returnOrigin,
        returnDestination: values.returnDestination,
        returnFlightNumber: values.returnFlightNumber,
        returnDepartureAt: values.returnDepartureAt,
        returnSeatNumber: values.returnSeatNumber,
        returnPnr: values.returnPnr,
      });

      if (selectedDocument) {
        await uploadBookingDocument(booking.id, selectedDocument, "booking");
      }

      reset({
        type: defaultType,
        memberId: "",
        startDate: "",
        endDate: "",
        notes: "",
        hotelName: "",
        roomNumber: "",
        place: "",
        onwardOrigin: "",
        onwardDestination: "",
        onwardFlightNumber: "",
        onwardDepartureAt: "",
        onwardSeatNumber: "",
        onwardPnr: "",
        returnOrigin: "",
        returnDestination: "",
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
      const selectedTraveler = currentMember ?? members.find((member) => member.id === selectedMemberId) ?? null;
      const extracted = await extractBookingDetailsFromFile(selectedDocument, {
        travelerName: selectedTraveler?.name,
      });

      if (!availableTypes.includes(extracted.type)) {
        throw new Error(
          `This document looks like a ${extracted.type} booking. Use the matching booking section for it.`,
        );
      }

      setValue("type", extracted.type, { shouldValidate: true });
      if (!personalBookingTypes.includes(extracted.type)) {
        setValue("memberId", "");
      }

      const resolvedStartDate =
        extracted.type === "hotel"
          ? extracted.startDate || (tripStartDate ? `${tripStartDate}T12:00` : "")
          : extracted.startDate;
      const resolvedEndDate =
        extracted.type === "hotel"
          ? extracted.endDate || (tripEndDate ? `${tripEndDate}T12:00` : "")
          : extracted.endDate;

      setValue("startDate", resolvedStartDate, { shouldValidate: true });
      setValue("endDate", resolvedEndDate);
      setValue("notes", extracted.notes);
      setValue("hotelName", extracted.hotelName);
      setValue("roomNumber", extracted.roomNumber);
      setValue("place", extracted.place);
      setValue("onwardOrigin", extracted.onwardOrigin);
      setValue("onwardDestination", extracted.onwardDestination);
      setValue("onwardFlightNumber", extracted.onwardFlightNumber);
      setValue("onwardDepartureAt", extracted.onwardDepartureAt);
      setValue("onwardSeatNumber", extracted.onwardSeatNumber);
      setValue("onwardPnr", extracted.onwardPnr);
      setValue("returnOrigin", extracted.returnOrigin);
      setValue("returnDestination", extracted.returnDestination);
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
      className="space-y-4 rounded-[32px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,239,250,0.9))] p-5 shadow-[0_20px_34px_rgba(118,60,145,0.14)]"
    >
      <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(72,21,104,0.92),rgba(95,23,120,0.92))] p-4 shadow-[0_16px_30px_rgba(118,60,145,0.16)]">
        <p className="text-sm font-medium text-white">{heading}</p>
        <p className="mt-1 text-xs text-white/78">
          {description}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor={fileInputId}
            className="inline-flex shrink-0 cursor-pointer items-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-fuchsia-900 shadow-[0_16px_28px_rgba(39,4,58,0.14)] transition hover:-translate-y-0.5"
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
          <p className="min-w-0 flex-1 truncate text-sm text-white/80" title={selectedDocument ? selectedDocument.name : "No file selected"}>
            {selectedDocument ? selectedDocument.name : "No file selected"}
          </p>
          <button
            type="button"
            onClick={onExtract}
            disabled={isExtracting}
            className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-fuchsia-900 shadow-[0_16px_28px_rgba(39,4,58,0.14)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isExtracting ? "Extracting..." : "Extract details"}
          </button>
        </div>
        {extractSuccess && <p className="mt-3 text-sm text-emerald-100">{extractSuccess}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="booking-type" className="block text-sm font-medium text-[#35194f]">
          Booking type
        </label>
        <select
          id="booking-type"
          {...register("type")}
          autoComplete="off"
          className="w-full rounded-[22px] border border-white/70 bg-white/92 p-3 text-[#35194f] outline-none ring-fuchsia-300 focus:ring-2"
        >
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div className="rounded-[24px] border border-white/70 bg-white/82 px-4 py-3 text-sm text-[#5a4670]">
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
          <label className="block text-sm font-medium text-[#35194f]">Traveler</label>
          {isLoadingUser ? (
            <div className="rounded-[22px] border border-white/70 bg-white/92 px-4 py-3 text-sm text-[#6c567f]">
              Checking signed-in traveler...
            </div>
          ) : currentMember ? (
            <div className="rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(72,21,104,0.92),rgba(95,23,120,0.92))] px-4 py-3 text-sm text-white">
              {currentMember.name}
              {currentMember.email ? ` (${currentMember.email})` : ""}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-[22px] border border-white/70 bg-white/92 px-4 py-3 text-sm text-[#7a5d2a]">
                No signed-in trip member match found. Select the traveler manually for now.
              </div>
              <select
                id="booking-member"
                {...register("memberId")}
                autoComplete="off"
                className="w-full rounded-[22px] border border-white/70 bg-white/92 p-3 text-[#35194f] outline-none ring-fuchsia-300 focus:ring-2"
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

      {isHotelBooking ? null : isPersonalBooking ? null : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="booking-start" className="block text-sm font-bold text-[#35194f]">
              Start date
            </label>
            <input
              id="booking-start"
              type="datetime-local"
              {...register("startDate")}
              autoComplete="off"
              className="w-full rounded-[22px] border border-white/70 bg-white/92 p-3 text-[#35194f] outline-none ring-fuchsia-300 focus:ring-2"
            />
            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="booking-end" className="block text-sm font-bold text-[#35194f]">
              End date
            </label>
            <input
              id="booking-end"
              type="datetime-local"
              {...register("endDate")}
              autoComplete="off"
              className="w-full rounded-[22px] border border-white/70 bg-white/92 p-3 text-[#35194f] outline-none ring-fuchsia-300 focus:ring-2"
            />
          </div>
        </div>
      )}
      <input type="hidden" {...register("notes")} />
      <input type="hidden" {...register("hotelName")} />
      <input type="hidden" {...register("roomNumber")} />
      <input type="hidden" {...register("place")} />
      <input type="hidden" {...register("onwardOrigin")} />
      <input type="hidden" {...register("onwardDestination")} />
      <input type="hidden" {...register("onwardFlightNumber")} />
      <input type="hidden" {...register("onwardDepartureAt")} />
      <input type="hidden" {...register("onwardSeatNumber")} />
      <input type="hidden" {...register("onwardPnr")} />
      <input type="hidden" {...register("returnOrigin")} />
      <input type="hidden" {...register("returnDestination")} />
      <input type="hidden" {...register("returnFlightNumber")} />
      <input type="hidden" {...register("returnDepartureAt")} />
      <input type="hidden" {...register("returnSeatNumber")} />
      <input type="hidden" {...register("returnPnr")} />

      {submitError && <p className="text-sm text-rose-700">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-[linear-gradient(135deg,#c21884,#8b1d8f)] px-6 py-3 font-semibold text-white shadow-[0_18px_34px_rgba(176,23,120,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(176,23,120,0.3)] disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add booking"}
      </button>
    </form>
  );
}
