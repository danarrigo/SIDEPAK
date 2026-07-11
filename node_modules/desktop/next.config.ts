import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  serverExternalPackages: ["@tailwindcss/postcss", "lightningcss"],
};

export default nextConfig;
