import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // In newer Next.js versions, this is now a top-level property
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/client/*.node'],
  },
};

export default nextConfig;