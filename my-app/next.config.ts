import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwxroyturlmkkbrnpysv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/dog-images/**',
      },
    ],
  },
};

export default nextConfig;
