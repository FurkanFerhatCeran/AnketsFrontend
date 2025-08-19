// src/app/services/survey.service.ts - Backend entegrasyonu
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Survey, SurveyResponse, SurveyResult } from '../models/survey/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  private responsesSubject = new BehaviorSubject<SurveyResponse[]>([]);

  constructor(private apiService: ApiService) {
    this.loadUserSurveys();
  }

  // İlk yükleme
  private loadUserSurveys(): void {
    this.getSurveys().subscribe({
      next: (surveys) => console.log('✅ Surveys loaded from backend:', surveys.length),
      error: (error) => console.error('❌ Failed to load surveys:', error)
    });
  }

  // Backend'den survey'leri al
  getSurveys(): Observable<Survey[]> {
    return this.apiService.getSurveys().pipe(
      tap((rawData: any) => {
        console.log('🔍 RAW Backend Data:', rawData);
        console.log('🔍 Data Type:', typeof rawData);
        console.log('🔍 Is Array:', Array.isArray(rawData));
        if (Array.isArray(rawData) && rawData.length > 0) {
          console.log('🔍 First Survey Structure:', rawData[0]);
          console.log('🔍 First Survey Keys:', Object.keys(rawData[0]));
        }
      }),
      map((surveys: any) => {
        // Eğer data null, undefined veya array değilse boş array döndür
        if (!surveys || !Array.isArray(surveys)) {
          console.warn('⚠️ Backend returned non-array data:', surveys);
          return [];
        }

        // Backend DTO'ya göre mapping - SurveyResponseDto
        return surveys.map((surveyDto: any) => {
          console.log('🔄 Processing survey DTO:', surveyDto);
          
          const survey: Survey = {
            id: surveyDto.surveyId ? surveyDto.surveyId.toString() : `unknown-${Date.now()}`,
            title: surveyDto.title || 'Başlıksız Anket',
            description: surveyDto.description || '',
            questions: [], // DTO'da questions yok, boş array
            createdAt: surveyDto.createdAt ? new Date(surveyDto.createdAt) : new Date(),
            isActive: true // DTO'da bu field yok, default true
          };
          
          console.log('✅ Mapped survey:', survey);
          return survey;
        });
      }),
      tap((processedSurveys: Survey[]) => {
        console.log('✅ Final Processed Surveys:', processedSurveys);
        this.surveysSubject.next(processedSurveys);
      }),
      catchError(error => {
        console.error('❌ Error loading surveys:', error);
        this.surveysSubject.next([]);
        return of([]);
      })
    );
  }

  getSurveyById(id: string): Observable<Survey | null> {
    console.log('🔍 Getting survey by ID:', id);
    
    // Önce local'den bak (string karşılaştırma)
    const localSurvey = this.surveysSubject.value.find(s => s.id === id);
    if (localSurvey) {
      console.log('✅ Found survey locally:', localSurvey.title);
      return of(localSurvey);
    }

    // Backend'den al
    return this.apiService.getSurveyById(id).pipe(
      map((survey: any) => {
        if (!survey) return null;
        
        return {
          ...survey,
          id: survey.id.toString(), // Backend'den gelen ID'yi string'e çevir
          questions: survey.questions || [],
          createdAt: new Date(survey.createdAt)
        };
      }),
      catchError(error => {
        console.error('❌ Error loading survey:', error);
        return of(null);
      })
    );
  }

  createSurvey(survey: Omit<Survey, 'id' | 'createdAt'>): Observable<any> {
    console.log('📝 Creating survey:', survey.title);
    
    return this.apiService.createSurvey(survey).pipe(
      tap((response) => {
        console.log('✅ Survey created:', response);
        this.refreshSurveys();
      }),
      catchError(error => {
        console.error('❌ Error creating survey:', error);
        throw error;
      })
    );
  }

  updateSurvey(id: string, survey: Partial<Survey>): Observable<any> {
    console.log('📝 Updating survey:', id);
    
    return this.apiService.updateSurvey(id, survey).pipe(
      tap((response) => {
        console.log('✅ Survey updated:', response);
        this.refreshSurveys();
      }),
      catchError(error => {
        console.error('❌ Error updating survey:', error);
        throw error;
      })
    );
  }

  deleteSurvey(id: string): Observable<any> {
    console.log('🗑️ Deleting survey:', id);
    
    return this.apiService.deleteSurvey(id).pipe(
      tap((response) => {
        console.log('✅ Survey deleted:', response);
        this.refreshSurveys();
      }),
      catchError(error => {
        console.error('❌ Error deleting survey:', error);
        throw error;
      })
    );
  }

  // Response Operations
  submitResponse(response: Omit<SurveyResponse, 'id' | 'submittedAt'>): Observable<any> {
    console.log('📝 Submitting response for survey:', response.surveyId);
    
    return this.apiService.submitSurveyResponse(response).pipe(
      tap((result) => {
        console.log('✅ Response submitted:', result);
      }),
      catchError(error => {
        console.error('❌ Error submitting response:', error);
        throw error;
      })
    );
  }

  getSurveyResponses(surveyId: string): Observable<SurveyResponse[]> {
    console.log('📊 Getting responses for survey:', surveyId);
    
    return this.apiService.getSurveyResponses(surveyId).pipe(
      map((responses: any[]) => {
        return responses.map(response => ({
          ...response,
          id: response.id.toString(),
          surveyId: response.surveyId.toString(),
          submittedAt: new Date(response.submittedAt)
        }));
      }),
      tap((responses) => {
        console.log('✅ Loaded responses:', responses.length);
      }),
      catchError(error => {
        console.error('❌ Error loading responses:', error);
        return of([]);
      })
    );
  }

  getSurveyStatistics(surveyId: string): Observable<SurveyResult> {
    console.log('📈 Getting statistics for survey:', surveyId);
    
    return this.apiService.getSurveyStatistics(surveyId).pipe(
      map((stats: any) => ({
        ...stats,
        survey: {
          ...stats.survey,
          id: stats.survey.id.toString(),
          questions: stats.survey.questions || [],
          createdAt: new Date(stats.survey.createdAt)
        },
        responses: stats.responses.map((r: any) => ({
          ...r,
          id: r.id.toString(),
          surveyId: r.surveyId.toString(),
          submittedAt: new Date(r.submittedAt)
        }))
      })),
      catchError(error => {
        console.error('❌ Error loading statistics:', error);
        throw error;
      })
    );
  }

  // Dashboard Stats - Observable'lar
  getSurveyCount(): Observable<number> {
    return this.surveysSubject.asObservable().pipe(
      map(surveys => surveys.length)
    );
  }

  getResponsesCount(): Observable<number> {
    return this.responsesSubject.asObservable().pipe(
      map(responses => responses.length)
    );
  }

  getResponses(): Observable<SurveyResponse[]> {
    return this.responsesSubject.asObservable();
  }

  // Utility Methods
  private refreshSurveys(): void {
    // Backend'den tekrar yükle
    this.getSurveys().subscribe();
  }

  getSurveyByIdSync(id: string): Survey | undefined {
    return this.surveysSubject.value.find(survey => survey.id === id); // String karşılaştırma
  }
}