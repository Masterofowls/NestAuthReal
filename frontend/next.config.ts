import type { NextConfig } from "next";

const authBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:3000";
const authBasePath =
  process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? "/api/auth";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: `${authBasePath}/:path*`,
        destination: `${authBaseUrl}${authBasePath}/:path*`,
      },
    ];
  },
};

export default nextConfig;
