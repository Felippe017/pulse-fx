import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { Observation } from '@pulse-fx/shared';

interface IndicatorChartProps {
  observations: Observation[];
  unit: string;
}

export function IndicatorChart({ observations, unit }: IndicatorChartProps) {
  if (observations.length === 0) {
    return (
      <div className="loading__text" style={{ textAlign: 'center', padding: '3rem 0' }}>
        Sem dados para o período selecionado.
      </div>
    );
  }

  const data = observations.map((obs) => ({
    date: new Date(obs.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }),
    value: obs.value,
    fullDate: new Date(obs.date + 'T00:00:00').toLocaleDateString('pt-BR'),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(99, 130, 255, 0.08)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#5a6480' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(99, 130, 255, 0.1)' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#5a6480' }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(17, 25, 50, 0.95)',
            border: '1px solid rgba(99, 130, 255, 0.2)',
            borderRadius: '8px',
            color: '#f0f2f8',
            fontSize: '0.85rem',
          }}
          labelFormatter={(label: string, payload) => {
            if (payload && payload.length > 0) {
              return payload[0].payload.fullDate;
            }
            return label;
          }}
          formatter={(value: number) => [
            `${value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} ${unit}`,
            'Valor',
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
          dot={false}
          activeDot={{
            r: 5,
            stroke: '#6366f1',
            strokeWidth: 2,
            fill: '#0a0e1a',
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
