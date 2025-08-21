// src/app/services/survey.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { QuestionService } from './question.service';
import { Survey, SurveyResponse, SurveyResult, Question } from '../models/survey/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  private responsesSubject = new BehaviorSubject<SurveyResponse[]>([]);

  constructor(
    private apiService: ApiService,
    private questionService: QuestionService
  ) {
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
      }),
      map((surveys: any) => {
        if (!surveys || !Array.isArray(surveys)) {
          console.warn('⚠️ Backend returned non-array data:', surveys);
          return [];
        }

        return surveys.map((surveyDto: any) => {
          const survey: Survey = {
            id: surveyDto.id || surveyDto.surveyId,
            title: surveyDto.title || 'Başlıksız Anket',
            description: surveyDto.description || '',
            questions: surveyDto.questions || [],
            createdAt: surveyDto.createdAt ? new Date(surveyDto.createdAt) : new Date(),
            updatedAt: surveyDto.updatedAt ? new Date(surveyDto.updatedAt) : undefined,
            isActive: surveyDto.isActive !== undefined ? surveyDto.isActive : true,
            createdBy: surveyDto.createdBy
          };
          
          return survey;
        });
      }),
      tap((processedSurveys: Survey[]) => {
        this.surveysSubject.next(processedSurveys);
      }),
      catchError(error => {
        console.error('❌ Error loading surveys:', error);
        this.surveysSubject.next([]);
        return of([]);
      })
    );
  }

  getSurveyById(id: number): Observable<Survey | null> {
    console.log('🔍 Getting survey by ID:', id);
    
    // Önce local'den bak
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
          id: survey.id,
          title: survey.title,
          description: survey.description,
          questions: survey.questions || [],
          createdAt: new Date(survey.createdAt),
          updatedAt: survey.updatedAt ? new Date(survey.updatedAt) : undefined,
          isActive: survey.isActive,
          createdBy: survey.createdBy
        };
      }),
      catchError(error => {
        console.error('❌ Error loading survey:', error);
        return of(null);
      })
    );
  }

  createSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Observable<any> {
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

  updateSurvey(id: number, survey: Partial<Survey>): Observable<any> {
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

  deleteSurvey(id: number): Observable<any> {
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

  getSurveyResponses(surveyId: number): Observable<SurveyResponse[]> {
    console.log('📊 Getting responses for survey:', surveyId);
    
    return this.apiService.getSurveyResponses(surveyId).pipe(
      map((responses: any[]) => {
        return responses.map(response => ({
          id: response.id,
          surveyId: response.surveyId,
          answers: response.answers,
          submittedAt: new Date(response.submittedAt),
          respondentName: response.respondentName
        }));
      }),
      catchError(error => {
        console.error('❌ Error loading responses:', error);
        return of([]);
      })
    );
  }

  getSurveyStatistics(surveyId: number): Observable<SurveyResult> {
    console.log('📈 Getting statistics for survey:', surveyId);
    
    return this.apiService.getSurveyStatistics(surveyId).pipe(
      map((stats: any) => ({
        survey: {
          id: stats.survey.id,
          title: stats.survey.title,
          description: stats.survey.description,
          questions: stats.survey.questions || [],
          createdAt: new Date(stats.survey.createdAt),
          updatedAt: stats.survey.updatedAt ? new Date(stats.survey.updatedAt) : undefined,
          isActive: stats.survey.isActive,
          createdBy: stats.survey.createdBy
        },
        responses: stats.responses.map((r: any) => ({
          id: r.id,
          surveyId: r.surveyId,
          answers: r.answers,
          submittedAt: new Date(r.submittedAt),
          respondentName: r.respondentName
        })),
        totalResponses: stats.totalResponses,
        questionStats: stats.questionStats
      })),
      catchError(error => {
        console.error('❌ Error loading statistics:', error);
        throw error;
      })
    );
  }

  // Question Operations
  createQuestion(question: Question): Observable<any> {
    return this.questionService.createQuestion(question);
  }

  updateQuestion(id: number, question: Question): Observable<any> {
    return this.questionService.updateQuestion(id, question);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.questionService.deleteQuestion(id);
  }

  getQuestionsBySurvey(surveyId: number): Observable<any> {
    return this.questionService.getQuestionsBySurvey(surveyId);
  }

  // Dashboard Stats
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
    this.getSurveys().subscribe();
  }

  getSurveyByIdSync(id: number): Survey | undefined {
    return this.surveysSubject.value.find(survey => survey.id === id);
  }
}