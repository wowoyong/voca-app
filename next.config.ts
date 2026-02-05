import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma configuration
  serverExternalPackages: ["@prisma/client"],

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Compress pages at build time
  compress: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security & cache headers
  async headers() {
    return [
      {
        // HTML pages: always revalidate (so Cloudflare serves fresh content)
        source: "/((?!_next/static|_next/image|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|json|js|css)).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        // Static assets with hash: long cache
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["@/components", "@/lib"],
  },
};

export default nextConfig;
