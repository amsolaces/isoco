import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "pro-firefly-7024.clerk.accounts.dev",
    "*.clerk.accounts.dev",
    "*.accounts.dev",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thdylodefuiqmneblxko.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/woman",
        destination: "/women",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
