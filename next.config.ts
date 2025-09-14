import type { NextConfig } from "next";
const withPWA = require("next-pwa");


const nextConfig: NextConfig = withPWA({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  pwa:{
    dest:"public",
    register: true,
    skipWaiting: true
  }
});

export default nextConfig;