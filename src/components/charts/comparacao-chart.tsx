"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparacaoChartProps {
  data: Array<{
    mes: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }>;
}

export function ComparacaoChart({ data }: ComparacaoChartProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis tickFormatter={formatarMoeda} />
        <Tooltip
          formatter={(value: number) => formatarMoeda(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[8, 8, 0, 0]} />
        <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
