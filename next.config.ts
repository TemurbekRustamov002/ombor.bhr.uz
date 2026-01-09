import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    // Optimizing compilation speed
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
};


export default nextConfig;
