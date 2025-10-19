import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credenciais",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
        manterLogado: { label: "Manter Logado", type: "text" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.senha) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Credenciais incompletas');
            }
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Buscando usuário:', credentials.email);
          }

          // Tentar conectar ao banco com retry
          let usuario = null;
          let retries = 3;
          let lastError = null;

          while (retries > 0 && !usuario) {
            try {
              usuario = await prisma.usuario.findUnique({
                where: { email: credentials.email }
              });
              break;
            } catch (error: any) {
              lastError = error;
              retries--;
              
              // Se for erro de conexão, tentar reconectar
              if (error.code === 'P1001' || error.message?.includes("Can't reach database")) {
                console.error(`❌ Erro de conexão com banco (tentativas restantes: ${retries}):`, error.message);
                
                if (retries > 0) {
                  // Aguardar antes de tentar novamente
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Tentar reconectar
                  try {
                    await prisma.$connect();
                  } catch (connectError) {
                    console.error('❌ Erro ao reconectar:', connectError);
                  }
                }
              } else {
                // Outro tipo de erro, não tentar novamente
                throw error;
              }
            }
          }

          if (!usuario) {
            if (lastError) {
              console.error('❌ Falha após múltiplas tentativas:', lastError);
            } else if (process.env.NODE_ENV === 'development') {
              console.log('❌ Usuário não encontrado:', credentials.email);
            }
            return null;
          }

          if (!usuario.senha) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Usuário sem senha cadastrada:', credentials.email);
            }
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Verificando senha...');
          }
          
          const senhaValida = await compare(credentials.senha, usuario.senha);

          if (!senhaValida) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Senha inválida para:', credentials.email);
            }
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Login bem-sucedido:', credentials.email);
          }

          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nome,
            image: usuario.imagem || undefined,
          };
        } catch (error: any) {
          console.error('❌ Erro no authorize:', error);
          
          // Log mais detalhado para erros de conexão
          if (error.code === 'P1001' || error.message?.includes("Can't reach database")) {
            console.error('❌ Erro de conexão com banco de dados');
            console.error('DATABASE_URL configurada:', process.env.DATABASE_URL ? 'Sim' : 'Não');
          }
          
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
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ JWT callback - Adicionando user ao token:', user.email);
        }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Session callback - Criando sessão para:', token.email);
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ SignIn callback - Usuário autenticado:', user.email);
      }
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
  // Debug apenas em desenvolvimento
  debug: process.env.NODE_ENV === 'development',
  // Configurações de eventos para debug
  events: {
    async signIn(message) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎉 Evento signIn:', message.user.email);
      }
    },
    async signOut(message) {
      if (process.env.NODE_ENV === 'development') {
        console.log('👋 Evento signOut');
      }
    },
    async createUser(message) {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 Evento createUser:', message.user.email);
      }
    },
    async session(message) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Evento session:', message.session.user?.email);
      }
    },
  },
};
