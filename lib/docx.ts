import * as mammoth from 'mammoth';

export interface DocxExtractionResult {
  text: string;
}

export async function extractTextFromDocx(
  file: File,
  onProgress?: (progress: string) => void
): Promise<DocxExtractionResult> {
  try {
    if (onProgress) onProgress('Reading Word document...');
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) onProgress('Extracting document content...');
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text could be extracted from this document.');
    }
    
    return {
      text: result.value.trim()
    };
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from the Word document.');
  }
}
