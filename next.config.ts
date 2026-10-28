import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: '/expenses', destination: '/dashboard/expenses', permanent: false },
      { source: '/insights', destination: '/dashboard/insights', permanent: false },
      { source: '/settings', destination: '/dashboard/settings', permanent: false },
    ];
  },
};

export default nextConfig;
