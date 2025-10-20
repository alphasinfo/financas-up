'use client';

/**
 * Gráfico de Barras
 * 
 * Gráfico de barras para comparação de valores
 */

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
    value2?: number;
  }>;
  title?: string;
  description?: string;
  dataKey1?: string;
  dataKey2?: string;
  label1?: string;
  label2?: string;
}

export function BarChart({ 
  data, 
  title = 'Comparação', 
  description,
  dataKey1 = 'value',
  dataKey2 = 'value2',
  label1 = 'Valor 1',
  label2 = 'Valor 2'
}: BarChartProps) {
  const hasSecondValue = data.some(item => item.value2 !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
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
            <Bar 
              dataKey={dataKey1} 
              fill="hsl(var(--primary))" 
              name={label1}
              radius={[4, 4, 0, 0]}
            />
            {hasSecondValue && (
              <Bar 
                dataKey={dataKey2} 
                fill="hsl(var(--destructive))" 
                name={label2}
                radius={[4, 4, 0, 0]}
              />
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
