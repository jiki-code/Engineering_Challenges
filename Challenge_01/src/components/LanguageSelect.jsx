import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelect({ language, setLanguage, isDarkMode }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-sm ${
      isDarkMode
        ? 'bg-slate-800 border-slate-600 text-slate-200'
        : 'bg-white border-gray-200 text-gray-700'
    }`}>
      <Globe className="w-4 h-4 opacity-50 shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent focus:outline-none cursor-pointer text-sm"
        aria-label="Select Language"
      >
        <option value="en">EN</option>
        <option value="vi">VI</option>
      </select>
    </div>
  );
}
