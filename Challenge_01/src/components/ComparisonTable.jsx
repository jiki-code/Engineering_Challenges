import React from 'react';
import { Check, X, Zap } from 'lucide-react';
import Tooltip from './Tooltip';
import {
  getDisplayPrice,
  getBestPlanIndexForRow,
  renderFeatureDisplayValue
} from '../utils/comparison';

export default function ComparisonTable({
  plans,
  categories,
  isAnnual,
  onSelectPlan,
  showDifferencesOnly,
  isDarkMode,
  t
}) {
  const border = isDarkMode ? 'border-slate-700' : 'border-gray-200';
  const bg = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const bgAlt = isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50';
  const bgHover = isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const textMain = isDarkMode ? 'text-slate-100' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-slate-300' : 'text-gray-600';
  const catBg = isDarkMode ? 'bg-slate-800' : 'bg-gray-100';

  return (
    <div className={`rounded-lg border overflow-x-auto ${border} ${bg}`}>
      <table className="w-full text-sm border-collapse min-w-[700px]">
        <thead>
          <tr className={`border-b ${border}`}>
            {/* Label column */}
            <th className={`p-4 text-left w-56 font-medium ${textMuted} ${bg} sticky top-0`}>
              {t.table.planFeatures}
            </th>

            {/* Plan columns */}
            {plans.map((plan) => {
              const price = getDisplayPrice(plan.monthly_premium, isAnnual);
              const isRec = plan.isRecommended;

              return (
                <th
                  key={plan.name}
                  className={`p-4 text-left border-l ${border} sticky top-0 ${
                    isRec
                      ? isDarkMode ? 'bg-blue-950' : 'bg-blue-50'
                      : bg
                  }`}
                >
                  {/* Recommended badge */}
                  {plan.badge && (
                    <div className="mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        isRec
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={`text-lg font-bold ${textMain}`}>{plan.name}</div>

                  {/* Price */}
                  <div className="mt-1">
                    <span className={`text-2xl font-bold ${textMain}`}>${price.monthlyEquivalent}</span>
                    <span className={`text-xs ml-1 ${textMuted}`}>/mo</span>
                  </div>

                  {isAnnual && (
                    <div className={`text-xs mt-0.5 ${textMuted}`}>
                      ${price.totalBilling.toLocaleString()}/yr · {t.table.save} ${price.savings}
                    </div>
                  )}

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`mt-3 w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                      isRec
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isDarkMode
                          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {t.table.selectPlan} {plan.name}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {/* Highlights row */}
          <tr className={`border-b ${border} ${bgAlt}`}>
            <td className={`p-4 font-medium ${textSub}`}>{t.table.keyHighlights}</td>
            {plans.map((plan) => (
              <td key={plan.name} className={`p-4 border-l ${border} align-top`}>
                <ul className="space-y-1">
                  {plan.highlights.map((h, i) => (
                    <li key={i} className={`flex items-start gap-1.5 text-xs ${textSub}`}>
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>

          {/* Categories */}
          {categories.map((cat) => (
            <React.Fragment key={cat.category}>
              {/* Category header */}
              <tr>
                <td
                  colSpan={plans.length + 1}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${textMuted} border-b ${border} ${catBg}`}
                >
                  {cat.category}
                </td>
              </tr>

              {/* Feature rows */}
              {cat.features.map((feature) => {
                const bestIdx = getBestPlanIndexForRow(feature, plans);
                const values = plans.map(p => feature.getValue ? feature.getValue(p) : p[feature.key]);
                const allSame = values.every(v => JSON.stringify(v) === JSON.stringify(values[0]));

                if (showDifferencesOnly && allSame) return null;

                return (
                  <tr key={feature.key} className={`border-b ${border} ${bgHover} transition-colors`}>
                    {/* Feature label */}
                    <td className={`p-4 ${textSub}`}>
                      <span className="flex items-center gap-1">
                        {feature.label}
                        {feature.tooltip && <Tooltip text={feature.tooltip} title={feature.label} />}
                      </span>
                    </td>

                    {/* Values */}
                    {plans.map((plan, idx) => {
                      const isBest = idx === bestIdx;
                      const display = renderFeatureDisplayValue(feature, plan, t);

                      return (
                        <td
                          key={plan.name}
                          className={`p-4 border-l ${border} ${
                            plan.isRecommended
                              ? isDarkMode ? 'bg-blue-950/30' : 'bg-blue-50/50'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {/* Included / not included icon */}
                            {display.isIncluded ? (
                              <Check className={`w-4 h-4 shrink-0 ${
                                display.isUnlimited ? 'text-amber-500' : 'text-green-500'
                              }`} />
                            ) : (
                              <X className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                            )}

                            <span className={`${
                              !display.isIncluded
                                ? isDarkMode ? 'text-slate-600' : 'text-gray-300'
                                : isBest
                                  ? `font-semibold ${textMain}`
                                  : textSub
                            }`}>
                              {display.text}
                            </span>

                            {/* Best badge — subtle */}
                            {isBest && display.isIncluded && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                isDarkMode
                                  ? 'bg-green-900/60 text-green-400'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {t.table.bestValue}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}

          {/* Bottom CTA row */}
          <tr className={`border-t ${border}`}>
            <td className={`p-4 text-xs ${textMuted}`}>{t.table.cancelAnytime}</td>
            {plans.map((plan) => (
              <td key={plan.name} className={`p-4 border-l ${border} ${
                plan.isRecommended ? (isDarkMode ? 'bg-blue-950/30' : 'bg-blue-50/50') : ''
              }`}>
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                    plan.isRecommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isDarkMode
                        ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {t.table.getPlan} {plan.name}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
