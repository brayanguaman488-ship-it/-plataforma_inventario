/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL ||
      (process.env.RAILWAY_PROJECT_ID
        ? 'http://backend.railway.internal:8000'
        : 'http://127.0.0.1:8000');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
