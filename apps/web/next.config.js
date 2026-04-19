/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
