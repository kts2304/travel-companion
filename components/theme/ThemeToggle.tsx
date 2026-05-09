"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "travel-companion-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const resolvedTheme = storedTheme === "dark" ? "dark" : "light";
    setTheme(resolvedTheme);
    applyTheme(resolvedTheme);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="fixed right-4 top-4 z-[70] inline-flex items-center gap-2 rounded-full border border-white/60 bg-[var(--button-secondary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-secondary-text)] shadow-[0_14px_28px_rgba(118,60,145,0.14)] backdrop-blur transition hover:-translate-y-0.5 sm:right-6 sm:top-6"
      aria-label={`Switch to ${nextTheme} theme`}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/12">
        {theme === "light" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3v2.5M12 18.5V21M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M3 12h2.5M18.5 12H21M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5z" />
          </svg>
        )}
      </span>
      {theme === "light" ? "Dark theme" : "Light theme"}
    </button>
  );
}
