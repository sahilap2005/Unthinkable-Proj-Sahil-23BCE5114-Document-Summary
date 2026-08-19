import React from 'react';
import { SummaryResponse } from '@/types/summary';
import { Copy, Download, RefreshCw, Check } from 'lucide-react';
import { useState } from 'react';

interface SummaryResultsProps {
  results: SummaryResponse;
  onReset: () => void;
  metadata?: {
    isScanned?: boolean;
    fileName?: string;
  };
}

export default function SummaryResults({ results, onReset, metadata }: SummaryResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `
Summary:
${results.summary}

Key Points:
${results.keyPoints.map(p => `- ${p}`).join('\n')}

Suggestions:
${results.suggestions.map(s => `- ${s}`).join('\n')}
`.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = `
Document Summary - ${metadata?.fileName || 'Document'}
Type: ${results.documentType}
Topics: ${results.importantTopics.join(', ')}

--- SUMMARY ---
${results.summary}

--- KEY POINTS ---
${results.keyPoints.map(p => `- ${p}`).join('\n')}

--- IMPROVEMENT SUGGESTIONS ---
${results.suggestions.map(s => `- ${s}`).join('\n')}
`.trim();

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-\${metadata?.fileName ? metadata.fileName.split('.')[0] : 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
            {results.documentType}
          </span>
          {metadata?.isScanned && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded border border-amber-200 dark:border-amber-800/30">
              Scanned / OCR
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={handleCopy} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700">
            <Download size={16} /> Save .txt
          </button>
          <button onClick={onReset} className="flex items-center justify-center p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" title="Start Over">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Summary + Suggestions) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Summary</h2>
            <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {results.summary.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </div>
          </div>

          {results.suggestions.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Improvement Suggestions</h2>
              <ul className="space-y-3">
                {results.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="min-w-[24px] h-6 flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded text-sm font-medium">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (Topics + Key Points) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
              Important Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {results.importantTopics.map((topic, idx) => (
                <span key={idx} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
              Key Points
            </h2>
            <ul className="space-y-3">
              {results.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
