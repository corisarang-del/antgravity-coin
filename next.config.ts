import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/characters/**",
      },
    ],
  },
};

export default nextConfig;
