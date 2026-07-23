import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : "standalone",
  ...(isGithubPages
    ? {
        basePath: "/performai",
        assetPrefix: "/performai/",
      }
    : {}),
};

export default nextConfig;
