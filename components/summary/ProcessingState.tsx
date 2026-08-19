import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export type ProcessStage = 'idle' | 'uploading' | 'extracting' | 'ocr' | 'analyzing' | 'complete' | 'error';

interface ProcessingStateProps {
  stage: ProcessStage;
  progressText?: string;
}

export default function ProcessingState({ stage, progressText }: ProcessingStateProps) {
  if (stage === 'idle' || stage === 'complete' || stage === 'error') {
    return null;
  }

  const stages = [
    { id: 'uploading', label: 'File uploaded' },
    { id: 'extracting', label: 'Extracting document text', fallbackLabel: 'Performing OCR' },
    { id: 'analyzing', label: 'Analyzing content & generating summary' },
  ];

  const getCurrentStageIndex = () => {
    switch (stage) {
      case 'uploading': return 0;
      case 'extracting': return 1;
      case 'ocr': return 1;
      case 'analyzing': return 2;
      default: return 0;
    }
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center mb-8">
        <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
          Processing Document
        </h3>
        {progressText && (
          <p className="text-sm text-neutral-500 mt-2 font-mono">
            {progressText}
          </p>
        )}
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {stages.map((s, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          let label = s.label;
          if (index === 1 && stage === 'ocr') {
            label = s.fallbackLabel || s.label;
          }

          return (
            <div key={s.id} className="flex items-center space-x-3">
              {isCompleted ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : isCurrent ? (
                <Loader2 size={20} className="text-blue-500 animate-spin" />
              ) : (
                <Circle size={20} className="text-neutral-300 dark:text-neutral-700" />
              )}
              
              <span className={`text-sm ${
                isCompleted ? 'text-neutral-700 dark:text-neutral-300 font-medium' :
                isCurrent ? 'text-blue-700 dark:text-blue-400 font-medium' :
                'text-neutral-400 dark:text-neutral-600'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
