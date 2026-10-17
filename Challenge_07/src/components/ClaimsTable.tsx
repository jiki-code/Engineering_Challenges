import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import type { Claim } from '../types';
import { fmtCurrency } from '../utils/kpi';
import { IconDownload } from './Icons';

const colHelper = createColumnHelper<Claim>();

function renderCountryBadge(country: string) {
  let flagClass = 'th';
  let short = 'TH';
  if (country === 'Vietnam') {
    flagClass = 'vn';
    short = 'VN';
  } else if (country === 'Hong Kong') {
    flagClass = 'hk';
    short = 'HK';
  }

  return (
    <div className="country-badge">
      <span className={`country-flag ${flagClass}`}>{short}</span>
      <span>{country}</span>
    </div>
  );
}

const columns = [
  colHelper.accessor('claim_id', {
    header: 'Claim ID',
    size: 110,
    cell: (info) => (
      <span className="font-mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>
        {info.getValue()}
      </span>
    ),
  }),
  colHelper.accessor('member_name', {
    header: 'Member Name',
    size: 160,
  }),
  colHelper.accessor('country', {
    header: 'Country',
    size: 115,
    cell: (info) => renderCountryBadge(info.getValue()),
  }),
  colHelper.accessor('insurer', {
    header: 'Insurer',
    size: 140,
  }),
  colHelper.accessor('claim_type', {
    header: 'Type',
    size: 100,
    cell: (info) => <span className="type-tag">{info.getValue()}</span>,
  }),
  colHelper.accessor('icd_code', {
    header: 'ICD-10',
    size: 80,
    cell: (info) => (
      <span className="font-mono" style={{ fontWeight: 600, color: '#334155' }}>
        {info.getValue()}
      </span>
    ),
  }),
  colHelper.accessor('status', {
    header: 'Status',
    size: 115,
    cell: (info) => {
      const val = info.getValue();
      const cls = `status-pill status-${val.toLowerCase()}`;
      return (
        <span className={cls}>
          <span className="status-dot" />
          <span>{val}</span>
        </span>
      );
    },
  }),
  colHelper.accessor('submitted_amount', {
    header: 'Submitted',
    size: 110,
    cell: (info) => (
      <span className="tabular-num font-mono">
        {fmtCurrency(info.getValue())}
      </span>
    ),
  }),
  colHelper.accessor('approved_amount', {
    header: 'Approved',
    size: 110,
    cell: (info) => {
      const val = info.getValue();
      return (
        <span
          className="tabular-num font-mono"
          style={{
            color: val > 0 ? '#059669' : 'var(--text-dim)',
            fontWeight: val > 0 ? 600 : 400,
          }}
        >
          {val > 0 ? fmtCurrency(val) : '—'}
        </span>
      );
    },
  }),
  colHelper.accessor('submitted_date', {
    header: 'Submitted',
    size: 105,
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  colHelper.accessor('processed_date', {
    header: 'Processed',
    size: 105,
    cell: (info) => (
      <span className="font-mono" style={{ color: info.getValue() ? 'var(--text-main)' : 'var(--text-dim)' }}>
        {info.getValue() || '—'}
      </span>
    ),
  }),
  colHelper.accessor('assessor', {
    header: 'Assessor',
    size: 130,
  }),
];

function downloadCSV(rows: Claim[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]).join(',');
  const body = rows
    .map((r) =>
      Object.values(r)
        .map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
        .join(',')
    )
    .join('\n');
  const blob = new Blob([headers + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `claims_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  rows: Claim[];
}

export function ClaimsTable({ rows }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(20);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  useMemo(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div>
      {/* Table Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Showing{' '}
          <strong className="tabular-num font-mono" style={{ color: 'var(--text-main)', fontWeight: 700 }}>
            {rows.length.toLocaleString()}
          </strong>{' '}
          filtered claims
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: 12,
            }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => downloadCSV(rows)}
            disabled={rows.length === 0}
            className="btn btn-secondary btn-sm"
          >
            <IconDownload size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="dev-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{
                      cursor: 'pointer',
                      width: h.getSize(),
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>{flexRender(h.column.columnDef.header, h.getContext())}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        {h.column.getIsSorted() === 'asc'
                          ? ' ▲'
                          : h.column.getIsSorted() === 'desc'
                          ? ' ▼'
                          : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-dim)' }}>
                  No claims found matching active filters
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        <div>
          Page{' '}
          <strong className="font-mono tabular-num">
            {table.getState().pagination.pageIndex + 1}
          </strong>{' '}
          of{' '}
          <span className="font-mono tabular-num">
            {Math.max(1, table.getPageCount())}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { label: '«', fn: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
            { label: '‹', fn: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
            { label: '›', fn: () => table.nextPage(), disabled: !table.getCanNextPage() },
            { label: '»', fn: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
          ].map(({ label, fn, disabled }) => (
            <button
              key={label}
              type="button"
              onClick={fn}
              disabled={disabled}
              className="btn btn-secondary btn-sm"
              style={{ minWidth: 28, padding: '0 6px', opacity: disabled ? 0.4 : 1 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
