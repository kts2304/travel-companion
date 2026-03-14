"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { exchangeOAuthCodeForSession, getCurrentAuthUser } from "@/services/authService";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let isMounted = true;

    async function finalizeAuth() {
      const currentUrl = new URL(window.location.href);
      const errorDescription = currentUrl.searchParams.get("error_description");
      const error = currentUrl.searchParams.get("error");
      const code = currentUrl.searchParams.get("code");

      if (error || errorDescription) {
        if (!isMounted) {
          return;
        }

        setMessage(errorDescription ?? error ?? "GitHub sign-in failed.");
        return;
      }

      try {
        if (code) {
          await exchangeOAuthCodeForSession(code);
        }

        const user = await getCurrentAuthUser();
        if (!isMounted) {
          return;
        }

        if (user) {
          setMessage(`Signed in as ${user.email ?? "your account"}. Redirecting...`);
          router.replace("/");
          return;
        }

        setMessage("No active session found yet. Return home and try again.");
      } catch (authError) {
        if (!isMounted) {
          return;
        }

        setMessage(authError instanceof Error ? authError.message : "Unable to complete sign-in.");
      }
    }

    void finalizeAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[32px] border border-slate-700/90 bg-[#020b16]/95 px-6 py-7 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Travel Companion
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">GitHub Sign-In</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-white"
          >
            Back home
          </Link>
        </section>
      </div>
    </main>
  );
}
