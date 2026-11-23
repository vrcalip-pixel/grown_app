import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so a visit never calls Google.
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Grown: Ticket Help",
  description: "A letter showed up. Grown asks a few plain questions and tells you your next move.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        {/* The breathing background. Decoration only: hidden from screen readers, never in the way of a tap. */}
        <div className="breath" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        {children}
      </body>
    </html>
  );
}
