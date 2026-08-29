import type { Metadata } from "next";
import "./globals.css";
import "./participant.css";

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
