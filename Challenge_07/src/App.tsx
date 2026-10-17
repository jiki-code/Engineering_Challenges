import React, { useEffect, useMemo, useState, useRef } from 'react';
import Papa from 'papaparse';
import type { Claim, TrendGranularity } from './types';
import { useFilterStore } from './store/filterStore';
import {
  applyFilters,
  calcHistogram,
  calcInsurerTypeRates,
  calcKPIs,
  calcStatusDist,
  calcTop10Diagnoses,
  calcTrend,
} from './utils/kpi';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { StatusDonut } from './components/StatusDonut';
import { TrendLine } from './components/TrendLine';
import { Top10Bar } from './components/Top10Bar';
import { ProcessingHistogram } from './components/ProcessingHistogram';
import { InsurerGroupedBar } from './components/InsurerGroupedBar';
import { ClaimsTable } from './components/ClaimsTable';
import { IconUpload, IconRefresh } from './components/Icons';

const ALL_INSURERS = ['Aurora Assurance', 'Pacific Shield', 'Mekong Life'];

export default function App() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>('month');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterState = useFilterStore();

  const parseAndSetData = (csvText: string) => {
    Papa.parse<Record<string, any>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed: Claim[] = results.data.map((row) => ({
            claim_id: String(row.claim_id || ''),
            policy_id: String(row.policy_id || ''),
            member_name: String(row.member_name || ''),
            country: String(row.country || ''),
            insurer: String(row.insurer || ''),
            assessor: String(row.assessor || ''),
            claim_type: row.claim_type,
            icd_code: String(row.icd_code || ''),
            status: row.status,
            submitted_amount: Number(row.submitted_amount || 0),
            approved_amount: Number(row.approved_amount || 0),
            submitted_date: String(row.submitted_date || ''),
            processed_date: row.processed_date ? String(row.processed_date) : '',
          }));
          setClaims(parsed);
          setLoading(false);
          setLoadError(null);
        } catch (err: any) {
          setLoadError('Failed to parse claims data: ' + err.message);
          setLoading(false);
        }
      },
      error: (err: any) => {
        setLoadError('CSV parse error: ' + err.message);
        setLoading(false);
      },
    });
  };

  const loadDefaultCSV = () => {
    setLoading(true);
    fetch('./claims.csv')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch claims.csv`);
        return res.text();
      })
      .then((csvText) => parseAndSetData(csvText))
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDefaultCSV();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseAndSetData(content);
    };
    reader.readAsText(file);
  };

  const filteredClaims = useMemo(() => {
    return applyFilters(claims, filterState);
  }, [claims, filterState]);

  const kpis = useMemo(() => calcKPIs(filteredClaims), [filteredClaims]);
  const statusDist = useMemo(() => calcStatusDist(filteredClaims), [filteredClaims]);
  const trendData = useMemo(() => calcTrend(filteredClaims, trendGranularity), [filteredClaims, trendGranularity]);
  const { byCount, byAmount } = useMemo(() => calcTop10Diagnoses(filteredClaims), [filteredClaims]);
  const histogramData = useMemo(() => calcHistogram(filteredClaims), [filteredClaims]);

  const activeInsurers = useMemo(() => {
    if (filterState.insurers.length > 0) return filterState.insurers;
    return ALL_INSURERS;
  }, [filterState.insurers]);

  const insurerTypeRates = useMemo(
    () => calcInsurerTypeRates(filteredClaims, activeInsurers),
    [filteredClaims, activeInsurers]
  );

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="brand-section">
          <span className="brand-badge">Engineering_Challenges</span>
          <div>
            <h1 className="brand-title">Claims Adjudication & Analytics</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Operational claims metrics & settlement performance
            </p>
          </div>
        </div>

        <div className="header-actions">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={loadDefaultCSV}
            className="btn btn-secondary btn-sm"
            title="Reload default 5,000 synthetic records"
          >
            <IconRefresh size={13} />
            <span>Reset Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
          >
            <IconUpload size={13} />
            <span>Load CSV</span>
          </button>

          <span className="live-badge">
            <span className="live-dot" />
            <span className="tabular-num font-mono">
              {loading ? 'Processing...' : `${claims.length.toLocaleString()} Records Live`}
            </span>
          </span>
        </div>
      </header>

      {loadError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {loadError}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar totalFiltered={filteredClaims.length} total={claims.length} />

      {/* KPI Cards Grid */}
      <KPICards metrics={kpis} />

      {/* Charts Grid - Row 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Status Donut */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Claim Status Breakdown</span>
            <span className="panel-subtitle">Proportion by adjudication state</span>
          </div>
          <div className="panel-body">
            <StatusDonut data={statusDist} />
          </div>
        </div>

        {/* Trend Line */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Submission & Settlement Velocity</span>
            <span className="panel-subtitle">Volume and approved amounts over time</span>
          </div>
          <div className="panel-body">
            <TrendLine
              data={trendData}
              granularity={trendGranularity}
              onGranularityChange={setTrendGranularity}
            />
          </div>
        </div>
      </div>

      {/* Top 10 Diagnoses with Drill-Down */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <span className="panel-title">Top 10 Clinical Diagnoses (ICD-10)</span>
          <span className="panel-subtitle">Select bar to isolate records in table</span>
        </div>
        <div className="panel-body">
          <Top10Bar byCount={byCount} byAmount={byAmount} />
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Processing Histogram */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Adjudication Turnaround Time</span>
            <span className="panel-subtitle">Duration in days (resolved claims)</span>
          </div>
          <div className="panel-body">
            <ProcessingHistogram data={histogramData} />
          </div>
        </div>

        {/* Insurer Approval Rates */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Approval Rate by Insurer & Care Type</span>
            <span className="panel-subtitle">Cross-tabulation across carriers</span>
          </div>
          <div className="panel-body">
            <InsurerGroupedBar data={insurerTypeRates} insurers={activeInsurers} />
          </div>
        </div>
      </div>

      {/* Claims Detail Table */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="panel-title">Claims Master Ledger</span>
            {filterState.selectedDiagnosis && (
              <span
                className="font-mono"
                style={{
                  fontSize: 11,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                }}
              >
                Filtered: {filterState.selectedDiagnosis}
              </span>
            )}
          </div>
          <span className="panel-subtitle">Detailed audit records</span>
        </div>
        <div className="panel-body">
          <ClaimsTable rows={filteredClaims} />
        </div>
      </div>
    </div>
  );
}
