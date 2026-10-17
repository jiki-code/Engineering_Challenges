import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import Tooltip from './Tooltip';
import {
  getDisplayPrice,
  getBestPlanIndexForRow,
  renderFeatureDisplayValue
} from '../utils/comparison';

export default function MobileComparisonView({
  plans,
  categories,
  isAnnual,
  onSelectPlan,
  isDarkMode,
  t
}) {
  const [activeIdx, setActiveIdx] = useState(1); // default Silver
  const plan = plans[activeIdx];
  const price = getDisplayPrice(plan.monthly_premium, isAnnual);

  const border = isDarkMode ? 'border-slate-700' : 'border-gray-200';
  const bg = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const bgAlt = isDarkMode ? 'bg-slate-800' : 'bg-gray-50';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const textMain = isDarkMode ? 'text-slate-100' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-slate-300' : 'text-gray-600';

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className={`flex rounded-lg border p-1 gap-1 ${border} ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        {plans.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => setActiveIdx(idx)}
            className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
              activeIdx === idx
                ? isDarkMode
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-gray-900 shadow-sm'
                : textMuted
            }`}
          >
            {p.name}
            {p.isRecommended && (
              <span className="ml-1 text-blue-600">·</span>
            )}
          </button>
        ))}
      </div>

      {/* Plan card */}
      <div className={`rounded-lg border ${border} ${bg} overflow-hidden`}>
        {/* Plan header */}
        <div className={`p-4 border-b ${border} ${plan.isRecommended ? (isDarkMode ? 'bg-blue-950' : 'bg-blue-50') : bgAlt}`}>
          <div className="flex items-start justify-between">
            <div>
              {plan.badge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded mb-2 inline-block ${
                  plan.isRecommended
                    ? 'bg-blue-600 text-white'
                    : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {plan.badge}
                </span>
              )}
              <div className={`text-xl font-bold ${textMain}`}>{plan.name}</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-3xl font-bold ${textMain}`}>${price.monthlyEquivalent}</span>
                <span className={`text-sm ${textMuted}`}>/mo</span>
              </div>
              {isAnnual && (
                <div className={`text-xs mt-0.5 ${textMuted}`}>
                  ${price.totalBilling}/yr · {t.table.save} ${price.savings}
                </div>
              )}
            </div>

            <div className={`text-xs ${textMuted}`}>
              {t.display.tier} {activeIdx + 1} {t.display.of} 3
            </div>
          </div>

          <button
            onClick={() => onSelectPlan(plan)}
            className={`mt-3 w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
              plan.isRecommended
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : isDarkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {t.table.selectPlan} {plan.name}
          </button>
        </div>

        {/* Highlights */}
        <div className={`px-4 py-3 border-b ${border}`}>
          <div className={`text-xs font-medium uppercase tracking-wide mb-2 ${textMuted}`}>{t.table.keyHighlights}</div>
          <ul className="space-y-1">
            {plan.highlights.map((h, i) => (
              <li key={i} className={`flex items-start gap-1.5 text-sm ${textSub}`}>
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature sections */}
        {categories.map((cat) => (
          <div key={cat.category} className={`border-b last:border-b-0 ${border}`}>
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${textMuted} ${bgAlt}`}>
              {cat.category}
            </div>
            <div className="divide-y divide-current">
              {cat.features.map((feature) => {
                const bestIdx = getBestPlanIndexForRow(feature, plans);
                const isBest = bestIdx === activeIdx;
                const display = renderFeatureDisplayValue(feature, plan, t);

                return (
                  <div
                    key={feature.key}
                    className={`flex items-center justify-between px-4 py-3 ${
                      isDarkMode ? 'divide-slate-700' : 'divide-gray-100'
                    }`}
                  >
                    <span className={`text-sm flex items-center gap-1 ${textSub}`}>
                      {feature.label}
                      {feature.tooltip && <Tooltip text={feature.tooltip} title={feature.label} />}
                    </span>

                    <div className="flex items-center gap-2">
                      {display.isIncluded ? (
                        <span className={`text-sm font-medium ${
                          isBest ? textMain : textSub
                        } ${display.isUnlimited ? 'text-amber-500' : ''}`}>
                          {display.text}
                        </span>
                      ) : (
                        <span className={`text-sm ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}>—</span>
                      )}

                      {isBest && display.isIncluded && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isDarkMode
                            ? 'bg-green-900/60 text-green-400'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {t.table.bestValue}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
