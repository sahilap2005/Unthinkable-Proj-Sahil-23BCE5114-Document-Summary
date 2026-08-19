'use client';

import React, { useState } from 'react';
import UploadZone from '@/components/upload/UploadZone';
import FilePreview from '@/components/upload/FilePreview';
import SummaryControls from '@/components/summary/SummaryControls';
import ProcessingState, { ProcessStage } from '@/components/summary/ProcessingState';
import SummaryResults from '@/components/summary/SummaryResults';
import { SummaryLength, SummaryResponse } from '@/types/summary';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{ isScanned?: boolean; fileName?: string }>({});
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [stage, setStage] = useState<ProcessStage>('idle');
  const [progressText, setProgressText] = useState<string>('');
  const [results, setResults] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileMeta({ fileName: selectedFile.name });
    setResults(null);
    setError(null);
    setStage('idle');
  };

  const resetAll = () => {
    setFile(null);
    setFileMeta({});
    setResults(null);
    setError(null);
    setStage('idle');
  };

  const handleGenerate = async () => {
    if (!file) return;

    try {
      setError(null);
      setStage('extracting');
      
      let extractedText = '';
      // 1. Text Extraction
      if (file.type === 'application/pdf') {
        setProgressText('Reading PDF...');
        const { extractTextFromPDF } = await import('@/lib/pdf');
        const pdfResult = await extractTextFromPDF(file, setProgressText);
        
        if (pdfResult.isScanned) {
          // Fallback to OCR? The prompt says "Then offer/use OCR fallback."
          setFileMeta(prev => ({ ...prev, isScanned: true }));
        }
        
        extractedText = pdfResult.text;
      } else if (file.type.startsWith('image/')) {
        setStage('ocr');
        const { extractTextFromImage } = await import('@/lib/ocr');
        extractedText = await extractTextFromImage(file, setProgressText);
      }

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Unable to extract meaningful text from this document. It might be empty or unreadable.');
      }

      // 2. Summary Generation
      setStage('analyzing');
      setProgressText('Sending to Gemini API...');
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          summaryLength: summaryLength
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setResults(data);
      setStage('complete');

    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      setStage('error');
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
          Document Summary Assistant
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Turn documents into clear, useful insights.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center space-y-6">
        
        {/* Step 1: Upload */}
        {!file && (
          <UploadZone onFileSelect={handleFileSelect} isLoading={false} />
        )}

        {/* File Preview */}
        {file && (
          <FilePreview 
            file={file} 
            onRemove={resetAll}
            disabled={stage !== 'idle' && stage !== 'error'} 
          />
        )}

        {/* Step 2: Configure & Generate */}
        {file && (stage === 'idle' || stage === 'error') && !results && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SummaryControls 
              selectedLength={summaryLength}
              onLengthChange={setSummaryLength}
              onGenerate={handleGenerate}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400 rounded-xl flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="text-xs underline hover:text-red-800">Dismiss</button>
          </div>
        )}

        {/* Step 3: Processing */}
        {(stage === 'extracting' || stage === 'ocr' || stage === 'analyzing') && (
          <ProcessingState stage={stage} progressText={progressText} />
        )}

        {/* Step 4: Results */}
        {results && stage === 'complete' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <SummaryResults results={results} onReset={resetAll} metadata={fileMeta} />
          </div>
        )}

      </div>
    </main>
  );
}
