"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load dos componentes de gráfico
const Bar = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">Carregando gráfico...</div>
});

const Line = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">Carregando gráfico...</div>
});

const Pie = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Pie })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">Carregando gráfico...</div>
});

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Doughnut })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">Carregando gráfico...</div>
});

interface LazyChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  options?: any;
}

export function LazyChart({ type, data, options }: LazyChartProps) {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">Carregando...</div>}>
      {type === 'bar' && <Bar data={data} options={options} />}
      {type === 'line' && <Line data={data} options={options} />}
      {type === 'pie' && <Pie data={data} options={options} />}
      {type === 'doughnut' && <Doughnut data={data} options={options} />}
    </Suspense>
  );
}
