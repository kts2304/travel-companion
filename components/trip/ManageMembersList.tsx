"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { deleteMember, updateMember } from "@/services/memberService";
import type { Member } from "@/types/member";

const memberSchema = z.object({
  name: z.string().trim().min(1, "Member name is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface ManageMembersListProps {
  members: Member[];
}

function MemberCard({ member }: { member: Member }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member.name,
      email: member.email ?? "",
    },
  });

  const onSave = async (values: MemberFormValues) => {
    setActionError(null);

    try {
      await updateMember(member.id, values);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update member");
    }
  };

  const onDelete = async () => {
    const confirmed = window.confirm(
      `Remove ${member.name} from this trip? This will only work if they are not tied to existing expenses.`,
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setIsDeleting(true);

    try {
      await deleteMember(member.id);
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete member");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <li className="theme-card rounded-[24px] border p-4 shadow-[0_14px_26px_rgba(118,60,145,0.08)]">
        <form onSubmit={handleSubmit(onSave)} autoComplete="off" className="space-y-3">
          <div className="space-y-1">
            <label className="theme-heading block text-sm font-bold">Member name</label>
            <input
              {...register("name")}
              autoComplete="off"
              className="theme-input w-full rounded-[20px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="theme-heading block text-sm font-bold">Email</label>
            <input
              type="email"
              {...register("email")}
              autoComplete="off"
              className="theme-input w-full rounded-[20px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-brand-button rounded-full px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                reset({ name: member.name, email: member.email ?? "" });
                setActionError(null);
                setIsEditing(false);
              }}
              className="theme-button-secondary rounded-full border px-4 py-2.5 text-sm font-medium transition hover:bg-white/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="theme-card rounded-[24px] border p-4 shadow-[0_14px_26px_rgba(118,60,145,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="theme-heading text-lg font-extrabold tracking-[-0.02em]">{member.name}</p>
          {member.email && <p className="theme-muted">{member.email}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="theme-button-secondary rounded-full border px-4 py-2.5 text-sm font-semibold shadow-[0_12px_24px_rgba(118,60,145,0.1)] transition hover:-translate-y-0.5"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full border border-rose-300/60 bg-[linear-gradient(135deg,#fff1f5,#ffe2ea)] px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-[0_12px_24px_rgba(225,29,72,0.08)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
    </li>
  );
}

export function ManageMembersList({ members }: ManageMembersListProps) {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {members.length === 0 && <li className="theme-muted">No members added yet.</li>}
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </ul>
  );
}
