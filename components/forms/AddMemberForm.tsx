"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { addMember } from "@/services/memberService";

const addMemberSchema = z.object({
  name: z.string().trim().min(1, "Member name is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberFormProps {
  tripId: string;
}

export function AddMemberForm({ tripId }: AddMemberFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
  });

  const onSubmit = async (values: AddMemberFormValues) => {
    setSubmitError(null);

    try {
      await addMember(tripId, values);
      reset();
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add member");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="theme-card space-y-4 rounded-[28px] border p-5 shadow-[0_20px_36px_rgba(118,60,145,0.12)]"
    >
      <div className="space-y-1">
        <label htmlFor="member-name" className="theme-heading block text-sm font-bold">
          Member name
        </label>
        <input
          id="member-name"
          {...register("name")}
          autoComplete="off"
          className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="member-email" className="theme-heading block text-sm font-bold">
          Email (optional)
        </label>
        <input
          id="member-email"
          type="email"
          {...register("email")}
          autoComplete="off"
          className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="theme-brand-button rounded-full px-5 py-3 font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
