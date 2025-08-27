import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIAnalysisResponse } from '../models/ai-analysis/ai-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private apiUrl = 'http://localhost:5000/api/Analytics'; // API adresiniz

  constructor(private http: HttpClient) { }

  /**
   * Belirtilen anket için yapay zeka analizi başlatır ve sonucu döndürür.
   * @param surveyId Analiz edilecek anketin kimliği.
   */
  generateAIAnalysis(surveyId: number): Observable<AIAnalysisResponse> {
    // API'niz 'ai-analysis/{surveyId}' uç noktasını POST metoduyla kullanıyor.
    // Body kısmına boş bir nesne göndermek yeterlidir.
    return this.http.post<AIAnalysisResponse>(`${this.apiUrl}/ai-analysis/${surveyId}`, {});
  }
}