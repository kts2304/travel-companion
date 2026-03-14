"use client";

import { supabase } from "@/lib/supabaseClient";

export interface AuthUserSummary {
  id: string;
  email: string | null;
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

export async function signInWithGitHub(redirectTo: string): Promise<void> {
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
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email?.trim().toLowerCase() ?? null,
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
