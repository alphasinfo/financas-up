import React from 'react';
import { AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  description: string;
}

export default function AreaChart({ data, title, description }: AreaChartProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <ResponsiveContainer width="100%" height={300}>
        <ReAreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
