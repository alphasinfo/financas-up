import React from 'react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number; value2: number }>;
  title: string;
  description: string;
  label1: string;
  label2: string;
}

export default function BarChart({ data, title, description, label1, label2 }: BarChartProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <ResponsiveContainer width="100%" height={300}>
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name={label1} fill="#8884d8" />
          <Bar dataKey="value2" name={label2} fill="#82ca9d" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
