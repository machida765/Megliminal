import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/** 開発時のローカル Supabase（http/ws）を connect-src に許可する */
function getDevSupabaseConnectSrc(): string {
  if (isProduction) return "";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";

  try {
    const parsed = new URL(url);
    const isLocal =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isLocal || parsed.protocol !== "http:") return "";

    const wsOrigin = parsed.origin.replace(/^http/, "ws");
    return ` ${parsed.origin} ${wsOrigin}`;
  } catch {
    return "";
  }
}

const devSupabaseConnectSrc = getDevSupabaseConnectSrc();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self' https: wss:${devSupabaseConnectSrc}`,
  "media-src 'self' https:",
  "worker-src 'self' blob:",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
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
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // クライアントに Node の vm を載せると eval が走り、本番 CSP に弾かれる
  turbopack: {
    resolveAlias: {
      vm: './lib/stubs/vm.ts',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve ??= {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        vm: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
