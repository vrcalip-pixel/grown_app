import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Haptics } from "@/components/Haptics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { checkedIso, loadPack } from "@/pack/load";
import "./globals.css";

// Self-hosted at build time, so a visit never calls Google.
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Grown: clear steps for adult paperwork",
  description: "Nobody hands you a manual for this. Grown asks a few plain questions and tells you your next move.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ticket = loadPack("traffic-ticket-long-beach");
  if (ticket.status !== "live") throw new Error("The ticket guide must be live");

  return (
    <html lang="en" className={manrope.variable}>
      <body>
        {/* The background scene. Decoration only: hidden from screen readers, never in the way of a tap. */}
        <div className="breath" aria-hidden="true">
          <span className="motes" />
          <span className="motes b" />
          <span className="spark" />
          <span className="horizon" />
        </div>
        <Haptics />
        <LanguageProvider>
          <SiteHeader />
          {children}
          <SiteFooter checkedIso={checkedIso(ticket)} version={ticket.version} />
        </LanguageProvider>
      </body>
    </html>
  );
}
