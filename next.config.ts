import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // В dev-режиме проксируем /api/* на локальный бэкенд
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
