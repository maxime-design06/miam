import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Par défaut 1 Mo : trop juste pour une recette longue avec une photo.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
