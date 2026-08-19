# Document Summary Assistant

Turn your documents into clear, useful insights.

## Features

- **Multi-format Support**: Extract text and insights from:
  - PDF Documents (Native text & scanned/embedded images via OCR)
  - Microsoft Word Documents (.docx)
  - Images (PNG, JPG, JPEG)
- **Hybrid PDF Processing**: Automatically detects images embedded in PDFs and runs client-side OCR (Tesseract.js) to ensure no text is missed.
- **Client-Side Extraction**: All document parsing (PDF.js, Mammoth.js, Tesseract.js) happens in the browser, ensuring your files never leave your device for extraction.
- **AI-Powered Summaries**: Utilizes Google's Gemini API to generate accurate, context-aware summaries.
- **Customizable Length**: Choose between short (bullet points), medium (executive summary), or long (detailed analysis) formats.
- **Privacy-First Design**: Only the extracted raw text is sent to the AI model, never the original file.

### Note on Word Documents
Microsoft Word (.docx) support uses `mammoth.js` to reliably extract text, paragraphs, lists, and tables. To maintain browser performance and stability, images embedded within `.docx` files are not currently OCR'd. For complex image-heavy documents, PDF format is recommended.

## Architecture

```text
Browser (User Upload)
       ↓
PDF.js / Tesseract.js (Extracts Text Client-Side)
       ↓
Extracted text + Metadata
       ↓
Next.js API route (/api/summarize)
       ↓
Gemini API (Structured JSON)
       ↓
UI (Displays Summary, Key Points, Topics, Suggestions)
\`\`\`

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- `@google/genai` (Gemini SDK)
- `pdfjs-dist` (PDF Text Extraction)
- `tesseract.js` (Image OCR)
- `zod` (Validation)
- `lucide-react` (Icons)

## Local Setup

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/sahilap2005/Unthinkable-Proj-Sahil-23BCE5114-Document-Summary.git
   cd document-summary-assistant
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure Environment:
   Rename \`.env.example\` to \`.env.local\` and add your Gemini API key:
   \`\`\`env
   GEMINI_API_KEY=your_actual_key_here
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment
This project is built for **Vercel**. Since there's no database or heavy backend required:
1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add the `GEMINI_API_KEY` as an environment variable in the Vercel dashboard.
4. Deploy!

## Design Decisions
- **No Database**: To adhere to the lightweight requirement, the app operates statelessly. Documents are parsed and summaries are generated dynamically.
- **Client-Side Extraction**: Uploading a 10MB PDF to a Vercel serverless function can hit payload limits and increase latency. Processing in the browser solves this efficiently.
- **Gemini Structured Output**: The API requests JSON schema validation from Gemini to guarantee structured data (Key Points, Topics, Suggestions) for the UI, avoiding fragile text parsing.

## Limitations
- **OCR Speed**: Browser-based OCR (Tesseract.js) can take longer on massive images or complex layouts.
- **Rate Limits**: The free tier of the Gemini API has request limitations.
- **Large PDFs**: Extremely large PDFs (e.g., 100+ pages) might consume significant browser memory during extraction.
