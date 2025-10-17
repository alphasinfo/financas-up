// Parser para arquivos XML (Extratos bancários)

export interface TransacaoXML {
  data: Date;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  documento?: string;
}

export function parseXML(conteudo: string): TransacaoXML[] {
  const transacoes: TransacaoXML[] = [];

  try {
    // Parser simples de XML (sem dependências externas)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(conteudo, "text/xml");

    // Verificar erros de parsing
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Arquivo XML inválido");
    }

    // Buscar transações (suporta diferentes formatos)
    const transacoesNodes = xmlDoc.querySelectorAll("Transacao, transacao, Lancamento, lancamento, Movimento, movimento");

    if (transacoesNodes.length === 0) {
      throw new Error("Nenhuma transação encontrada no arquivo XML");
    }

    transacoesNodes.forEach((node) => {
      // Extrair data
      const dataNode = node.querySelector("Data, data, DataMovimento, dataMovimento");
      const dataStr = dataNode?.textContent || "";
      let data: Date;

      if (dataStr.includes("/")) {
        const [dia, mes, ano] = dataStr.split("/");
        data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else if (dataStr.includes("-")) {
        data = new Date(dataStr);
      } else {
        // Formato YYYYMMDD
        const ano = parseInt(dataStr.substring(0, 4));
        const mes = parseInt(dataStr.substring(4, 6)) - 1;
        const dia = parseInt(dataStr.substring(6, 8));
        data = new Date(ano, mes, dia);
      }

      // Extrair descrição
      const descricaoNode = node.querySelector("Descricao, descricao, Historico, historico, Memo, memo");
      const descricao = descricaoNode?.textContent?.trim() || "Transação sem descrição";

      // Extrair valor
      const valorNode = node.querySelector("Valor, valor, ValorMovimento, valorMovimento");
      const valorStr = valorNode?.textContent || "0";
      const valorOriginal = parseFloat(valorStr.replace(",", "."));
      const valor = Math.abs(valorOriginal);

      // Extrair tipo
      const tipoNode = node.querySelector("Tipo, tipo, TipoMovimento, tipoMovimento");
      const tipoStr = tipoNode?.textContent?.toLowerCase() || "";
      
      // Determinar tipo baseado no campo tipo ou no sinal do valor
      let isReceita: boolean;
      if (tipoStr) {
        isReceita = tipoStr.includes("c") || tipoStr.includes("crédito") || tipoStr.includes("receita") || tipoStr.includes("entrada");
      } else {
        // Se não tem campo tipo, usar o sinal do valor
        isReceita = valorOriginal > 0;
      }
      const tipo: "RECEITA" | "DESPESA" = isReceita ? "RECEITA" : "DESPESA";

      // Extrair documento (opcional)
      const documentoNode = node.querySelector("Documento, documento, NumeroDocumento, numeroDocumento");
      const documento = documentoNode?.textContent?.trim() || undefined;

      transacoes.push({
        data,
        descricao,
        valor,
        tipo,
        documento,
      });
    });

    return transacoes;
  } catch (error) {
    console.error("Erro ao parsear XML:", error);
    throw new Error("Erro ao processar arquivo XML. Verifique se o formato está correto.");
  }
}
