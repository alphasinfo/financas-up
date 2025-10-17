import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseOFX } from "@/lib/parsers/ofx-parser";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseXML } from "@/lib/parsers/xml-parser";
import { parseCNAB } from "@/lib/parsers/cnab-parser";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const arquivo = formData.get("arquivo") as File;
    const tipoArquivo = formData.get("tipo") as string;

    if (!arquivo) {
      return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Ler conteúdo do arquivo
    const conteudo = await arquivo.text();

    let transacoes;

    // Parsear baseado no tipo
    switch (tipoArquivo) {
      case "OFX":
        transacoes = parseOFX(conteudo);
        break;
      case "CSV":
        transacoes = parseCSV(conteudo);
        break;
      case "XML":
        transacoes = parseXML(conteudo);
        break;
      case "CNAB":
        transacoes = parseCNAB(conteudo);
        break;
      default:
        return NextResponse.json({ erro: "Tipo de arquivo não suportado" }, { status: 400 });
    }

    // Retornar transações parseadas para revisão
    return NextResponse.json({
      sucesso: true,
      quantidade: transacoes.length,
      transacoes,
    });
  } catch (error: any) {
    console.error("Erro ao processar arquivo:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao processar arquivo" },
      { status: 400 }
    );
  }
}
