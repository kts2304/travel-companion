"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getCurrentAuthUser,
  signOutCurrentUser,
  subscribeToAuthState,
  type AuthUserSummary,
} from "@/services/authService";

export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const currentUser = await getCurrentAuthUser();
      if (!isMounted) {
        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    }

    void loadUser();
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const onSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutCurrentUser();
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-full border border-white/60 bg-white/68 px-4 py-2 text-sm font-medium text-[#6c567f] shadow-[0_10px_24px_rgba(118,60,145,0.08)]">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-full border border-amber-300/50 bg-[linear-gradient(180deg,rgba(255,248,232,0.96),rgba(255,239,206,0.88))] px-4 py-2 text-sm font-medium text-[#7a4c14] shadow-[0_10px_24px_rgba(214,142,26,0.1)]">
        Not signed in
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-full border border-fuchsia-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,239,250,0.9))] px-4 py-2 text-sm font-medium text-[#5b3a76] shadow-[0_10px_24px_rgba(118,60,145,0.08)]">
        Signed in as {user.email ?? "unknown"}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={isSigningOut}
        className="rounded-full bg-[linear-gradient(135deg,#4a1f68,#7b2b8e)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(74,31,104,0.18)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
