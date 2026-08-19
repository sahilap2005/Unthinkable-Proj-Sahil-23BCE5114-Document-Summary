# Engineering Approach

The Document Summary Assistant is built as a single-repository Next.js application, intentionally designed for seamless serverless deployment on Vercel without external databases or stateful backends.

**Architecture & File Processing**
To avoid Vercel’s 4.5MB serverless payload limits and maintain user privacy, all file processing happens client-side. `pdfjs-dist` parses text from PDFs directly in the browser. For image-based files or scanned PDFs lacking extractable text, `tesseract.js` provides client-side OCR. Only the raw extracted text string—not the file itself—is sent to the Next.js API route.

**Gemini & Structured Output**
The server-side API route (`/api/summarize`) handles Gemini interaction to keep the `GEMINI_API_KEY` private. I leveraged `@google/genai`'s structured JSON output (`responseSchema`) to enforce a strict response contract containing `summary`, `keyPoints`, `suggestions`, and `importantTopics`. This eliminates fragile text parsing and allows predictable UI rendering.

**Deployment & State**
The architecture requires zero infrastructure aside from Vercel. There is no database or file storage; the app is entirely stateless. The UI is built with Tailwind CSS and Lucide icons, emphasizing a clean, modern aesthetic with robust error handling and loading states to mask processing times gracefully.
