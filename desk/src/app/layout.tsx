import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// Self-hosted by next/font: no request to Google at runtime, and the family names are stable
// across the two CSS variables On Air uses.
const barlow = Barlow({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"] });
const condensed = Barlow_Condensed({ subsets: ["latin", "latin-ext"], weight: ["600", "800"] });

export const metadata: Metadata = { title: "Study Desk", description: "The homework desk on the TV — prototype" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const vars = { "--body": `${barlow.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`, "--display": `${condensed.style.fontFamily}, "Arial Narrow", sans-serif` } as React.CSSProperties;
  return (
    <html lang="en">
      <body style={vars}>{children}</body>
    </html>
  );
}
