import * as pdfjsLib from 'pdfjs-dist';

// Setting worker path to a CDN link for client-side rendering
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  isScanned: boolean; // Indicates if we relied heavily on OCR
}

function combineTexts(nativeText: string, ocrText: string): string {
  if (!ocrText) return nativeText;
  if (!nativeText) return ocrText;

  const nativeLines = nativeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const ocrLines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const uniqueOcrLines = ocrLines.filter(ocrLine => {
    if (ocrLine.length < 4) return false; // Ignore tiny fragments
    
    // Normalize by stripping non-alphanumeric chars
    const normOcr = ocrLine.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    for (const nLine of nativeLines) {
      const normNative = nLine.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      // If OCR line is contained in native, or vice versa (for short lines)
      if (normNative.includes(normOcr) || normOcr.includes(normNative)) {
        return false;
      }
    }
    return true;
  });

  if (uniqueOcrLines.length > 0) {
    return nativeText + '\n\n' + uniqueOcrLines.join('\n');
  }
  return nativeText;
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: string) => void
): Promise<PDFExtractionResult> {
  let ocrWorker: import('tesseract.js').Worker | null = null;
  let ocrModule: typeof import('./ocr') | null = null;
  let ocrPagesCount = 0;

  try {
    if (onProgress) onProgress('Reading PDF file...');
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      if (onProgress) onProgress(`Extracting native text... Page ${i} of ${numPages}`);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item) => ('str' in item ? (item as { str: string }).str : ''))
        .join(' ');
        
      const nativeCharCount = pageText.replace(/\s/g, '').length;
      
      // Determine if we need OCR
      let needsOcr = false;
      
      // 1. Check for sparse native text (less than 50 characters)
      if (nativeCharCount < 50) {
        needsOcr = true;
      } else {
        // 2. Check for embedded images
        const opList = await page.getOperatorList();
        const ops = pdfjsLib.OPS as Record<string, number>;
        const hasImages = opList.fnArray.includes(ops.paintImageXObject) || 
                          opList.fnArray.includes(ops.paintJpegXObject) ||
                          opList.fnArray.includes(ops.paintInlineImageXObject);
        if (hasImages) {
          needsOcr = true;
        }
      }

      let finalPageText = pageText;

      if (needsOcr) {
        if (onProgress) onProgress(`Reading text from images... Page ${i} of ${numPages}`);
        
        // Lazy load OCR worker
        if (!ocrWorker) {
          ocrModule = await import('@/lib/ocr');
          ocrWorker = await ocrModule.createOcrWorker((progressMsg: string) => {
            // Keep the page context in the OCR progress string
            if (onProgress) onProgress(`Reading text from images (Page ${i}): ${progressMsg}`);
          });
        }

        // Render page to canvas
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await page.render({ canvasContext: ctx, viewport } as any).promise;
          
          // Run OCR on the canvas
          const ocrText = await ocrModule!.runOcrWithWorker(ocrWorker, canvas);
          finalPageText = combineTexts(pageText, ocrText);
          ocrPagesCount++;
        }
      }
        
      fullText += `\n--- Page ${i} ---\n` + finalPageText;
    }
    
    // Cleanup OCR Worker
    if (ocrWorker && ocrModule) {
      await ocrModule.terminateOcrWorker(ocrWorker);
    }

    return {
      text: fullText.trim(),
      pageCount: numPages,
      // Consider it scanned if we had to OCR more than half the pages
      isScanned: ocrPagesCount > (numPages / 2)
    };

  } catch (error) {
    if (ocrWorker && ocrModule) {
      try { await ocrModule.terminateOcrWorker(ocrWorker); } catch (e) { console.error(e); }
    }
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from the PDF document.');
  }
}
