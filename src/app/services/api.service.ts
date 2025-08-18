import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// API Endpoints sabitleri - Gerçek endpoint'lerinize göre
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
  }
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
}