import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/COTO-testovac",
  assetPrefix: "/COTO-testovac/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
