import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validacao = cadastroSchema.safeParse(body);
    
    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { nome, email, senha } = validacao.data;

    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { erro: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await hash(senha, 12);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });

    // Criar categorias padrão para o novo usuário
    const categoriasPadrao = [
      // Despesas
      { nome: "Alimentação", tipo: "DESPESA", cor: "#EF4444", icone: "🍔" },
      { nome: "Transporte", tipo: "DESPESA", cor: "#F59E0B", icone: "🚗" },
      { nome: "Moradia", tipo: "DESPESA", cor: "#8B5CF6", icone: "🏠" },
      { nome: "Saúde", tipo: "DESPESA", cor: "#EC4899", icone: "🏥" },
      { nome: "Educação", tipo: "DESPESA", cor: "#3B82F6", icone: "📚" },
      { nome: "Lazer", tipo: "DESPESA", cor: "#10B981", icone: "🎮" },
      { nome: "Vestuário", tipo: "DESPESA", cor: "#6366F1", icone: "👔" },
      { nome: "Outros", tipo: "DESPESA", cor: "#6B7280", icone: "📦" },
      // Receitas
      { nome: "Salário", tipo: "RECEITA", cor: "#10B981", icone: "💰" },
      { nome: "Freelance", tipo: "RECEITA", cor: "#3B82F6", icone: "💼" },
      { nome: "Investimentos", tipo: "RECEITA", cor: "#8B5CF6", icone: "📈" },
      { nome: "Outros", tipo: "RECEITA", cor: "#6B7280", icone: "💵" },
    ];

    await prisma.categoria.createMany({
      data: categoriasPadrao.map((cat) => ({
        ...cat,
        usuarioId: usuario.id,
      })),
    });

    return NextResponse.json(
      { mensagem: "Usuário criado com sucesso", usuario },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
