import React from 'react';
import type { KPIMetrics } from '../types';
import { fmtCurrency, fmtNumber, fmtPct } from '../utils/kpi';
import { IconInfo } from './Icons';

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  tooltip: string;
  accentColor: string;
  barPercent?: number;
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'indigo';
}

function Card({
  label,
  value,
  sub,
  tooltip,
  accentColor,
  barPercent,
  tone = 'default',
}: CardProps) {
  let valueColor = 'var(--text-main)';
  if (tone === 'success') valueColor = '#059669';
  if (tone === 'danger') valueColor = '#dc2626';
  if (tone === 'warning') valueColor = '#d97706';
  if (tone === 'indigo') valueColor = '#4f46e5';

  return (
    <div
      className="kpi-card"
      title={tooltip}
      style={{ '--kpi-accent': accentColor } as React.CSSProperties}
    >
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        <span style={{ color: 'var(--text-dim)', cursor: 'help' }}>
          <IconInfo size={13} />
        </span>
      </div>

      <div className="kpi-value tabular-num font-mono" style={{ color: valueColor }}>
        {value}
      </div>

      {barPercent !== undefined && (
        <div className="kpi-bar">
          <div
            className="kpi-bar-fill"
            style={{
              width: `${Math.min(100, Math.max(0, barPercent))}%`,
              background: accentColor,
            }}
          />
        </div>
      )}

      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

interface Props {
  metrics: KPIMetrics;
}

export function KPICards({ metrics }: Props) {
  const {
    totalClaims,
    totalApprovedAmount,
    approvalRate,
    rejectionRate,
    avgClaimAmount,
    avgProcessingDays,
  } = metrics;

  return (
    <div className="kpi-grid">
      <Card
        label="Total Claims"
        value={fmtNumber(totalClaims)}
        sub="Active filtered scope"
        tooltip="Total claims matching all current active filters."
        accentColor="#2563eb"
        tone="default"
      />
      <Card
        label="Total Approved"
        value={totalClaims === 0 ? '—' : fmtCurrency(totalApprovedAmount)}
        sub="Settled payouts (THB-eq)"
        tooltip="Sum of approved_amount for all matching claims."
        accentColor="#10b981"
        tone="success"
      />
      <Card
        label="Approval Rate"
        value={fmtPct(approvalRate)}
        sub="Decided claims"
        tooltip="Formula: APPROVED ÷ (APPROVED + REJECTED). PENDING and IN_REVIEW excluded from denominator."
        accentColor="#3b82f6"
        barPercent={approvalRate !== null ? approvalRate * 100 : 0}
        tone="indigo"
      />
      <Card
        label="Rejection Rate"
        value={fmtPct(rejectionRate)}
        sub="Total submissions"
        tooltip="Formula: REJECTED ÷ total claims (including pending/in_review)."
        accentColor="#f43f5e"
        barPercent={rejectionRate * 100}
        tone={rejectionRate > 0.2 ? 'danger' : 'default'}
      />
      <Card
        label="Avg Claim Amount"
        value={avgClaimAmount !== null ? fmtCurrency(avgClaimAmount) : '—'}
        sub="mean(submitted_amount)"
        tooltip="Mean submitted_amount across all filtered claims."
        accentColor="#f59e0b"
        tone="default"
      />
      <Card
        label="Avg Processing Days"
        value={avgProcessingDays !== null ? `${fmtNumber(avgProcessingDays, 1)}d` : '—'}
        sub="Target: ~7 days"
        tooltip="Mean of (processed_date - submitted_date) for APPROVED and REJECTED claims."
        accentColor="#8b5cf6"
        barPercent={avgProcessingDays !== null ? (avgProcessingDays / 30) * 100 : 0}
        tone="default"
      />
    </div>
  );
}
