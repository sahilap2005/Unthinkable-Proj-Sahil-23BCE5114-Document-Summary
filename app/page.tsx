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
      const { extractDocument } = await import('@/lib/document');
      const docResult = await extractDocument(file, setProgressText);
      
      extractedText = docResult.text;
      setFileMeta(prev => ({ 
        ...prev, 
        isScanned: docResult.metadata?.isScanned 
      }));

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
    <main className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
      
      {/* Decorative Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/20 dark:bg-indigo-600/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/20 dark:bg-fuchsia-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500/15 dark:bg-blue-600/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* Header */}
      <div className="w-full max-w-2xl mx-auto mb-12 flex flex-col items-start border-b border-slate-200/50 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Briefnet
          </h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Extract clear, actionable insights from your documents in seconds.
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
