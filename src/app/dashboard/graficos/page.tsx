'use client';

/**
 * Página de Demonstração de Gráficos
 * 
 * Mostra todos os tipos de gráficos disponíveis com dados de exemplo
 */

import { ExpenseChart, CategoryChart, BarChart, AreaChart } from '@/components/charts';

// Dados de exemplo
const expenseData = [
  { date: 'Jan', despesas: 4500, receitas: 6000 },
  { date: 'Fev', despesas: 5200, receitas: 6000 },
  { date: 'Mar', despesas: 4800, receitas: 6500 },
  { date: 'Abr', despesas: 5500, receitas: 6000 },
  { date: 'Mai', despesas: 4900, receitas: 6200 },
  { date: 'Jun', despesas: 5300, receitas: 6800 },
];

const categoryData = [
  { name: 'Alimentação', value: 1200 },
  { name: 'Transporte', value: 800 },
  { name: 'Moradia', value: 2000 },
  { name: 'Lazer', value: 500 },
  { name: 'Saúde', value: 600 },
  { name: 'Educação', value: 400 },
];

const comparisonData = [
  { name: 'Jan', value: 4500, value2: 6000 },
  { name: 'Fev', value: 5200, value2: 6000 },
  { name: 'Mar', value: 4800, value2: 6500 },
  { name: 'Abr', value: 5500, value2: 6000 },
];

const areaData = [
  { date: 'Sem 1', value: 1200 },
  { date: 'Sem 2', value: 1500 },
  { date: 'Sem 3', value: 1100 },
  { date: 'Sem 4', value: 1800 },
];

export default function GraficosPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gráficos Interativos</h1>
        <p className="text-muted-foreground">
          Visualize seus dados financeiros de forma clara e interativa
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseChart 
          data={expenseData}
          title="Evolução Mensal"
          description="Comparação entre receitas e despesas"
        />

        <CategoryChart 
          data={categoryData}
          title="Distribuição por Categoria"
          description="Onde seu dinheiro está sendo gasto"
        />

        <BarChart 
          data={comparisonData}
          title="Comparação Mensal"
          description="Despesas vs Receitas"
          label1="Despesas"
          label2="Receitas"
        />

        <AreaChart 
          data={areaData}
          title="Gastos Semanais"
          description="Evolução dos gastos nas últimas semanas"
        />
      </div>
    </div>
  );
}
