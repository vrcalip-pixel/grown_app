import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Haptics } from "@/components/Haptics";
import { SiteHeader } from "@/components/SiteHeader";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { checkedOn, loadPack } from "@/pack/load";
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
        </LanguageProvider>
        <footer>
          <p>
            Grown explains what a document means and what your options are. It is not a lawyer and doesn&apos;t give
            legal advice. Grown never makes up fees or dates. It points you to the amount and due date printed on your
            own ticket or court notice. Facts last checked against official California court sources on{" "}
            {checkedOn(ticket)}.
          </p>
          <p>
            Built by Dr. Vincent Calip for HDA 294/494, The Agentic Self (ASU). Version {ticket.version} · Long Beach,
            CA. Nothing you tap is saved. If you choose to use Ask Grown, your question and the answers you tapped are
            sent to Claude, an AI made by Anthropic, to write a reply. Grown does not store them.
          </p>
        </footer>
      </body>
    </html>
  );
}
