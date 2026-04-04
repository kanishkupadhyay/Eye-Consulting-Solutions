/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"], // whitelist localhost
    // If you use a specific port, you don't need to include it here
    // Next.js handles localhost with any port
  },
};

export default nextConfig;