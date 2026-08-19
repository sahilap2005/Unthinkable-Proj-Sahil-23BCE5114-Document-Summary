import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSummary } from '@/lib/gemini';
import { SummaryRequest } from '@/types/summary';

// Schema for request validation
const requestSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters long.').max(100000, 'Text exceeds maximum length of 100,000 characters.'),
  summaryLength: z.enum(['short', 'medium', 'long']),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { text, summaryLength } = validationResult.data as SummaryRequest;

    // Generate summary
    const summaryResponse = await generateSummary(text, summaryLength);
    
    return NextResponse.json(summaryResponse);

  } catch (error: unknown) {
    console.error('Error in /api/summarize:', error);
    
    // Provide a safe, human-readable error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary. Please try again later.' },
      { status: 500 }
    );
  }
}
