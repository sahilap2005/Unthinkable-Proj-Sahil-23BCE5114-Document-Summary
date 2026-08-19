export type SummaryLength = 'short' | 'medium' | 'long';

export interface SummaryRequest {
  text: string;
  summaryLength: SummaryLength;
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  documentType: string;
  importantTopics: string[];
}

export interface ExtractionMetadata {
  pageCount: number;
  characterCount: number;
  fileName: string;
  fileType: string;
}
