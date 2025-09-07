/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the webpack configuration you need
  webpack: (config) => {
    config.externals.push({
      "pg-native": "pg-native",
    });

    return config;
  },
};

// Use 'export default' for .mjs files
export default nextConfig;
