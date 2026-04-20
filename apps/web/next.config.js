/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone output for Docker — copies minimal node_modules into .next/standalone
  output: 'standalone',

  // Allow importing from monorepo packages
  transpilePackages: [
    '@supperajan/ui',
    '@supperajan/types',
    '@supperajan/config',
    '@supperajan/avatar',
    '@supperajan/realtime',
    '@supperajan/voice',
  ],

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? '0.1.0',
  },

  webpack: (config) => {
    // Required for Three.js in Next.js
    config.externals = config.externals || [];

    // Allow GLSL shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });

    return config;
  },

  // Headers for security
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000';
    const wsUrlWss = wsUrl.replace(/^ws:/, 'wss:');

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed by Three.js/WebGL shaders
      `connect-src 'self' ${apiUrl} ${wsUrl} ${wsUrlWss}`,
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',            value: 'nosniff' },
          { key: 'X-Frame-Options',                   value: 'DENY' },
          { key: 'X-XSS-Protection',                  value: '1; mode=block' },
          { key: 'Referrer-Policy',                   value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',                value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'Strict-Transport-Security',         value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy',           value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
