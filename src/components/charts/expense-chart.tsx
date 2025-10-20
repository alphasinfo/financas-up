'use client';

/**
 * Gráfico de Despesas
 * 
 * Gráfico de linha mostrando evolução de despesas ao longo do tempo
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseChartProps {
  data: Array<{
    date: string;
    despesas: number;
    receitas?: number;
  }>;
  title?: string;
  description?: string;
  showReceitas?: boolean;
}

export function ExpenseChart({ data, title = 'Evolução Financeira', description, showReceitas = true }: ExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Despesas"
              dot={{ fill: 'hsl(var(--destructive))' }}
            />
            {showReceitas && (
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Receitas"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
