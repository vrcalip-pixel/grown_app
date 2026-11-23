import type { NextConfig } from "next";

// Two places publish this app:
//  - Vercel builds it as a normal Next.js app, including the /api/guide server route.
//  - GitHub Pages can only serve plain files, so that build (GITHUB_PAGES=1) exports
//    a static copy under /grown_app. The publish workflow removes the server route
//    first, which leaves Ask Grown with its built-in answers and no AI layer.
const pages = process.env.GITHUB_PAGES === "1";

const config: NextConfig = pages
  ? { output: "export", basePath: "/grown_app", trailingSlash: true, images: { unoptimized: true } }
  : {};

export default config;
