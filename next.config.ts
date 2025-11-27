import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  serverExternalPackages: ['@prisma/adapter-pg', 'pg', 'bcryptjs'],
};

export default nextConfig;
