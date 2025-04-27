import type { NextConfig } from "next";

const repoName = "poke-holoswap-fe";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Enable static export
  output: "export",

  // Set the base path for GitHub Pages
  basePath: isProd ? `/${repoName}` : "",

  // Set the asset prefix for correct asset loading (CSS, JS, images)
  assetPrefix: isProd ? `/${repoName}/` : "",

  // Disable Next.js Image Optimization as it doesn't work with static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
