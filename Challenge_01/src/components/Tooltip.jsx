import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ text, title }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        aria-label="More info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 text-xs bg-gray-900 text-gray-100 rounded shadow-lg z-50 pointer-events-none leading-relaxed">
          {title && <span className="block font-semibold mb-1">{title}</span>}
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}
