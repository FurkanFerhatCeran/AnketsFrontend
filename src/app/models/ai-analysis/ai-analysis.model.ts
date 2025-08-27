// İSTEK (REQUEST) MODELİ
export interface AIAnalysisRequest {
  surveyId: number;
}

// YANIT (RESPONSE) MODELİ
export interface AIAnalysisResponse {
  aiAnalysisId: number;
  surveyId: number;
  aiResponse: string;
  summary: string;
  confidenceLevel: number;
  createdAt: string;
}