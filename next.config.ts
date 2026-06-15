import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"], // moved out of experimental
  turbopack: {}, // silences the webpack/turbopack conflict warning
};

export default nextConfig;