import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Header({
  isAnnual,
  setIsAnnual,
  showDifferencesOnly,
  setShowDifferencesOnly,
  isDarkMode,
  t
}) {
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.header.titlePrefix}
          <span className="text-blue-600">{t.header.titleHighlight}</span>
          {t.header.titleSuffix}
        </h1>
        <p className={`mt-2 text-sm ${textMuted}`}>
          {t.header.subtitle}
        </p>
      </div>

      {/* Controls row */}
      <div className={`flex flex-wrap items-center gap-4 p-3 rounded-lg border text-sm ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Billing toggle */}
        <div className="flex items-center gap-2">
          <span className={isAnnual ? textMuted : 'font-medium'}>{t.header.monthly}</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            role="switch"
            aria-checked={isAnnual}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isAnnual ? 'bg-blue-600' : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              isAnnual ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
          <span className={isAnnual ? 'font-medium' : textMuted}>{t.header.annual}</span>
          {isAnnual && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
              {t.header.save10}
            </span>
          )}
        </div>

        <div className={`hidden sm:block w-px h-5 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`} />

        {/* Differences toggle */}
        <button
          onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            showDifferencesOnly
              ? 'text-blue-600 font-medium'
              : textMuted + ' hover:text-current'
          }`}
        >
          {showDifferencesOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDifferencesOnly ? t.header.showingDiff : t.header.showDiff}
        </button>
      </div>
    </div>
  );
}
