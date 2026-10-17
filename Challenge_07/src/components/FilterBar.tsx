import React, { useState, useRef, useEffect } from 'react';
import type { ClaimStatus, ClaimType } from '../types';
import { useFilterStore } from '../store/filterStore';
import { IconChevronDown, IconFilter, IconX } from './Icons';

const CLAIM_TYPES: ClaimType[] = ['OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];
const STATUSES: ClaimStatus[] = ['APPROVED', 'REJECTED', 'PENDING', 'IN_REVIEW'];
const INSURERS = ['Aurora Assurance', 'Pacific Shield', 'Mekong Life'];
const COUNTRIES = ['Thailand', 'Vietnam', 'Hong Kong'];

const DATE_PRESETS = [
  { label: 'FY 2024', from: '2024-01-01', to: '2024-12-31' },
  { label: 'Q1', from: '2024-01-01', to: '2024-03-31' },
  { label: 'Q2', from: '2024-04-01', to: '2024-06-30' },
  { label: 'Q3', from: '2024-07-01', to: '2024-09-30' },
  { label: 'Q4', from: '2024-10-01', to: '2024-12-31' },
];

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const isActive = selected.length > 0;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary btn-sm"
        style={{
          background: isActive ? '#eff6ff' : undefined,
          borderColor: isActive ? '#93c5fd' : undefined,
          color: isActive ? '#1d4ed8' : undefined,
          fontWeight: isActive ? 600 : 500,
        }}
      >
        <span>{label}</span>
        {isActive && (
          <span
            style={{
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '0 5px',
              fontSize: '10px',
              lineHeight: '14px',
              fontWeight: 700,
            }}
          >
            {selected.length}
          </span>
        )}
        <IconChevronDown size={12} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 50,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            padding: '4px 0',
            minWidth: 180,
          }}
        >
          {options.map((opt) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12.5,
                color: 'var(--text-main)',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ cursor: 'pointer' }}
              />
              <span>{opt}</span>
            </label>
          ))}
          {isActive && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 4, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-dim)' }}
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ totalFiltered, total }: { totalFiltered: number; total: number }) {
  const {
    dateFrom,
    dateTo,
    claimTypes,
    insurers,
    countries,
    statuses,
    selectedDiagnosis,
    setDateFrom,
    setDateTo,
    setClaimTypes,
    setInsurers,
    setCountries,
    setStatuses,
    setSelectedDiagnosis,
    clearAll,
  } = useFilterStore();

  const hasFilters =
    claimTypes.length > 0 ||
    insurers.length > 0 ||
    countries.length > 0 ||
    statuses.length > 0 ||
    selectedDiagnosis !== null ||
    dateFrom !== '2024-01-01' ||
    dateTo !== '2024-12-31';

  return (
    <div
      className="panel"
      style={{
        padding: '12px 18px',
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginRight: 4 }}>
          <IconFilter size={14} />
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Filter
          </span>
        </div>

        {/* Quick Date Presets */}
        <div style={{ display: 'flex', gap: 4, marginRight: 6 }}>
          {DATE_PRESETS.map((p) => {
            const active = dateFrom === p.from && dateTo === p.to;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setDateFrom(p.from);
                  setDateTo(p.to);
                }}
                className={`preset-pill ${active ? 'active' : ''}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--text-muted)' }}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '3px 8px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
            }}
          />
          <span style={{ color: 'var(--text-dim)' }}>–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '3px 8px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />

        <MultiSelect label="Type" options={CLAIM_TYPES} selected={claimTypes} onChange={(v) => setClaimTypes(v as ClaimType[])} />
        <MultiSelect label="Insurer" options={INSURERS} selected={insurers} onChange={setInsurers} />
        <MultiSelect label="Country" options={COUNTRIES} selected={countries} onChange={setCountries} />
        <MultiSelect label="Status" options={STATUSES} selected={statuses} onChange={(v) => setStatuses(v as ClaimStatus[])} />

        {selectedDiagnosis && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '2px 8px',
              fontSize: 12,
              color: '#92400e',
              fontWeight: 600,
            }}
          >
            <span>ICD-10: {selectedDiagnosis}</span>
            <button
              type="button"
              onClick={() => setSelectedDiagnosis(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                color: '#92400e',
                padding: 0,
              }}
            >
              <IconX size={12} />
            </button>
          </div>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="btn btn-ghost btn-sm"
            style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Matching{' '}
        <strong className="tabular-num font-mono" style={{ color: 'var(--text-main)', fontWeight: 700 }}>
          {totalFiltered.toLocaleString()}
        </strong>{' '}
        <span style={{ color: 'var(--text-dim)' }}>of {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
