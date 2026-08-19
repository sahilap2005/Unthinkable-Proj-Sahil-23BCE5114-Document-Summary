import React from 'react';
import { SummaryLength } from '@/types/summary';

interface SummaryControlsProps {
  selectedLength: SummaryLength;
  onLengthChange: (length: SummaryLength) => void;
  onGenerate: () => void;
  disabled?: boolean;
}

export default function SummaryControls({ 
  selectedLength, 
  onLengthChange, 
  onGenerate, 
  disabled = false 
}: SummaryControlsProps) {
  
  const options: { value: SummaryLength; label: string; desc: string }[] = [
    { value: 'short', label: 'Short', desc: '~100-150 words' },
    { value: 'medium', label: 'Medium', desc: '~250-350 words' },
    { value: 'long', label: 'Long', desc: '~500-700 words' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
        Summary Length
      </h3>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onLengthChange(option.value)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all
              ${selectedLength === option.value 
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500 ring-1 ring-blue-500/50' 
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-[10px] mt-1 opacity-70">{option.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onGenerate}
        disabled={disabled}
        className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
      >
        Generate Summary
      </button>
    </div>
  );
}
