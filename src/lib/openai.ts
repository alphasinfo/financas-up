// Integração com OpenAI para insights financeiros

interface DadosFinanceiros {
  receitas: number;
  despesas: number;
  saldo: number;
  categorias: { nome: string; valor: number }[];
  transacoes: { descricao: string; valor: number; tipo: string }[];
}

export async function gerarInsightsFinanceiros(dados: DadosFinanceiros): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return gerarInsightsSemIA(dados);
  }

  try {
    const prompt = `
Você é um consultor financeiro especializado. Analise os seguintes dados financeiros e forneça insights práticos e acionáveis:

**Resumo Financeiro:**
- Receitas: R$ ${dados.receitas.toFixed(2)}
- Despesas: R$ ${dados.despesas.toFixed(2)}
- Saldo: R$ ${dados.saldo.toFixed(2)}

**Despesas por Categoria:**
${dados.categorias.map((c) => `- ${c.nome}: R$ ${c.valor.toFixed(2)}`).join("\n")}

**Principais Transações:**
${dados.transacoes.slice(0, 10).map((t) => `- ${t.descricao}: R$ ${t.valor.toFixed(2)} (${t.tipo})`).join("\n")}

Forneça:
1. Análise do padrão de gastos
2. Identificação de oportunidades de economia
3. Recomendações específicas e práticas
4. Alertas sobre gastos excessivos em categorias

Seja direto, prático e use linguagem acessível.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um consultor financeiro experiente que fornece insights práticos e acionáveis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar API da OpenAI");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao gerar insights com IA:", error);
    return gerarInsightsSemIA(dados);
  }
}

// Fallback: Insights baseados em regras quando IA não está disponível
function gerarInsightsSemIA(dados: DadosFinanceiros): string {
  const insights: string[] = [];

  // Análise de saldo
  if (dados.saldo < 0) {
    insights.push("⚠️ **Atenção:** Você está no vermelho! Suas despesas superaram suas receitas.");
  } else if (dados.saldo > dados.receitas * 0.3) {
    insights.push("✅ **Parabéns!** Você conseguiu poupar mais de 30% das suas receitas.");
  } else if (dados.saldo > 0) {
    insights.push("💰 **Bom trabalho!** Você terminou o período com saldo positivo.");
  }

  // Análise de despesas
  const percentualDespesas = (dados.despesas / dados.receitas) * 100;
  if (percentualDespesas > 90) {
    insights.push(`📊 Suas despesas representam ${percentualDespesas.toFixed(1)}% das receitas. Considere reduzir gastos.`);
  }

  // Análise por categoria
  const categoriasMaisGastas = dados.categorias
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 3);

  if (categoriasMaisGastas.length > 0) {
    insights.push("\n**Maiores Gastos:**");
    categoriasMaisGastas.forEach((cat, index) => {
      const percentual = (cat.valor / dados.despesas) * 100;
      insights.push(`${index + 1}. ${cat.nome}: R$ ${cat.valor.toFixed(2)} (${percentual.toFixed(1)}%)`);
    });
  }

  // Recomendações
  insights.push("\n**Recomendações:**");
  
  if (categoriasMaisGastas[0] && categoriasMaisGastas[0].valor > dados.receitas * 0.3) {
    insights.push(`• Revise seus gastos com ${categoriasMaisGastas[0].nome} - está muito alto!`);
  }

  if (dados.saldo < dados.receitas * 0.1) {
    insights.push("• Tente poupar pelo menos 10% das suas receitas mensais.");
  }

  insights.push("• Estabeleça metas de economia para cada categoria.");
  insights.push("• Considere criar um fundo de emergência equivalente a 6 meses de despesas.");

  return insights.join("\n");
}

export async function categorizarTransacaoComIA(descricao: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const categorias = [
      "Alimentação",
      "Transporte",
      "Moradia",
      "Saúde",
      "Educação",
      "Lazer",
      "Salário",
      "Outros",
    ];

    const prompt = `Categorize a seguinte transação em uma das categorias: ${categorias.join(", ")}.
    
Transação: "${descricao}"

Responda apenas com o nome da categoria, sem explicações.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const categoria = data.choices[0].message.content.trim();

    return categorias.includes(categoria) ? categoria : null;
  } catch (error) {
    console.error("Erro ao categorizar com IA:", error);
    return null;
  }
}
