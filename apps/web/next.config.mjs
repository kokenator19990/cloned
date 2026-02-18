/** @type {import('next').NextConfig} */
const isGhPages = process.env.GH_PAGES === 'true';

const nextConfig = isGhPages
  ? {
    output: 'export',
    basePath: '/cloned',
    assetPrefix: '/cloned',
    images: {
      unoptimized: true,
    },
  }
  : {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/:path*',
        },
      ];
    },
  };

export default nextConfig;
