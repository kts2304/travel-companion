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
      className="space-y-4 rounded-[28px] border border-fuchsia-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,239,250,0.92))] p-5 shadow-[0_20px_36px_rgba(118,60,145,0.12)]"
    >
      <div className="space-y-1">
        <label htmlFor="member-name" className="block text-sm font-bold text-[#35194f]">
          Member name
        </label>
        <input
          id="member-name"
          {...register("name")}
          autoComplete="off"
          className="w-full rounded-[22px] border border-fuchsia-900/12 bg-white p-3 text-[#35194f] outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="member-email" className="block text-sm font-bold text-[#35194f]">
          Email (optional)
        </label>
        <input
          id="member-email"
          type="email"
          {...register("email")}
          autoComplete="off"
          className="w-full rounded-[22px] border border-fuchsia-900/12 bg-white p-3 text-[#35194f] outline-none ring-fuchsia-300 focus:ring-2"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-[linear-gradient(135deg,#c21884,#8b1d8f)] px-5 py-3 font-semibold text-white shadow-[0_18px_34px_rgba(176,23,120,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(176,23,120,0.3)] disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
