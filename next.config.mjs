/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy (Sprint 0).
 * Notes on the 'unsafe-inline' allowances:
 *  - script-src: the pre-paint theme script is inline, and Next injects a small
 *    inline bootstrap. Tightening to nonces is a Sprint 4 follow-up.
 *  - style-src: Leaflet + our divIcon markers set inline styles extensively.
 *  - img-src https: allows external cafe photos (Wikimedia / provider CDNs) and
 *    OSM tiles; user uploads are same-origin.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=(), interest-cohort=()",
          },
          // HSTS only meaningful over HTTPS; harmless otherwise. 1 year.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
