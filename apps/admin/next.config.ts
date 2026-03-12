import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu.ui-avatars.com",
      },
    ],
  },
  reactStrictMode: true,
  devIndicators: false,

  transpilePackages: ["@legacy-apartment/ui"],
};

export default nextConfig;
