import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ph/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ph/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/wrapped',
        destination: '/snapshot',
        permanent: true,
      },
      {
        source: '/wrapped/:path*',
        destination: '/snapshot/:path*',
        permanent: true,
      },
    ]
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
