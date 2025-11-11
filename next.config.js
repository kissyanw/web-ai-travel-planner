/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [
      'restapi.amap.com',
      'webapi.amap.com',
      'upload.wikimedia.org',
      'images.unsplash.com',
      'images.pexels.com',
      'www.pexels.com',
      'lh3.googleusercontent.com',
      'www.bing.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
    ],
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
