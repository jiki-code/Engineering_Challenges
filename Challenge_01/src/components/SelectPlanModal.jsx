import React, { useState } from 'react';
import { X, Shield, ArrowRight, CheckCircle2, Calendar, User, Mail } from 'lucide-react';
import { getDisplayPrice, formatCurrency } from '../utils/comparison';

export default function SelectPlanModal({ plan, isAnnual, isDarkMode, onClose, t }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [code, setCode] = useState('');

  if (!plan) return null;

  const price = getDisplayPrice(plan.monthly_premium, isAnnual);
  const border = isDarkMode ? 'border-slate-700' : 'border-gray-200';
  const bg = isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-gray-900';
  const bgAlt = isDarkMode ? 'bg-slate-800' : 'bg-gray-50';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const inputCls = `w-full pl-9 pr-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode
      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setCode('HS-' + Math.floor(100000 + Math.random() * 900000));
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`relative w-full max-w-md rounded-lg border shadow-lg ${bg} ${border}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">
              {step === 3 ? t.modal.activatedBadge : plan.name + ' Plan'}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1: Plan overview */}
          {step === 1 && (
            <>
              <div className={`step-label text-xs ${textMuted}`}>{t.modal.step1Title}</div>

              {/* Price summary */}
              <div className={`flex items-center justify-between p-3 rounded border ${border} ${bgAlt}`}>
                <div>
                  <div className={`text-xs ${textMuted}`}>
                    {isAnnual ? t.modal.effectiveRate : t.modal.monthlyPremium}
                  </div>
                  <div className="text-xl font-bold">${price.monthlyEquivalent}<span className={`text-xs font-normal ${textMuted}`}>/mo</span></div>
                </div>
                <div className="text-right">
                  <div className={`text-xs ${textMuted}`}>{t.modal.annualMaximum}</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {formatCurrency(plan.annual_limit, t.display.notIncluded, t.display.unlimited)}
                  </div>
                </div>
              </div>

              {/* Coverage grid */}
              <div>
                <div className={`text-xs font-medium mb-2 ${textMuted}`}>{t.modal.coverageHighlights}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    [t.modal.outpatientVisit, formatCurrency(plan.benefits.outpatient.limit_per_visit, t.display.notIncluded, t.display.unlimited)],
                    [t.modal.inpatientRoom, formatCurrency(plan.benefits.inpatient.limit_per_day, t.display.notIncluded, t.display.unlimited)],
                    [t.modal.copay, plan.copay_percentage + '%'],
                    [t.modal.waitingPeriod, plan.waiting_period_days === 0 ? t.display.immediate : `${plan.waiting_period_days} ${t.display.days}`],
                  ].map(([label, val]) => (
                    <div key={label} className={`p-2 rounded border ${border} ${bgAlt}`}>
                      <div className={textMuted}>{label}</div>
                      <div className="font-semibold mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                {t.modal.proceed} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`text-xs ${textMuted}`}>{t.modal.step2Title}</div>

              {[
                { label: t.modal.fullName, field: 'fullName', type: 'text', icon: User, placeholder: t.modal.namePlaceholder },
                { label: t.modal.emailAddress, field: 'email', type: 'email', icon: Mail, placeholder: t.modal.emailPlaceholder },
                { label: t.modal.effectiveDate, field: 'startDate', type: 'date', icon: Calendar, placeholder: '' },
              ].map(({ label, field, type, icon: Icon, placeholder }) => (
                <div key={field}>
                  <label className={`block text-xs font-medium mb-1 ${textMuted}`}>{label}</label>
                  <div className="relative">
                    <Icon className={`w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-4 py-2 text-sm rounded border transition-colors ${
                    isDarkMode
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t.modal.back}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                >
                  {t.modal.confirm}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <div className="font-semibold">{t.modal.congrats}, {form.fullName}!</div>
                <div className={`text-sm mt-1 ${textMuted}`}>{t.modal.activatedDesc}</div>
              </div>

              <div className={`p-3 rounded border ${border} ${bgAlt}`}>
                <div className={`text-xs ${textMuted} mb-1`}>{t.modal.refCode}</div>
                <div className="text-xl font-mono font-bold text-blue-600">{code}</div>
                <div className={`text-xs mt-1 ${textMuted}`}>{t.modal.effectiveDate}: {form.startDate}</div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                {t.modal.done}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
