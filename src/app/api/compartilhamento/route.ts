import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

const compartilharSchema = z.object({
  email: z.string().email("Email inválido"),
  tipo: z.enum(["CONTA", "CARTAO", "SISTEMA"]),
  recursoId: z.string().optional(),
  permissao: z.enum(["VISUALIZAR", "EDITAR", "ADMIN"]).default("VISUALIZAR"),
});

// Criar convite de compartilhamento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log('📨 Dados recebidos:', body);
    
    const validacao = compartilharSchema.safeParse(body);

    if (!validacao.success) {
      console.error('❌ Erro de validação:', validacao.error.errors);
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, tipo, recursoId, permissao } = validacao.data;

    // Verificar se o usuário não está tentando compartilhar com si mesmo
    if (email === session.user.email) {
      return NextResponse.json(
        { erro: "Você não pode compartilhar com si mesmo" },
        { status: 400 }
      );
    }

    // Verificar se o recurso existe e pertence ao usuário
    if (tipo === "CONTA" && recursoId) {
      const conta = await prisma.contaBancaria.findFirst({
        where: {
          id: recursoId,
          usuarioId: session.user.id,
        },
      });

      if (!conta) {
        return NextResponse.json(
          { erro: "Conta não encontrada" },
          { status: 404 }
        );
      }
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Criar convite (expira em 7 dias)
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    console.log('✅ Criando convite com dados:', {
      email,
      tipo,
      recursoId,
      permissao,
      criadoPor: session.user.id,
    });

    const convite = await prisma.conviteCompartilhamento.create({
      data: {
        email,
        tipo,
        recursoId,
        permissao,
        token,
        criadoPor: session.user.id,
        expiraEm,
      },
      include: {
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Convite criado:', convite.id);

    // Enviar email com link de convite usando a configuração do usuário
    const linkConvite = `${process.env.NEXTAUTH_URL}/convite/${token}`;

    // Gerar HTML do convite
    const htmlConvite = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Você foi convidado!</h1>
            </div>
            <div class="content">
              <p>Olá!</p>
              <p><strong>${convite.criador.nome}</strong> (${convite.criador.email}) convidou você para acessar o <strong>Finanças Up</strong>.</p>
              
              <div class="info">
                <p><strong>Tipo de acesso:</strong> ${convite.tipo === 'SISTEMA' ? 'Sistema Completo' : convite.tipo}</p>
                <p><strong>Permissão:</strong> ${convite.permissao === 'VISUALIZAR' ? '👁️ Visualizar' : convite.permissao === 'EDITAR' ? '✏️ Editar' : '🛡️ Admin'}</p>
                <p><strong>Válido até:</strong> ${new Date(convite.expiraEm).toLocaleDateString('pt-BR')}</p>
              </div>

              <p>Clique no botão abaixo para aceitar o convite:</p>
              
              <div style="text-align: center;">
                <a href="${linkConvite}" class="button">Aceitar Convite</a>
              </div>

              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Ou copie e cole este link no seu navegador:<br>
                <code>${linkConvite}</code>
              </p>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Finanças Up - Sistema de Gestão Financeira</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email usando a função que verifica todas as configurações
    try {
      const { enviarEmail } = await import('@/lib/email');
      
      const resultado = await enviarEmail({
        para: convite.email,
        assunto: `${convite.criador.nome} convidou você para o Finanças Up`,
        html: htmlConvite,
        usuarioId: session.user.id, // Usa a configuração do usuário logado
      });

      if (resultado.success) {
        console.log('✅ Email de convite enviado para:', convite.email);
      } else {
        console.warn('⚠️ Não foi possível enviar email:', resultado.error);
      }
    } catch (emailError: any) {
      console.error('❌ Erro ao enviar email:', emailError);
      // Não falha a requisição se o email não for enviado
    }

    return NextResponse.json({
      sucesso: true,
      convite: {
        id: convite.id,
        email: convite.email,
        tipo: convite.tipo,
        permissao: convite.permissao,
        linkConvite,
        expiraEm: convite.expiraEm,
      },
      mensagem: "Convite criado com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar convite:", error);
    console.error("❌ Stack:", error.stack);
    return NextResponse.json(
      { erro: error.message || "Erro ao criar convite" },
      { status: 500 }
    );
  }
}

// Listar compartilhamentos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Buscar compartilhamentos criados pelo usuário
    const compartilhamentosCriados = await prisma.compartilhamentoConta.findMany({
      where: {
        criadoPor: session.user.id,
        ativo: true,
      },
      include: {
        conta: {
          select: {
            id: true,
            nome: true,
            instituicao: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Buscar compartilhamentos recebidos
    const compartilhamentosRecebidos = await prisma.compartilhamentoConta.findMany({
      where: {
        usuarioId: session.user.id,
        ativo: true,
      },
      include: {
        conta: {
          select: {
            id: true,
            nome: true,
            instituicao: true,
          },
        },
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Buscar convites pendentes
    const convitesPendentes = await prisma.conviteCompartilhamento.findMany({
      where: {
        OR: [
          { criadoPor: session.user.id },
          { email: session.user.email },
        ],
        aceito: false,
        expiraEm: {
          gt: new Date(),
        },
      },
      include: {
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      compartilhamentosCriados,
      compartilhamentosRecebidos,
      convitesPendentes,
    });
  } catch (error: any) {
    console.error("Erro ao listar compartilhamentos:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao listar compartilhamentos" },
      { status: 500 }
    );
  }
}
