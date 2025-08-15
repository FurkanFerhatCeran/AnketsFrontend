import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RegisterRequest
} from '../models/auth/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) { }

  register(registerDto: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register`, 
      registerDto, 
      this.httpOptions
    ).pipe(
      map(response => this.handleAuthResponse(response)),
      catchError(error => this.handleError(error, 'Registration failed'))
    );
  }

  login(loginDto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`, 
      loginDto, 
      this.httpOptions
    ).pipe(
      map(response => this.handleAuthResponse(response)),
      catchError(error => this.handleError(error, 'Login failed'))
    );
  }

  logout(dto: LogoutRequest): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      `${this.apiUrl}/logout`, 
      dto, 
      this.httpOptions
    ).pipe(
      map(response => {
        this.clearAuthData();
        return response;
      }),
      catchError(error => this.handleError(error, 'Logout failed'))
    );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/refresh-token`, 
      {}, 
      this.httpOptions
    ).pipe(
      map(response => this.handleAuthResponse(response)),
      catchError(error => this.handleError(error, 'Token refresh failed'))
    );
  }

  private handleAuthResponse(authData: LoginResponse): LoginResponse {
    this.storeAuthData(authData);
    return authData;
  }

  private storeAuthData(authData: LoginResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', authData.token);
      localStorage.setItem('user_data', JSON.stringify(authData.user));
    }
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', error.error.message);
      errorMessage = `${defaultMessage}: ${error.error.message}`;
    } else {
      // Server-side error
      console.error(`Server error: ${error.status}`, error.error);
      
      if (error.status === 0) {
        errorMessage = 'Server unavailable - Please check your connection';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please login again';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - Insufficient permissions';
      } else {
        errorMessage = error.error?.message || error.message || defaultMessage;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}