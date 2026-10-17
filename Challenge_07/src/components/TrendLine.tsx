import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { TrendGranularity, TrendPoint } from '../types';
import { EmptyChart } from './StatusDonut';
import { fmtCurrency } from '../utils/kpi';

interface Props {
  data: TrendPoint[];
  granularity: TrendGranularity;
  onGranularityChange: (g: TrendGranularity) => void;
}

export function TrendLine({ data, granularity, onGranularityChange }: Props) {
  const [metric, setMetric] = useState<'count' | 'amount'>('count');

  const option = useMemo(() => {
    const isAmount = metric === 'amount';
    const mainColor = isAmount ? '#059669' : '#2563eb';
    const gradStart = isAmount ? 'rgba(5, 150, 105, 0.3)' : 'rgba(37, 99, 235, 0.28)';
    const gradEnd = isAmount ? 'rgba(5, 150, 105, 0.01)' : 'rgba(37, 99, 235, 0.01)';

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: 'transparent',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: { axisValue: string; value: number }[]) => {
          const p = params[0];
          const valStr = isAmount
            ? fmtCurrency(p.value) + ' THB'
            : p.value.toLocaleString() + ' claims';
          return `<strong>${p.axisValue}</strong><br/>${isAmount ? 'Approved Amount' : 'Submissions'}: <strong>${valStr}</strong>`;
        },
      },
      grid: { left: 55, right: 16, top: 18, bottom: granularity === 'week' ? 50 : 30 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.period),
        axisLabel: {
          rotate: granularity === 'week' ? 45 : 0,
          fontSize: 11,
          color: '#64748b',
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 11,
          color: '#64748b',
          formatter: (v: number) => {
            if (isAmount) {
              return v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${v}`;
            }
            return v.toLocaleString();
          },
        },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      },
      series: [
        {
          name: isAmount ? 'Approved Amount' : 'Volume',
          type: 'line',
          data: data.map((d) => (isAmount ? d.approvedAmount : d.count)),
          smooth: 0.3,
          lineStyle: { color: mainColor, width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: gradStart },
              { offset: 1, color: gradEnd },
            ]),
          },
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: mainColor, borderWidth: 2, borderColor: '#ffffff' },
        },
      ],
    };
  }, [data, granularity, metric]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
          {(['month', 'week'] as TrendGranularity[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGranularityChange(g)}
              style={{
                border: 'none',
                background: granularity === g ? '#ffffff' : 'transparent',
                color: granularity === g ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: granularity === g ? 600 : 500,
                boxShadow: granularity === g ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 10px',
                fontSize: 11.5,
                cursor: 'pointer',
              }}
            >
              {g === 'month' ? 'Monthly' : 'Weekly'}
            </button>
          ))}
        </div>

        <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
          {[
            { id: 'count', label: 'Volume' },
            { id: 'amount', label: 'Approved Amount' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id as 'count' | 'amount')}
              style={{
                border: 'none',
                background: metric === m.id ? '#ffffff' : 'transparent',
                color: metric === m.id ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: metric === m.id ? 600 : 500,
                boxShadow: metric === m.id ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 10px',
                fontSize: 11.5,
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ReactECharts option={option} style={{ height: 210 }} />
    </div>
  );
}
