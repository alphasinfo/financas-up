"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PrevisaoChartProps {
  data: Array<{
    mes: string;
    receitaPrevista: number;
    despesaPrevista: number;
    saldoPrevisto: number;
    confianca: number;
  }>;
}

export function PrevisaoChart({ data }: PrevisaoChartProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="receitaPrevista"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorReceita)"
          name="Receita Prevista"
        />
        <Area
          type="monotone"
          dataKey="despesaPrevista"
          stroke="#ef4444"
          fillOpacity={1}
          fill="url(#colorDespesa)"
          name="Despesa Prevista"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
