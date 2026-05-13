const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  allowedDevOrigins: ['http://192.168.0.177:3000', 'http://localhost:3000'],
  // Explicitly set the project root to this directory
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
