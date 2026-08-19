import * as pdfjsLib from 'pdfjs-dist';

// Setting worker path to a CDN link for client-side rendering
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  isScanned: boolean; // Indicates if we found very little text relative to the page count
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: string) => void
): Promise<PDFExtractionResult> {
  try {
    if (onProgress) onProgress('Reading PDF file...');
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      if (onProgress) onProgress(`Extracting text from page ${i} of ${numPages}...`);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
        
      fullText += `\n--- Page ${i} ---\n` + pageText;
    }
    
    const extractedCharCount = fullText.replace(/\\s/g, '').length;
    // Heuristic: If we extracted less than 50 characters per page on average, it's likely a scanned PDF
    const isScanned = extractedCharCount < numPages * 50;

    return {
      text: fullText.trim(),
      pageCount: numPages,
      isScanned
    };

  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from the PDF document.');
  }
}
