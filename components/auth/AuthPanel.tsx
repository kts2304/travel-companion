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
    <section className="rounded-[28px] border border-slate-700/90 bg-[#020b16]/95 p-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            App Access
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Sign in to unlock My Travel</h2>
        </div>
      </div>

      {isLoadingUser ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">Checking current session...</p>
      ) : currentUser ? (
        <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <p className="text-sm font-medium text-cyan-100">
            Signed in as {currentUser.email ?? "your account"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            You can go ahead and create or open a trip. Personal travel items will use this account
            for traveler matching.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-white disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign out of app"}
            </button>
            <p className="text-xs leading-5 text-slate-400">
              This signs you out of Travel Companion only, not GitHub itself.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-slate-300">
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
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === authMode
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-900/80 text-slate-200 hover:bg-slate-800"
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
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/60 hover:text-cyan-100 disabled:opacity-60"
            >
              {isGitHubLoading ? "Redirecting to GitHub..." : "Continue with GitHub"}
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Recommended if your Supabase project already uses GitHub for auth.
            </p>
          </div>

          <form onSubmit={onSubmit} autoComplete="off" className="mt-5 space-y-4">
            <div className="space-y-1">
              <label htmlFor="auth-email" className="block text-sm font-medium text-slate-100">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                autoComplete="off"
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-cyan-300 focus:ring-2"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-100">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#06111d] p-2.5 text-white outline-none ring-cyan-300 focus:ring-2"
              />
            </div>

            {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
            {statusMessage && <p className="text-sm text-emerald-300">{statusMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 shadow-[0_0_36px_rgba(54,211,255,0.22)] transition hover:bg-cyan-300 disabled:opacity-60"
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
