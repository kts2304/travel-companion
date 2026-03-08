import { createClient } from "@supabase/supabase-js";

function getRequiredEnvVar(value: string | undefined, name: string) {
  const normalizedValue = value?.trim();
  if (!normalizedValue) {
    throw new Error(
      `[Supabase Config Error] Missing ${name}. Add it to .env.local and restart the dev server.`,
    );
  }

  return normalizedValue;
}

const supabaseUrl = getRequiredEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);
const supabaseAnonKey = getRequiredEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

if (!supabaseUrl.startsWith("https://")) {
  throw new Error("[Supabase Config Error] NEXT_PUBLIC_SUPABASE_URL must start with https://");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
