import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the Next.js dev-mode indicator badge in the corner of the page.
  devIndicators: false,
  // Fail the production build on type errors; strict TypeScript is a project rule.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
