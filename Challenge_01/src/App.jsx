import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ComparisonTable from './components/ComparisonTable';
import MobileComparisonView from './components/MobileComparisonView';
import SelectPlanModal from './components/SelectPlanModal';
import LanguageSelect from './components/LanguageSelect';
import { getPlansData, getFeatureCategories } from './data/plans';
import { translations } from './i18n/translations';
import { Shield, Moon, Sun } from 'lucide-react';

export default function App() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('hs_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('hs_lang') || 'vi');

  useEffect(() => { localStorage.setItem('hs_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('hs_lang', language); }, [language]);

  const isDark = theme === 'dark';
  const t = translations[language] || translations.en;
  const plans = getPlansData(t);
  const categories = getFeatureCategories(t);

  const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900';
  const navBg = isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Navbar */}
      <nav className={`border-b sticky top-0 z-40 ${navBg}`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-base">
              {t.nav.title}<span className="text-blue-600">{t.nav.titleAccent}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelect language={language} setLanguage={setLanguage} isDarkMode={isDark} />

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-md border text-sm transition-colors ${
                isDark
                  ? 'border-slate-600 hover:bg-slate-800'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 space-y-8">
        <Header
          isAnnual={isAnnual}
          setIsAnnual={setIsAnnual}
          showDifferencesOnly={showDifferencesOnly}
          setShowDifferencesOnly={setShowDifferencesOnly}
          isDarkMode={isDark}
          t={t}
        />

        {/* Desktop table */}
        <div className="hidden md:block">
          <ComparisonTable
            plans={plans}
            categories={categories}
            isAnnual={isAnnual}
            onSelectPlan={setSelectedPlan}
            showDifferencesOnly={showDifferencesOnly}
            isDarkMode={isDark}
            t={t}
          />
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <MobileComparisonView
            plans={plans}
            categories={categories}
            isAnnual={isAnnual}
            onSelectPlan={setSelectedPlan}
            isDarkMode={isDark}
            t={t}
          />
        </div>
      </main>

      {/* Modal */}
      <SelectPlanModal
        plan={selectedPlan}
        isAnnual={isAnnual}
        isDarkMode={isDark}
        onClose={() => setSelectedPlan(null)}
        t={t}
      />

      {/* Footer */}
      <footer className={`border-t py-6 text-sm text-center ${
        isDark ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'
      }`}>
        {t.footer.builtWith}
      </footer>
    </div>
  );
}
