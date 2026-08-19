# Document Summary Assistant

Turn your documents into clear, useful insights. 
This application allows users to upload PDF documents or images, extract the text entirely on the client side, and leverage Google Gemini to produce concise, structured summaries.

## Features
- **Client-Side Processing**: PDF parsing (via PDF.js) and OCR (via Tesseract.js) happen in the browser, ensuring files aren't needlessly sent over the network.
- **Smart Summaries**: Powered by Gemini API to extract key points, topics, and actionable suggestions.
- **Adjustable Length**: Choose between Short, Medium, or Long summaries.
- **Vercel Serverless Ready**: Designed for a seamless, stateless deployment on Vercel.

## Architecture

\`\`\`text
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
