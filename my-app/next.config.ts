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
      {
        protocol: 'https',
        hostname: 'vwxroyturlmkkbrnpysv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/profile/**',
      },
      {
        protocol: 'https',
        hostname: 'vwxroyturlmkkbrnpysv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
  },
};

export default nextConfig;
