// Parser para arquivos CNAB 240/400 (Centro Nacional de Automação Bancária)

export interface TransacaoCNAB {
  data: Date;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  documento?: string;
}

export function parseCNAB(conteudo: string): TransacaoCNAB[] {
  const transacoes: TransacaoCNAB[] = [];

  try {
    const linhas = conteudo.split("\n").filter((linha) => linha.trim() !== "");

    if (linhas.length === 0) {
      throw new Error("Arquivo CNAB vazio");
    }

    // Detectar tipo de CNAB (240 ou 400)
    const primeiraLinha = linhas[0];
    const isCNAB240 = primeiraLinha.length >= 240;
    const isCNAB400 = primeiraLinha.length >= 400;

    if (!isCNAB240 && !isCNAB400) {
      throw new Error("Formato CNAB não reconhecido. Deve ser CNAB 240 ou 400.");
    }

    linhas.forEach((linha) => {
      // Identificar tipo de registro
      const tipoRegistro = linha.substring(7, 8);

      // Processar apenas registros de detalhe (tipo 3 para CNAB 240, tipo 1 para CNAB 400)
      if (isCNAB240 && tipoRegistro === "3") {
        // CNAB 240 - Segmento T
        const segmento = linha.substring(13, 14);
        
        if (segmento === "T") {
          // Data (posições 73-80: DDMMAAAA)
          const dataStr = linha.substring(73, 81);
          const dia = parseInt(dataStr.substring(0, 2));
          const mes = parseInt(dataStr.substring(2, 4)) - 1;
          const ano = parseInt(dataStr.substring(4, 8));
          const data = new Date(ano, mes, dia);

          // Valor (posições 81-96: 15 dígitos + 2 decimais)
          const valorStr = linha.substring(81, 96);
          const valor = parseInt(valorStr) / 100;

          // Tipo (C = Crédito, D = Débito)
          const tipoMovimento = linha.substring(105, 106);
          const tipo: "RECEITA" | "DESPESA" = tipoMovimento === "C" ? "RECEITA" : "DESPESA";

          // Descrição (histórico)
          const descricao = linha.substring(106, 146).trim() || "Transação CNAB";

          // Documento
          const documento = linha.substring(37, 57).trim() || undefined;

          transacoes.push({
            data,
            descricao,
            valor,
            tipo,
            documento,
          });
        }
      } else if (isCNAB400 && tipoRegistro === "1") {
        // CNAB 400 - Registro tipo 1
        // Data (posições 110-115: DDMMAA)
        const dataStr = linha.substring(110, 116);
        const dia = parseInt(dataStr.substring(0, 2));
        const mes = parseInt(dataStr.substring(2, 4)) - 1;
        const ano = 2000 + parseInt(dataStr.substring(4, 6));
        const data = new Date(ano, mes, dia);

        // Valor (posições 152-165: 13 dígitos + 2 decimais)
        const valorStr = linha.substring(152, 165);
        const valor = parseInt(valorStr) / 100;

        // Tipo
        const tipoMovimento = linha.substring(108, 109);
        const tipo: "RECEITA" | "DESPESA" = tipoMovimento === "C" || tipoMovimento === "2" ? "RECEITA" : "DESPESA";

        // Descrição
        const descricao = linha.substring(62, 92).trim() || "Transação CNAB";

        // Documento
        const documento = linha.substring(37, 62).trim() || undefined;

        transacoes.push({
          data,
          descricao,
          valor,
          tipo,
          documento,
        });
      }
    });

    if (transacoes.length === 0) {
      throw new Error("Nenhuma transação encontrada no arquivo CNAB");
    }

    return transacoes;
  } catch (error) {
    console.error("Erro ao parsear CNAB:", error);
    throw new Error("Erro ao processar arquivo CNAB. Verifique se o formato está correto.");
  }
}
