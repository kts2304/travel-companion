"use client";

import { supabase } from "@/lib/supabaseClient";

export interface AuthUserSummary {
  id: string;
  email: string | null;
}

const AUTH_READ_TIMEOUT_MS = 2500;

async function withAuthTimeout<T>(operation: Promise<T>, fallbackValue: T): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallbackValue), AUTH_READ_TIMEOUT_MS);
    }),
  ]);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInWithGitHub(redirectTo: string): Promise<string> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.url) {
    throw new Error("GitHub sign-in did not return a redirect URL.");
  }

  return data.url;
}

export async function exchangeOAuthCodeForSession(code: string): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutCurrentUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentAuthUser(): Promise<AuthUserSummary | null> {
  const { data, error } = await withAuthTimeout(
    supabase.auth.getSession(),
    { data: { session: null }, error: null },
  );

  if (error) {
    console.warn("[Auth] Unable to fetch current session:", error.message);
    return null;
  }

  const sessionUser = data.session?.user;

  if (!sessionUser) {
    return null;
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email?.trim().toLowerCase() ?? null,
  };
}

export function subscribeToAuthState(
  callback: (user: AuthUserSummary | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email?.trim().toLowerCase() ?? null,
        }
      : null;

    callback(user);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}
