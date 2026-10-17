import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { HistogramBin } from '../types';
import { EmptyChart } from './StatusDonut';

interface Props {
  data: HistogramBin[];
}

export function ProcessingHistogram({ data }: Props) {
  const totalClaims = data.reduce((s, b) => s + b.count, 0);

  const option = useMemo(() => {
    // Dynamic color coding based on turnaround speed:
    // 1-7 days: fast (teal/emerald)
    // 8-14 days: normal (indigo/blue)
    // 15+ days: extended review (amber/rose)
    const seriesData = data.map((b) => {
      let barColor = '#6366f1';
      if (b.day <= 7) barColor = '#10b981';
      else if (b.day <= 14) barColor = '#3b82f6';
      else if (b.day <= 21) barColor = '#f59e0b';
      else barColor = '#f43f5e';

      return {
        value: b.count,
        itemStyle: {
          color: barColor,
          borderRadius: [3, 3, 0, 0],
        },
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        borderColor: 'transparent',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: { axisValue: number; value: number }[]) => {
          const p = params[0];
          const pct = totalClaims > 0 ? ((p.value / totalClaims) * 100).toFixed(1) : '0.0';
          const dayNum = Number(p.axisValue);
          const tag = dayNum <= 7 ? 'Fast track' : dayNum <= 14 ? 'Standard' : 'Extended review';
          return `<strong>Day ${p.axisValue}</strong> <span style="font-size:11px;color:#94a3b8">(${tag})</span><br/>Resolved: <strong>${p.value.toLocaleString()}</strong> claims (${pct}%)`;
        },
      },
      grid: { left: 45, right: 16, top: 16, bottom: 28 },
      xAxis: {
        type: 'category',
        data: data.map((b) => b.day),
        axisLabel: {
          fontSize: 10,
          color: '#64748b',
          interval: 2,
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      },
      series: [
        {
          name: 'Days',
          type: 'bar',
          data: seriesData,
          barCategoryGap: '15%',
        },
      ],
    };
  }, [data, totalClaims]);

  if (totalClaims === 0) return <EmptyChart />;

  return <ReactECharts option={option} style={{ height: 230 }} />;
}
