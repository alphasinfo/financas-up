// Parser para arquivos CSV

export interface TransacaoCSV {
  data: Date;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  categoria?: string;
}

export function parseCSV(conteudo: string): TransacaoCSV[] {
  const transacoes: TransacaoCSV[] = [];

  try {
    // Remover BOM se existir
    conteudo = conteudo.replace(/^\uFEFF/, '');
    
    const linhas = conteudo.split(/\r?\n/).filter((linha) => linha.trim() !== "");

    if (linhas.length < 2) {
      throw new Error("Arquivo CSV vazio ou inválido. Deve conter cabeçalho e pelo menos uma linha de dados.");
    }

    // Pular cabeçalho
    const cabecalho = linhas[0].toLowerCase().trim();
    const separador = cabecalho.includes(';') ? ';' : ',';
    const colunas = cabecalho.split(separador).map(c => c.trim());

    console.log("Colunas detectadas:", colunas);

    // Identificar índices das colunas (mais flexível)
    const indiceData = colunas.findIndex((c) => 
      c.includes("data") || c === "date"
    );
    const indiceDescricao = colunas.findIndex((c) => 
      c.includes("descri") || c.includes("hist") || c === "description" || c.includes("nome")
    );
    const indiceValor = colunas.findIndex((c) => 
      c.includes("valor") || c === "value" || c.includes("amount") || c.includes("montante")
    );
    const indiceTipo = colunas.findIndex((c) => 
      c.includes("tipo") || c === "type" || c.includes("natureza")
    );
    const indiceCategoria = colunas.findIndex((c) => 
      c.includes("categ") || c === "category"
    );

    if (indiceData === -1) {
      throw new Error(`Coluna 'data' não encontrada. Colunas disponíveis: ${colunas.join(', ')}`);
    }
    if (indiceDescricao === -1) {
      throw new Error(`Coluna 'descricao' não encontrada. Colunas disponíveis: ${colunas.join(', ')}`);
    }
    if (indiceValor === -1) {
      throw new Error(`Coluna 'valor' não encontrada. Colunas disponíveis: ${colunas.join(', ')}`);
    }

    // Processar linhas
    for (let i = 1; i < linhas.length; i++) {
      try {
        const linha = linhas[i].trim();
        if (!linha) continue;

        const valores = linha.split(separador).map(v => v.trim());

        if (valores.length < 3) {
          console.warn(`Linha ${i + 1} ignorada: poucos valores`);
          continue;
        }

        // Parsear data (aceita DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
        const dataStr = valores[indiceData].trim();
        let data: Date;

        if (dataStr.includes("/")) {
          const partes = dataStr.split("/");
          if (partes[0].length === 4) {
            // YYYY/MM/DD
            data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
          } else {
            // DD/MM/YYYY
            data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
          }
        } else if (dataStr.includes("-")) {
          const partes = dataStr.split("-");
          if (partes[0].length === 4) {
            // YYYY-MM-DD
            data = new Date(dataStr);
          } else {
            // DD-MM-YYYY
            data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
          }
        } else {
          data = new Date(dataStr);
        }

        if (isNaN(data.getTime())) {
          console.warn(`Linha ${i + 1}: data inválida '${dataStr}'`);
          continue;
        }

        // Parsear descrição
        let descricao = valores[indiceDescricao].trim();
        // Remover aspas se existirem
        descricao = descricao.replace(/^["']|["']$/g, '');
        if (!descricao) descricao = "Transação sem descrição";

        // Parsear valor
        const valorStr = valores[indiceValor].trim()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "") // Remove separador de milhar
          .replace(",", "."); // Troca vírgula decimal por ponto
        
        const valorNum = parseFloat(valorStr);
        if (isNaN(valorNum)) {
          console.warn(`Linha ${i + 1}: valor inválido '${valores[indiceValor]}'`);
          continue;
        }
        const valor = Math.abs(valorNum);

        // Determinar tipo
        let tipo: "RECEITA" | "DESPESA" = "DESPESA";
        if (indiceTipo !== -1 && valores[indiceTipo]) {
          const tipoStr = valores[indiceTipo].toLowerCase().trim();
          tipo = tipoStr.includes("receita") || tipoStr.includes("crédito") || 
                 tipoStr.includes("entrada") || tipoStr.includes("credit") ? "RECEITA" : "DESPESA";
        } else {
          // Se não tem coluna tipo, usar o sinal do valor original
          tipo = valorNum < 0 || valores[indiceValor].includes("-") ? "DESPESA" : "RECEITA";
        }

        // Categoria (opcional)
        const categoria = indiceCategoria !== -1 && valores[indiceCategoria] ? 
          valores[indiceCategoria].trim().replace(/^["']|["']$/g, '') : undefined;

        transacoes.push({
          data,
          descricao,
          valor,
          tipo,
          categoria,
        });
      } catch (lineError) {
        console.warn(`Erro ao processar linha ${i + 1}:`, lineError);
        continue;
      }
    }

    if (transacoes.length === 0) {
      throw new Error("Nenhuma transação válida encontrada no arquivo CSV.");
    }

    console.log(`${transacoes.length} transações processadas com sucesso`);
    return transacoes;
  } catch (error: any) {
    console.error("Erro ao parsear CSV:", error);
    throw new Error(error.message || "Erro ao processar arquivo CSV. Verifique se o formato está correto.");
  }
}
