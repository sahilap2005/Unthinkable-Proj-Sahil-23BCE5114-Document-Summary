import { extractTextFromPDF } from './pdf';
import { extractTextFromImage } from './ocr';
import { extractTextFromDocx } from './docx';
import { CONFIG } from './config';

export interface DocumentExtractionResult {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image' | 'unknown';
  text: string;
  metadata?: {
    pageCount?: number;
    isScanned?: boolean;
    characterCount?: number;
  };
}

export async function extractDocument(
  file: File,
  onProgress?: (progress: string) => void
): Promise<DocumentExtractionResult> {
  if (file.type === 'application/pdf') {
    const { text, pageCount, isScanned } = await extractTextFromPDF(file, onProgress);
    return {
      fileName: file.name,
      fileType: 'pdf',
      text,
      metadata: { pageCount, isScanned }
    };
  } 
  
  if (file.type === CONFIG.DOCX_MIME_TYPE || file.name.endsWith('.docx')) {
    const { text } = await extractTextFromDocx(file, onProgress);
    return {
      fileName: file.name,
      fileType: 'docx',
      text,
      metadata: { characterCount: text.length }
    };
  } 
  
  if (file.type.startsWith('image/')) {
    const text = await extractTextFromImage(file, onProgress);
    return {
      fileName: file.name,
      fileType: 'image',
      text,
      metadata: { characterCount: text.length }
    };
  }

  throw new Error('Unsupported file type.');
}
