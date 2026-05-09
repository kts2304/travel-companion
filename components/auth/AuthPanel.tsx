"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getCurrentAuthUser,
  signInWithEmail,
  signInWithGitHub,
  signOutCurrentUser,
  signUpWithEmail,
  subscribeToAuthState,
  type AuthUserSummary,
} from "@/services/authService";

type AuthMode = "sign-in" | "sign-up";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUserSummary | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const user = await getCurrentAuthUser();
      if (!isMounted) {
        return;
      }

      setCurrentUser(user);
      setIsLoadingUser(false);
    }

    void loadUser();
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
      setIsLoadingUser(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (mode === "sign-up") {
        await signUpWithEmail(email, password);
        setStatusMessage(
          "Account created. If email confirmation is enabled in Supabase, confirm it before signing in.",
        );
      } else {
        await signInWithEmail(email, password);
        setStatusMessage("Signed in. Your personal travel view is now available.");
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to continue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGitHubSignIn = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsGitHubLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const githubUrl = await signInWithGitHub(redirectTo);
      window.location.assign(githubUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in with GitHub");
      setIsGitHubLoading(false);
    }
  };

  const onSignOut = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSigningOut(true);

    try {
      await signOutCurrentUser();
      setStatusMessage("Signed out of Travel Companion.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <section className="theme-card overflow-hidden rounded-[34px] border p-5 shadow-[0_22px_40px_rgba(118,60,145,0.14)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="theme-muted text-xs font-semibold uppercase tracking-[0.24em]">
            App Access
          </p>
          <h2 className="theme-heading mt-2 text-2xl font-black tracking-[-0.04em]">
            Sign in to unlock My Travel
          </h2>
        </div>
      </div>

      {isLoadingUser ? (
        <p className="theme-muted mt-3 text-sm leading-6">Checking current session...</p>
      ) : currentUser ? (
        <div className="theme-card mt-4 rounded-[24px] border p-4 shadow-[0_16px_28px_rgba(118,60,145,0.1)]">
          <p className="theme-heading text-sm font-medium">
            Signed in as {currentUser.email ?? "your account"}
          </p>
          <p className="theme-muted mt-2 text-sm leading-6">
            You can go ahead and create or open a trip. Personal travel items will use this account
            for traveler matching.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="theme-brand-button rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign out of app"}
            </button>
            <p className="theme-muted text-xs leading-5">
              This signs you out of Travel Companion only, not GitHub itself.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="theme-muted mt-3 text-sm leading-6">
            Use the same email that you add as a trip member. That is how the app knows which
            personal ticket belongs to you.
          </p>

          <div className="mt-5 flex gap-2">
            {(["sign-in", "sign-up"] as AuthMode[]).map((authMode) => (
              <button
                key={authMode}
                type="button"
                onClick={() => {
                  setMode(authMode);
                  setErrorMessage(null);
                  setStatusMessage(null);
                }}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === authMode
                    ? "theme-strong-surface text-white shadow-[0_16px_28px_rgba(39,4,58,0.16)]"
                    : "theme-button-secondary border hover:bg-white/80"
                }`}
              >
                {authMode === "sign-in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onGitHubSignIn}
              disabled={isGitHubLoading || isSubmitting}
              className="theme-brand-button inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isGitHubLoading ? "Redirecting to GitHub..." : "Continue with GitHub"}
            </button>
            <p className="theme-muted mt-2 text-xs leading-5">
              Recommended if your Supabase project already uses GitHub for auth.
            </p>
          </div>

          <form onSubmit={onSubmit} autoComplete="off" className="mt-5 space-y-4">
            <div className="space-y-1">
              <label htmlFor="auth-email" className="theme-heading block text-sm font-bold">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                autoComplete="off"
                onChange={(event) => setEmail(event.target.value)}
                className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="auth-password" className="theme-heading block text-sm font-bold">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                className="theme-input w-full rounded-[22px] border p-3 outline-none ring-fuchsia-300 focus:ring-2"
              />
            </div>

            {errorMessage && <p className="text-sm text-rose-700">{errorMessage}</p>}
            {statusMessage && <p className="text-sm text-emerald-700">{statusMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-brand-button rounded-full px-5 py-3 font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting
                ? mode === "sign-in"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
