import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pcsmonthlypla.online";

const nextConfig: NextConfig = {
  // Hostname only (no scheme). Required when accessing `next dev` from a LAN IP.
  allowedDevOrigins: ["192.168.0.169:3000", "192.168.0.169"],

  // HTTP static assets 500 behind Cloudflare; force HTTPS in production.
  async redirects() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: `${appUrl}/:path*`,
        permanent: true,
      },
    ];
  },

  // Add security headers to fix CSP issues
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
          }
        ],
      },
    ]
  },
};

export default nextConfig;