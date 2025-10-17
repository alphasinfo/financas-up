import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
        manterLogado: { label: "Manter Logado", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email }
        });

        if (!usuario || !usuario.senha) {
          return null;
        }

        const senhaValida = await compare(credentials.senha, usuario.senha);

        if (!senhaValida) {
          return null;
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          image: usuario.imagem || undefined,
          manterLogado: credentials.manterLogado === "true",
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60, // 90 dias para garantir persistência
    updateAge: 24 * 60 * 60, // Atualiza a cada 24 horas
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger: _trigger, account: _account }) {
      if (user) {
        token.id = user.id;
        // Armazenar timestamp de criação do token
        if (!token.createdAt) {
          token.createdAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Permitir em localhost
        maxAge: 90 * 24 * 60 * 60, // 90 dias
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
  },
  // Configurações adicionais para PWA
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
  // Aumentar o tempo de vida do JWT
  jwt: {
    maxAge: 90 * 24 * 60 * 60, // 90 dias
  },
};
