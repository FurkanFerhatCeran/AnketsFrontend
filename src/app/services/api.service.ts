// src/app/services/api.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AIAnalysisResponse } from '../models/ai-analysis/ai-analysis.model'; // Yeni eklendi
import { QuestionType } from '../models/question-type.model';
import { CreateQuestionRequest, QuestionResponse, UpdateQuestionRequest } from '../models/survey/question.model';

// API Endpoints sabitleri
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: '/api/Auth/register',
    LOGIN: '/api/Auth/login',
    LOGOUT: '/api/Auth/logout',
    FORGOT_PASSWORD: '/api/Auth/forgot-password',
    RESET_PASSWORD: '/api/Auth/reset-password',
    TEST: '/api/Auth/test'
  },

  // Survey Categories endpoints
  SURVEY_CATEGORIES: {
    GET_ALL: '/api/SurveyCategories',
    CREATE: '/api/SurveyCategories',
    GET_BY_ID: (id: number) => `/api/SurveyCategories/${id}`,
    UPDATE: (id: number) => `/api/SurveyCategories/${id}`,
    DELETE: (id: number) => `/api/SurveyCategories/${id}`,
    IMPORT: '/api/SurveyCategories/import',
    IMPORT_EXCEL: '/api/SurveyCategories/import-excel'
  },

  // Surveys endpoints  
  SURVEYS: {
    GET_ALL: '/api/Surveys',
    CREATE: '/api/Surveys',
    GET_BY_ID: (id: number) => `/api/Surveys/${id}`,
    UPDATE: (id: number) => `/api/Surveys/${id}`,
    DELETE: (id: number) => `/api/Surveys/${id}`
  },

  // Survey Responses endpoints  
  SURVEY_RESPONSES: {
    SUBMIT: '/api/SurveyResponses',
    GET_BY_SURVEY: (surveyId: number) => `/api/SurveyResponses/survey/${surveyId}`,
    GET_BY_ID: (id: number) => `/api/SurveyResponses/${id}`,
    DELETE: (id: number) => `/api/SurveyResponses/${id}`,
    GET_STATISTICS: (surveyId: number) => `/api/SurveyResponses/statistics/${surveyId}`
  },

  // Dashboard/Analytics endpoints
  DASHBOARD: {
    GET_STATS: '/api/Dashboard/stats',
    GET_USER_SURVEYS: '/api/Dashboard/user-surveys'
  },

  // Questions endpoints
  QUESTIONS: {
    CREATE: '/api/questions',
    UPDATE: (id: number) => `/api/questions/${id}`,
    DELETE: (id: number) => `/api/questions/${id}`,
    GET_BY_ID: (id: number) => `/api/questions/${id}`,
    GET_BY_SURVEY: (surveyId: number) => `/api/questions/by-survey/${surveyId}`,
    GET_TYPES: '/api/questiontypes'
  },

  // Mevcut endpoint grupları
  SURVEY_SETTINGS: {
    UPDATE: (surveyId: number) => `/api/surveys/${surveyId}/settings`,
    GET_SETTINGS: (surveyId: number) => `/api/surveys/${surveyId}/settings`
  },

  ANALYTICS: {
    GET_QUESTION_STATS: (questionId: number) => `/api/analytics/questions/${questionId}`,
    GET_SURVEY_INSIGHTS: (surveyId: number) => `/api/analytics/surveys/${surveyId}/insights`,
    
    // Yeni eklenen AI analiz endpointleri
    GET_SURVEY_ANALYTICS: '/api/Analytics/survey-analytics',
    GET_TIME_SERIES: '/api/Analytics/time-series',
    GET_DEMOGRAPHIC_ANALYSIS: '/api/Analytics/demographic-analysis',
    GET_CORRELATION_ANALYSIS: '/api/Analytics/correlation-analysis',
    GENERATE_AI_ANALYSIS: (surveyId: number) => `/api/Analytics/ai-analysis/${surveyId}`
  } as const
} as const;


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // HTTP options ile authorization header
  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.getAuthToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return { headers };
  }

  // Auth token'ı al
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // Generic HTTP methods
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, this.getHttpOptions());
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, this.getHttpOptions());
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, this.getHttpOptions());
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, this.getHttpOptions());
  }

  // File upload method
  uploadFile<T>(endpoint: string, file: File, fieldName = 'file'): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = this.getAuthToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }

  // 🔐 AUTHENTICATION METHODS
  register(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  }

  login(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, payload);
  }

  logout(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT, payload);
  }

  forgotPassword(email: string): Observable<any> {
    return this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  resetPassword(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  }

  testAuth(): Observable<any> {
    return this.get(API_ENDPOINTS.AUTH.TEST);
  }

  // 📂 SURVEY CATEGORIES METHODS
  getSurveyCategories(): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEY_CATEGORIES.GET_ALL);
  }

  createSurveyCategory(categoryData: any): Observable<any> {
    return this.post(API_ENDPOINTS.SURVEY_CATEGORIES.CREATE, categoryData);
  }

  getSurveyCategoryById(id: number): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEY_CATEGORIES.GET_BY_ID(id));
  }

  updateSurveyCategory(id: number, categoryData: any): Observable<any> {
    return this.put(API_ENDPOINTS.SURVEY_CATEGORIES.UPDATE(id), categoryData);
  }

  deleteSurveyCategory(id: number): Observable<any> {
    return this.delete(API_ENDPOINTS.SURVEY_CATEGORIES.DELETE(id));
  }

  importSurveyCategories(categories: any[]): Observable<any> {
    return this.post(API_ENDPOINTS.SURVEY_CATEGORIES.IMPORT, { categories });
  }

  importSurveyCategoriesFromExcel(file: File): Observable<any> {
    return this.uploadFile(API_ENDPOINTS.SURVEY_CATEGORIES.IMPORT_EXCEL, file);
  }

  // 📋 SURVEYS METHODS
  getSurveys(): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEYS.GET_ALL);
  }

  createSurvey(surveyData: any): Observable<any> {
    return this.post(API_ENDPOINTS.SURVEYS.CREATE, surveyData);
  }

  getSurveyById(id: number): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEYS.GET_BY_ID(id));
  }

  updateSurvey(id: number, surveyData: any): Observable<any> {
    return this.put(API_ENDPOINTS.SURVEYS.UPDATE(id), surveyData);
  }

  deleteSurvey(id: number): Observable<any> {
    return this.delete(API_ENDPOINTS.SURVEYS.DELETE(id));
  }

  // 📝 SURVEY RESPONSES METHODS
  submitSurveyResponse(responseData: any): Observable<any> {
    return this.post(API_ENDPOINTS.SURVEY_RESPONSES.SUBMIT, responseData);
  }

  getSurveyResponses(surveyId: number): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEY_RESPONSES.GET_BY_SURVEY(surveyId));
  }

  getSurveyResponseById(id: number): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEY_RESPONSES.GET_BY_ID(id));
  }

  deleteSurveyResponse(id: number): Observable<any> {
    return this.delete(API_ENDPOINTS.SURVEY_RESPONSES.DELETE(id));
  }

  getSurveyStatistics(surveyId: number): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEY_RESPONSES.GET_STATISTICS(surveyId));
  }

  // 📊 DASHBOARD METHODS
  getDashboardStats(): Observable<any> {
    return this.get(API_ENDPOINTS.DASHBOARD.GET_STATS);
  }

  getUserSurveys(): Observable<any> {
    return this.get(API_ENDPOINTS.DASHBOARD.GET_USER_SURVEYS);
  }

  // ❓ QUESTIONS METHODS
  createQuestion(questionData: CreateQuestionRequest): Observable<QuestionResponse> {
    return this.post<QuestionResponse>(API_ENDPOINTS.QUESTIONS.CREATE, questionData);
  }

  updateQuestion(id: number, questionData: UpdateQuestionRequest): Observable<QuestionResponse> {
    return this.put<QuestionResponse>(API_ENDPOINTS.QUESTIONS.UPDATE(id), questionData);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.QUESTIONS.DELETE(id));
  }

  getQuestionById(id: number): Observable<QuestionResponse> {
    return this.get<QuestionResponse>(API_ENDPOINTS.QUESTIONS.GET_BY_ID(id));
  }

  getQuestionsBySurvey(surveyId: number): Observable<QuestionResponse[]> {
    return this.get<QuestionResponse[]>(API_ENDPOINTS.QUESTIONS.GET_BY_SURVEY(surveyId));
  }

  getQuestionTypes(): Observable<QuestionType[]> {
    return this.get<QuestionType[]>(API_ENDPOINTS.QUESTIONS.GET_TYPES);
  }

  // YENİ EKLENDİ: Anket ayarlarını güncelle
  updateSurveySettings(surveyId: number, settings: any): Observable<any> {
    return this.put(API_ENDPOINTS.SURVEY_SETTINGS.UPDATE(surveyId), settings);
  }
  
  // YENİ EKLENDİ: Anket ayarlarını getir
  getSurveySettings(surveyId: number): Observable<any> {
    return this.get(API_ENDPOINTS.SURVEY_SETTINGS.GET_SETTINGS(surveyId));
  }
  
  // YENİ EKLENDİ: Soru istatistiklerini getir
  getQuestionStats(questionId: number): Observable<any> {
    return this.get(API_ENDPOINTS.ANALYTICS.GET_QUESTION_STATS(questionId));
  }
  
  // YENİ EKLENDİ: Anket içgörülerini getir
  getSurveyInsights(surveyId: number): Observable<any> {
    return this.get(API_ENDPOINTS.ANALYTICS.GET_SURVEY_INSIGHTS(surveyId));
  }

  // YENİ EKLENDİ: Yapay Zeka ile Anket Analizi
  getSurveyAnalytics(request: any): Observable<any> {
    return this.post(API_ENDPOINTS.ANALYTICS.GET_SURVEY_ANALYTICS, request);
  }

  getResponseTimeSeries(request: any): Observable<any> {
    return this.post(API_ENDPOINTS.ANALYTICS.GET_TIME_SERIES, request);
  }

  getDemographicDistribution(request: any): Observable<any> {
    return this.post(API_ENDPOINTS.ANALYTICS.GET_DEMOGRAPHIC_ANALYSIS, request);
  }

  getCorrelationAnalysis(request: any): Observable<any> {
    return this.post(API_ENDPOINTS.ANALYTICS.GET_CORRELATION_ANALYSIS, request);
  }

  // YENİ EKLENDİ: Yapay Zeka ile Anket Analizi
  generateAIAnalysis(surveyId: number): Observable<AIAnalysisResponse> {
    return this.post<AIAnalysisResponse>(API_ENDPOINTS.ANALYTICS.GENERATE_AI_ANALYSIS(surveyId), {});
  }
}
