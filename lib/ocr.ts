import Tesseract from 'tesseract.js';

/**
 * Creates and initializes a persistent Tesseract worker.
 * Useful when running OCR sequentially on multiple PDF pages to avoid engine bootup overhead.
 */
export async function createOcrWorker(onProgress?: (progress: string) => void) {
  if (onProgress) onProgress('Initializing OCR engine...');
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(`Reading text from image... ${Math.round(m.progress * 100)}%`);
      }
    }
  });
  return worker;
}

/**
 * Runs OCR using a persistent worker.
 */
export async function runOcrWithWorker(worker: Tesseract.Worker, imageSource: Tesseract.ImageLike): Promise<string> {
  const result = await worker.recognize(imageSource);
  return result.data.text;
}

/**
 * Terminates a persistent worker.
 */
export async function terminateOcrWorker(worker: Tesseract.Worker) {
  await worker.terminate();
}

/**
 * Standalone function for standard single-image uploads.
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: string) => void
): Promise<string> {
  try {
    const worker = await createOcrWorker(onProgress);
    const text = await runOcrWithWorker(worker, file);
    await terminateOcrWorker(worker);
    return text;
  } catch (error) {
    console.error('Error performing OCR on image:', error);
    throw new Error('Failed to read text from the image using OCR.');
  }
}
