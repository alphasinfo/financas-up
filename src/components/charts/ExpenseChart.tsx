import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseChartProps {
  data: Array<{ date: string; despesas: number; receitas: number }>;
  title: string;
  description: string;
}

export default function ExpenseChart({ data, title, description }: ExpenseChartProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="despesas" stroke="#ef4444" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="receitas" stroke="#10b981" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
