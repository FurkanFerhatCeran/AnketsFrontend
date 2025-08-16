import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiErrorResponse,
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
    private readonly apiUrl = `${environment.apiUrl}/api/Auth`;
    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }),
        withCredentials: true
    };
    
    private readonly accessTokenKey = 'access_token';
    private readonly refreshTokenKey = 'refresh_token';
    private readonly userDataKey = 'user_data';

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

    logout(dto?: LogoutRequest): Observable<LogoutResponse> {
        if (dto) {
            return this.http.post<LogoutResponse>(
                `${this.apiUrl}/logout`, 
                dto, 
                this.httpOptions
            ).pipe(
                map(response => {
                    this.clearAuthData();
                    return response;
                }),
                catchError(error => {
                    this.handleError(error, 'Logout failed');
                    this.clearAuthData();
                    return of({ success: false, message: 'Logout failed' });
                })
            );
        } else {
            this.clearAuthData();
            return of({ success: true, message: 'Logged out locally' });
        }
    }
    
    refreshToken(): Observable<LoginResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearAuthData();
            return throwError(() => new Error('Refresh token not found'));
        }
    
        return this.http.post<LoginResponse>(
            `${this.apiUrl}/refresh-token`, 
            { refreshToken }, 
            this.httpOptions
        ).pipe(
            map(response => {
                this.storeAuthData(response);
                return response;
            }),
            catchError(error => {
                this.handleError(error, 'Token refresh failed');
                this.clearAuthData();
                return throwError(() => new Error('Token refresh failed'));
            })
        );
    }

    isLoggedIn(): boolean {
        return !!this.getAccessToken();
    }

    getAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.accessTokenKey);
        }
        return null;
    }

    getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.refreshTokenKey);
        }
        return null;
    }

    getUserData(): LoginResponse['user'] | null {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem(this.userDataKey);
            try {
                return userData ? JSON.parse(userData) : null;
            } catch (e) {
                console.error('Failed to parse user data from localStorage', e);
                return null;
            }
        }
        return null;
    }

    private handleAuthResponse(authData: LoginResponse): LoginResponse {
        this.storeAuthData(authData);
        return authData;
    }

    private storeAuthData(authData: LoginResponse): void {
        if (typeof window !== 'undefined' && authData.token) {
            localStorage.setItem(this.accessTokenKey, authData.token);
            if (authData.user) {
                localStorage.setItem(this.userDataKey, JSON.stringify(authData.user));
            }
            if ((authData as any).refreshToken) {
                localStorage.setItem(this.refreshTokenKey, (authData as any).refreshToken);
            }
        }
    }

    clearAuthData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.accessTokenKey);
            localStorage.removeItem(this.refreshTokenKey);
            localStorage.removeItem(this.userDataKey);
        }
    }

    private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
        let errorMessage = defaultMessage;
        
        if (error.error instanceof ErrorEvent) {
            console.error('Client error:', error.error.message);
            errorMessage = `${defaultMessage}: ${error.error.message}`;
        } else {
            console.error(`Server error: ${error.status}`, error.error);
            
            if (error.status === 0) {
                errorMessage = 'Server unavailable. Please check your internet connection.';
            } else if (error.status === 401) {
                errorMessage = 'Unauthorized. Please login again.';
            } else if (error.status === 403) {
                errorMessage = 'Insufficient permissions.';
            } else if (error.status === 422) {
                const apiError = error.error as ApiErrorResponse;
                errorMessage = apiError.message || 'Invalid data submitted.';
            } else {
                const apiError = error.error as ApiErrorResponse;
                errorMessage = apiError?.message || error.message || defaultMessage;
            } 
        }
        
        return throwError(() => new Error(errorMessage));
    }
}
