import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { InsurerTypeRate } from '../types';
import { EmptyChart } from './StatusDonut';

const TYPE_COLORS: Record<string, string> = {
  OUTPATIENT: '#3b82f6',
  INPATIENT: '#ef4444',
  DENTAL: '#f59e0b',
  MATERNITY: '#10b981',
};
const CLAIM_TYPES = ['OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];

interface Props {
  data: InsurerTypeRate[];
  insurers: string[];
}

export function InsurerGroupedBar({ data, insurers }: Props) {
  const option = useMemo(() => {
    const series = CLAIM_TYPES.map((ct) => ({
      name: ct,
      type: 'bar',
      data: insurers.map((ins) => {
        const entry = data.find((d) => d.insurer === ins && d.claim_type === ct);
        return entry?.approvalRate !== null && entry?.approvalRate !== undefined
          ? +(entry.approvalRate * 100).toFixed(1)
          : null;
      }),
      itemStyle: { color: TYPE_COLORS[ct], borderRadius: [0, 2, 2, 0] },
      barMaxWidth: 12,
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        borderColor: 'transparent',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: { seriesName: string; name: string; value: number | null }[]) => {
          const lines = params
            .filter((p) => p.value !== null)
            .map((p) => `${p.seriesName}: <strong>${p.value}%</strong>`);
          return `<strong>${params[0]?.name}</strong><br/>${lines.join('<br/>')}`;
        },
      },
      legend: {
        data: CLAIM_TYPES,
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: 11, color: '#64748b' },
      },
      grid: { left: 115, right: 24, top: 12, bottom: 42 },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%', fontSize: 10, color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: insurers,
        axisLabel: { fontSize: 11, color: '#0f172a' },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
      },
      series,
    };
  }, [data, insurers]);

  if (data.length === 0 || insurers.length === 0) return <EmptyChart />;

  return <ReactECharts option={option} style={{ height: 230 }} />;
}
