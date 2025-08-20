/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3002",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "dev-secret-key",
  },
}

module.exports = nextConfig
