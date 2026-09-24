import type { Metadata } from "next";
import "./globals.css";
import "./participant.css";
import "./tvl-corrections.css";
import "./flow.css";
import "./restored-live.css";
import "./revision-2026-09-24.css";

export const metadata: Metadata = {
  title: "COTO · Digitální pracovní list TVL",
  description: "První funkční varianta PN – Průzkum názorů.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
