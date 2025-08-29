import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordResponse,
    User
} from '../models/auth/auth.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly USER_DATA_KEY = 'userData';

  // Platform kontrolü için
  private isBrowser: boolean;

  // Kullanıcı durumu için BehaviorSubject
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.initializeAuthState();
    }
  }

  private initializeAuthState(): void {
    const userData = this.getUserDataFromStorage();
    this.currentUserSubject.next(userData);
    this.checkAuthState();
  }

  // 🔥 Giriş işlemi
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.apiService.login(payload)
      .pipe(
        tap((response: LoginResponse) => {
          console.log('✅ Login response:', response);
          
          if (response.token && response.user) {
            this.saveAuthData(response);
          } else {
            console.error('❌ Login response\'da token veya user bilgisi yok:', response);
            throw new Error('Token veya kullanıcı bilgisi alınamadı');
          }
        }),
        catchError(error => {
          console.error('❌ Login error:', error);
          return throwError(() => error);
        })
      );
  }

  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    const roleName = user?.roleName?.toLowerCase();
    return roleName === 'admin' || user?.roleId === 1;
  }

  // 🔥 Kayıt işlemi
  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService.register(payload)
      .pipe(
        tap((response: RegisterResponse) => {
          console.log('✅ Register response:', response);
        }),
        catchError(error => {
          console.error('❌ Register error:', error);
          return throwError(() => error);
        })
      );
  }

  // 🔥 Çıkış işlemi
  logout(payload?: LogoutRequest): Observable<LogoutResponse> {
    const logoutPayload = payload || {};
    
    return this.apiService.logout(logoutPayload)
      .pipe(
        tap((response: LogoutResponse) => {
          console.log('✅ Logout response:', response);
          this.clearAuthData();
        }),
        catchError(error => {
          console.error('❌ Logout error:', error);
          // Hata olsa bile auth data'yı temizle
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  // 🔥 Şifre unuttum
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.apiService.forgotPassword(email)
      .pipe(
        tap((response: ForgotPasswordResponse) => {
          console.log('✅ Forgot password response:', response);
        }),
        catchError(error => {
          console.error('❌ Forgot password error:', error);
          return throwError(() => error);
        })
      );
  }

  // 🔥 Şifre sıfırlama
  resetPassword(email: string, token: string, newPassword: string): Observable<ResetPasswordResponse> {
    return this.apiService.resetPassword({ email, token, newPassword })
      .pipe(
        tap((response: ResetPasswordResponse) => {
          console.log('✅ Reset password response:', response);
        }),
        catchError(error => {
          console.error('❌ Reset password error:', error);
          return throwError(() => error);
        })
      );
  }

  // 🔥 Auth test
  testAuth(): Observable<any> {
    return this.apiService.testAuth();
  }

  // Access token'ı al
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Kullanıcı verilerini al
  getCurrentUser(): User | null {
    if (!this.isBrowser) return null;
    
    try {
      const userDataStr = localStorage.getItem(this.USER_DATA_KEY);
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
      
      // Eğer localStorage'da yoksa subject'ten al
      return this.currentUserSubject.value;
    } catch (error) {
      console.error('Kullanıcı verisi alınamadı:', error);
      return null;
    }
  }

  // Giriş yapılmış mı kontrol et
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Token'ın geçerli olup olmadığını kontrol et (JWT parse)
  isTokenValid(token: string): boolean {
    if (!token || !this.isBrowser) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  // 🔥 Auth verilerini kaydet
  private saveAuthData(response: LoginResponse): void {
    if (!this.isBrowser) return;
    
    console.log('💾 Saving auth data to localStorage');
    
    // Token'ı kaydet
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.token);
    
    // User bilgilerini kaydet
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(response.user));
    
    // BehaviorSubject'i güncelle
    this.currentUserSubject.next(response.user);
    
    console.log('🔐 Auth data saved successfully:', response.user);
  }

  // Auth verilerini temizle
  clearAuthData(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    
    this.currentUserSubject.next(null);
    console.log('🗑️ Auth data cleared');
  }

  // localStorage'dan kullanıcı verilerini al
  private getUserDataFromStorage(): User | null {
    if (!this.isBrowser) return null;
    
    try {
      const userData = localStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Kullanıcı verisi parse edilemedi:', error);
      return null;
    }
  }

  // Uygulama başlatılırken auth durumunu kontrol et
  private checkAuthState(): void {
    if (!this.isBrowser) return;
    
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    if (token && user) {
      // JWT token süresi kontrol et
      if (!this.isTokenValid(token)) {
        console.log('🕒 Token expired, clearing auth data');
        this.clearAuthData();
      } else {
        console.log('✅ Auth state valid, user logged in');
        this.currentUserSubject.next(user);
      }
    }
  }

  // Refresh token (backend'de yok)
  refreshToken(): Observable<LoginResponse> {
    return throwError(() => new Error('Refresh token endpoint mevcut değil'));
  }
}