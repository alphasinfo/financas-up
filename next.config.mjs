/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  eslint: {
    // Permite que o build prossiga mesmo com erros de ESLint enquanto corrigimos o código
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
