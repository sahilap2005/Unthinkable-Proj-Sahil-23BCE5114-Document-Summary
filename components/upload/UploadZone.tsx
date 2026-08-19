import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileType, FileText, FileImage } from 'lucide-react';
import { CONFIG } from '@/lib/config';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setError(null);

    if (!CONFIG.SUPPORTED_TYPES.includes(file.type)) {
      setError('Please upload a PDF, PNG, or JPG file.');
      return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds the \${CONFIG.MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  }, [isLoading]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 ease-in-out text-center cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
            <Upload size={32} strokeWidth={1.5} />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Upload your document
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Drag & drop your document here or <span className="text-blue-600 dark:text-blue-400 font-medium">browse files</span>
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
              <FileText size={14} className="mr-1.5" /> PDF
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
              <FileImage size={14} className="mr-1.5" /> PNG, JPG
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
              Up to {CONFIG.MAX_FILE_SIZE_MB}MB
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/30">
          {error}
        </div>
      )}
    </div>
  );
}
