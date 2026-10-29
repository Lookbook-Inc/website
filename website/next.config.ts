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
        // Keep existing Balboa QR codes working for O’Reilly’s.
        source: '/halloween',
        has: [{ type: 'query', key: 'spot', value: 'balboa' }],
        destination: '/halloween?spot=oreillys',
        permanent: false,
      },
      {
        // Keep existing Bar Darling QR codes working for Franko & Friends.
        source: '/halloween',
        has: [{ type: 'query', key: 'spot', value: 'bardarling' }],
        destination: '/halloween?spot=franko',
        permanent: false,
      },
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
