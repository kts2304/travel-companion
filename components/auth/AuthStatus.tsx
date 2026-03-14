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
      <div className="rounded-xl border border-slate-700 bg-slate-900/85 px-4 py-2 text-sm text-slate-300">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
        Not signed in
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100">
        Signed in as {user.email ?? "unknown"}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={isSigningOut}
        className="rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-white disabled:opacity-60"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
