import React from 'react';
import { File, FileText, Image as ImageIcon, X } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

export default function FilePreview({ file, onRemove, disabled = false }: FilePreviewProps) {
  const isPdf = file.type === 'application/pdf';
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${isPdf ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
          {isPdf ? <FileText size={24} /> : <ImageIcon size={24} />}
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[200px] sm:max-w-[400px]">
            {file.name}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isPdf ? 'PDF Document' : 'Image File'} • {sizeMB} MB
          </span>
        </div>
      </div>

      <button
        onClick={onRemove}
        disabled={disabled}
        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Remove file"
      >
        <X size={20} />
      </button>
    </div>
  );
}
