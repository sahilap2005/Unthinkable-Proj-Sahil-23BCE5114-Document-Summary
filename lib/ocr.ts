import Tesseract from 'tesseract.js';

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: string) => void
): Promise<string> {
  try {
    if (onProgress) onProgress('Initializing OCR engine...');

    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(`OCR processing... ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    return result.data.text;
  } catch (error) {
    console.error('Error performing OCR on image:', error);
    throw new Error('Failed to read text from the image using OCR.');
  }
}
