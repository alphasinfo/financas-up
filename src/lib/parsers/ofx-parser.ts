// Parser para arquivos OFX (Open Financial Exchange)

export interface TransacaoOFX {
  data: Date;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  documento?: string;
}

export function parseOFX(conteudo: string): TransacaoOFX[] {
  const transacoes: TransacaoOFX[] = [];

  try {
    // Extrair transações do OFX
    const transacoesMatch = conteudo.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/g);

    if (!transacoesMatch) {
      throw new Error("Nenhuma transação encontrada no arquivo OFX");
    }

    transacoesMatch.forEach((transacaoStr) => {
      // Extrair tipo
      const tipoMatch = transacaoStr.match(/<TRNTYPE>(.*?)<\/TRNTYPE>/);
      const tipo = tipoMatch ? tipoMatch[1] : "";

      // Extrair data
      const dataMatch = transacaoStr.match(/<DTPOSTED>(.*?)<\/DTPOSTED>/);
      const dataStr = dataMatch ? dataMatch[1] : "";
      const ano = parseInt(dataStr.substring(0, 4));
      const mes = parseInt(dataStr.substring(4, 6)) - 1;
      const dia = parseInt(dataStr.substring(6, 8));
      const data = new Date(ano, mes, dia);

      // Extrair valor
      const valorMatch = transacaoStr.match(/<TRNAMT>(.*?)<\/TRNAMT>/);
      const valorOriginal = valorMatch ? parseFloat(valorMatch[1]) : 0;
      const valor = Math.abs(valorOriginal);

      // Extrair descrição
      const descricaoMatch = transacaoStr.match(/<MEMO>(.*?)<\/MEMO>/);
      const descricao = descricaoMatch ? descricaoMatch[1].trim() : "Transação sem descrição";

      // Extrair documento (opcional)
      const documentoMatch = transacaoStr.match(/<CHECKNUM>(.*?)<\/CHECKNUM>/);
      const documento = documentoMatch ? documentoMatch[1] : undefined;

      // Determinar se é receita ou despesa baseado no tipo OFX ou no sinal do valor
      const isReceita = tipo === "CREDIT" || tipo === "DEP" || valorOriginal > 0;
      const tipoTransacao: "RECEITA" | "DESPESA" = isReceita ? "RECEITA" : "DESPESA";

      transacoes.push({
        data,
        descricao,
        valor,
        tipo: tipoTransacao,
        documento,
      });
    });

    return transacoes;
  } catch (error) {
    console.error("Erro ao parsear OFX:", error);
    throw new Error("Erro ao processar arquivo OFX. Verifique se o formato está correto.");
  }
}
