"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PatrimonioChartProps {
  data: Array<{
    nome: string;
    valor: number;
  }>;
}

const CORES = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PatrimonioChart({ data }: PatrimonioChartProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const total = data.reduce((acc, item) => acc + item.valor, 0);

  const renderLabel = (entry: any) => {
    const percent = ((entry.valor / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="valor"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatarMoeda(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
