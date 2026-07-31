import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  output: isGithubPages ? "export" : "standalone",
  ...(isGithubPages
    ? {
        basePath: "/performai",
        assetPrefix: "/performai/",
      }
    : {}),
};

export default nextConfig;
