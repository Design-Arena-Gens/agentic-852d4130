/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "agentic-852d4130.vercel.app"]
    }
  }
};

export default nextConfig;
