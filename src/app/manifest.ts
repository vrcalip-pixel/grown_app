import type { MetadataRoute } from "next";

// Built once, as a plain file, so it also works on the static GitHub copy.
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * What a phone needs to add Explainer to the home screen as an app: its name,
 * its icon, and the instruction to open full screen without browser bars.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Explainer",
    short_name: "Explainer",
    description: "Clear, step-by-step guidance for the tickets, leases, bills and forms that come with adult life.",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#0a0e13",
    theme_color: "#0a0e13",
    icons: [
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
