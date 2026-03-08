import type { Metadata } from "next";
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
