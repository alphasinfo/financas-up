/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configurações para Vercel
  output: 'standalone',
  
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  eslint: {
    // Permite que o build prossiga mesmo com erros de ESLint
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    // Ignora erros de tipo durante build (já corrigidos localmente)
    ignoreBuildErrors: false,
  },
  
  // Otimizações para produção
  swcMinify: true,
  
  // Configuração de imagens
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
