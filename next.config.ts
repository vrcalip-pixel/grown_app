import type { NextConfig } from "next";

// Two places publish this app:
//  - Vercel builds it as a normal Next.js app, including the /api/guide server route.
//  - GitHub Pages can only serve plain files, so that build (GITHUB_PAGES=1) exports
//    a static copy under /grown_app. The publish workflow removes the server route
//    first, which leaves Ask Grown with its built-in answers and no AI layer.
const pages = process.env.GITHUB_PAGES === "1";

// The read-aloud button fetches its clips by address, so it needs to know the /grown_app prefix.
const config: NextConfig = pages
  ? { output: "export", basePath: "/grown_app", trailingSlash: true, images: { unoptimized: true }, env: { NEXT_PUBLIC_BASE_PATH: "/grown_app" } }
  : { env: { NEXT_PUBLIC_BASE_PATH: "" } };

export default config;
