import type { Metadata } from "next";
import Script from "next/script";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Companion",
  description: "Track shared trip expenses and balances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var theme = localStorage.getItem('travel-companion-theme');
              document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
            } catch (e) {
              document.documentElement.dataset.theme = 'light';
            }
          `}
        </Script>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
