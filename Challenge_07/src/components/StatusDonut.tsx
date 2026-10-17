import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { StatusDist } from '../types';

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#10b981',
  REJECTED: '#f43f5e',
  PENDING: '#f59e0b',
  IN_REVIEW: '#8b5cf6',
};

interface Props {
  data: StatusDist[];
}

export function StatusDonut({ data }: Props) {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0f172a',
      borderColor: 'transparent',
      textStyle: { color: '#f8fafc', fontSize: 12 },
      formatter: (p: { name: string; value: number; percent: number; marker: string }) =>
        `${p.marker} <strong>${p.name}</strong><br/>${p.value.toLocaleString()} claims (${p.percent.toFixed(1)}%)`,
    },
    legend: {
      orient: 'vertical',
      right: 12,
      top: 'center',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12, color: '#475569' },
    },
    series: [
      {
        name: 'Status',
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: '600',
            color: '#0f172a',
          },
        },
        data: data.map((d) => ({
          name: d.status,
          value: d.count,
          itemStyle: { color: STATUS_COLORS[d.status] ?? '#94a3b8' },
        })),
      },
    ],
  }), [data]);

  if (data.every((d) => d.count === 0)) {
    return <EmptyChart />;
  }

  return <ReactECharts option={option} style={{ height: 230 }} />;
}

export function EmptyChart() {
  return (
    <div
      style={{
        height: 230,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        fontSize: 13,
      }}
    >
      No records matching criteria
    </div>
  );
}
