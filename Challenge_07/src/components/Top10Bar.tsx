import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { DiagnosisCount } from '../types';
import { EmptyChart } from './StatusDonut';
import { useFilterStore } from '../store/filterStore';
import { fmtCurrency } from '../utils/kpi';

interface Props {
  byCount: DiagnosisCount[];
  byAmount: DiagnosisCount[];
}

function HBar({
  data,
  valueKey,
  label,
  color,
  onSelect,
  selectedDiagnosis,
}: {
  data: DiagnosisCount[];
  valueKey: 'count' | 'totalAmount';
  label: string;
  color: string;
  onSelect: (code: string) => void;
  selectedDiagnosis: string | null;
}) {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0f172a',
      borderColor: 'transparent',
      textStyle: { color: '#f8fafc', fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        const val =
          valueKey === 'count'
            ? `${p.value.toLocaleString()} claims`
            : `${fmtCurrency(p.value)} THB`;
        return `<strong>${p.name}</strong><br/>${label}: <strong>${val}</strong>`;
      },
    },
    grid: { left: 75, right: 25, top: 8, bottom: 24 },
    xAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#64748b',
        formatter: (v: number) => {
          if (valueKey === 'totalAmount') {
            return v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${v}`;
          }
          return v.toLocaleString();
        },
      },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: [...data].reverse().map((d) => d.icd_code),
      axisLabel: {
        fontSize: 11,
        color: '#0f172a',
        fontFamily: 'var(--font-mono)',
        fontWeight: '500',
      },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: [...data].reverse().map((d) => ({
          value: valueKey === 'count' ? d.count : d.totalAmount,
          itemStyle: {
            color: d.icd_code === selectedDiagnosis ? '#d97706' : color,
            borderRadius: [0, 3, 3, 0],
          },
        })),
        barMaxWidth: 16,
      },
    ],
  }), [data, valueKey, label, color, selectedDiagnosis]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      onEvents={{
        click: (p: { name: string }) => onSelect(p.name),
      }}
    />
  );
}

export function Top10Bar({ byCount, byAmount }: Props) {
  const { selectedDiagnosis, setSelectedDiagnosis } = useFilterStore();

  const handleSelect = (code: string) => {
    setSelectedDiagnosis(selectedDiagnosis === code ? null : code);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            By Frequency (Volume)
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Click row to drill down</span>
        </div>
        <HBar
          data={byCount}
          valueKey="count"
          label="Claim Volume"
          color="#3b82f6"
          onSelect={handleSelect}
          selectedDiagnosis={selectedDiagnosis}
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            By Total Incurred (Cost)
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Click row to drill down</span>
        </div>
        <HBar
          data={byAmount}
          valueKey="totalAmount"
          label="Incurred Amount"
          color="#10b981"
          onSelect={handleSelect}
          selectedDiagnosis={selectedDiagnosis}
        />
      </div>
    </div>
  );
}
