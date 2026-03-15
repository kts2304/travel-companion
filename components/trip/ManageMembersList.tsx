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
      <li className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <form onSubmit={handleSubmit(onSave)} autoComplete="off" className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-100">Member name</label>
            <input
              {...register("name")}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-cyan-300 focus:ring-2"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-100">Email</label>
            <input
              type="email"
              {...register("email")}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-cyan-300 focus:ring-2"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
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
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-white">{member.name}</p>
          {member.email && <p className="text-slate-300">{member.email}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
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
      {members.length === 0 && <li className="text-slate-300">No members added yet.</li>}
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </ul>
  );
}
