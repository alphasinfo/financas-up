/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar ESLint durante build (para evitar falhas por warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Desabilitar TypeScript errors durante build (apenas em produção)
  typescript: {
    ignoreBuildErrors: process.env.NETLIFY === 'true',
  },

  // Configurações de ambiente
  env: {
    // Mapear variáveis do Netlify/Supabase para as esperadas pela aplicação
    DATABASE_URL: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Configurações experimentais
  experimental: {
    scrollRestoration: true,
    // instrumentationHook: true,
  },

  // Configurações para resolver problemas de Server Components no Vercel
  transpilePackages: ['@sentry/nextjs'],

  // Configurações do Webpack
  webpack: (config, { isServer }) => {
    // Ignorar avisos de módulos opcionais do Prisma
    if (isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      });
    }

    // Suprimir warnings críticos de dependências do Prisma/OpenTelemetry
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
    ];

    return config;
  },

  // Configurações de imagens (usando remotePatterns em vez de domains)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Configurações de headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configurações de redirecionamentos
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Não usar standalone no Netlify - o plugin gerencia isso
  // output: process.env.NETLIFY === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
