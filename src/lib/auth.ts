import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
        manterLogado: { label: "Manter Logado", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.senha) {
            console.log('❌ Credenciais incompletas');
            return null;
          }

          console.log('🔍 Buscando usuário:', credentials.email);

          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email }
          });

          if (!usuario) {
            console.log('❌ Usuário não encontrado:', credentials.email);
            return null;
          }

          if (!usuario.senha) {
            console.log('❌ Usuário sem senha cadastrada:', credentials.email);
            return null;
          }

          console.log('🔐 Verificando senha...');
          const senhaValida = await compare(credentials.senha, usuario.senha);

          if (!senhaValida) {
            console.log('❌ Senha inválida para:', credentials.email);
            return null;
          }

          console.log('✅ Login bem-sucedido:', credentials.email);

          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nome,
            image: usuario.imagem || undefined,
            manterLogado: credentials.manterLogado === "true",
          };
        } catch (error) {
          console.error('❌ Erro no authorize:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 ano para PWA
    updateAge: 7 * 24 * 60 * 60, // Atualiza a cada 7 dias
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        console.log('✅ JWT callback - Adicionando user ao token:', user.email);
        token.id = user.id;
        token.email = user.email;
        // Armazenar timestamp de criação do token
        if (!token.createdAt) {
          token.createdAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('✅ Session callback - Criando sessão para:', token.email);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('✅ SignIn callback - Usuário autenticado:', user.email);
      return true; // Permitir login
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60, // 1 ano para PWA
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
  // Debug em produção
  debug: true,
  // Configurações de eventos para debug
  events: {
    async signIn(message) {
      console.log('🎉 Evento signIn:', message.user.email);
    },
    async signOut(message) {
      console.log('👋 Evento signOut');
    },
    async createUser(message) {
      console.log('👤 Evento createUser:', message.user.email);
    },
    async session(message) {
      console.log('📝 Evento session:', message.session.user?.email);
    },
  },
};
