/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings in development
  reactStrictMode: true,
  // Add experimental features to help with hydration
  experimental: {
    // This helps with hydration mismatches
    optimizePackageImports: ['react-icons'],
  },
  // Configure webpack to handle client-side only code
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
