/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "dev-secret-key",
  },
}

module.exports = nextConfig
