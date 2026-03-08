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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="member-name" className="block text-sm font-medium">
          Member name
        </label>
        <input id="member-name" {...register("name")} className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-cyan-300 focus:ring-2" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="member-email" className="block text-sm font-medium">
          Email (optional)
        </label>
        <input
          id="member-email"
          type="email"
          {...register("email")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-cyan-300 focus:ring-2"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-cyan-700 disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
