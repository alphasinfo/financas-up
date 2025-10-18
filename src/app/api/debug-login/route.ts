import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 🔒 SEGURANÇA: Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { erro: 'Not found' },
      { status: 404 }
    );
  }

  try {
    const { email, senha } = await request.json();

    console.log('🔍 Debug Login - Email:', email);

    // 1. Verificar conexão com banco
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexão com banco OK');
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      return NextResponse.json({
        erro: 'Erro de conexão com banco',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 });
    }

    // 2. Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        criadoEm: true,
      }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado:', email);
      
      // Listar usuários disponíveis (apenas emails)
      const usuarios = await prisma.usuario.findMany({
        select: { email: true }
      });
      
      return NextResponse.json({
        erro: 'Usuário não encontrado',
        email: email,
        usuariosDisponiveis: usuarios.map(u => u.email)
      }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', usuario.email);

    // 3. Verificar senha
    if (!usuario.senha) {
      console.log('❌ Usuário sem senha');
      return NextResponse.json({
        erro: 'Usuário sem senha cadastrada',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          criadoEm: usuario.criadoEm
        }
      }, { status: 400 });
    }

    const senhaValida = await compare(senha, usuario.senha);

    if (!senhaValida) {
      console.log('❌ Senha inválida');
      return NextResponse.json({
        erro: 'Senha incorreta',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          criadoEm: usuario.criadoEm
        }
      }, { status: 401 });
    }

    console.log('✅ Senha válida!');

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Credenciais válidas! O problema não está nas credenciais.',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        criadoEm: usuario.criadoEm
      },
      diagnostico: {
        conexaoBanco: 'OK',
        usuarioEncontrado: 'OK',
        senhaValida: 'OK',
        possiveisProblemas: [
          'NextAuth pode estar com configuração incorreta',
          'Cookies podem estar bloqueados',
          'NEXTAUTH_SECRET pode estar diferente',
          'NEXTAUTH_URL pode estar incorreto'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return NextResponse.json({
      erro: 'Erro interno',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
