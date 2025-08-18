import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  LogoutRequest, 
  LogoutResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse 
} from '../models/auth/auth.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly USER_DATA_KEY = 'userData';

  // Platform kontrolü için
  private isBrowser: boolean;

  // Kullanıcı durumu için BehaviorSubject
  private currentUserSubject = new BehaviorSubject<any>(null);
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

  // 🔥 Giriş işlemi - LoginResponseDto yapısına göre
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.apiService.login(payload)
      .pipe(
        tap((response: LoginResponse) => {
          console.log('✅ Login response:', response);
          
          // Backend'den LoginResponseDto geldiği için success kontrolü yok
          // Sadece token var mı kontrol edelim
          if (response.token) {
            this.saveAuthData(response);
          } else {
            console.error('❌ Login response\'da token yok:', response);
            throw new Error('Token alınamadı');
          }
        }),
        catchError(error => {
          console.error('❌ Login error:', error);
          return throwError(() => error);
        })
      );
  }

  // 🔥 Kayıt işlemi - RegisterResponseDto yapısına göre
  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService.register(payload)
      .pipe(
        tap((response: RegisterResponse) => {
          console.log('✅ Register response:', response);
          // RegisterResponseDto'da token yok, sadece user bilgileri var
          // Bu yüzden kayıttan sonra otomatik login yok
        }),
        catchError(error => {
          console.error('❌ Register error:', error);
          return throwError(() => error);
        })
      );
  }

  // 🔥 Çıkış işlemi - LogoutResponseDto yapısına göre
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

  // 🔥 Şifre unuttum - ForgotPasswordResponseDto yapısına göre
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

  // 🔥 Şifre sıfırlama - ResetPasswordResponseDto yapısına göre
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

  // Refresh token (backend'de yok gibi görünüyor)
  getRefreshToken(): string | null {
    return null; // Backend'de refresh token yok
  }

  // Kullanıcı verilerini al
  getUserData(): any {
    if (!this.isBrowser) return null;
    return this.getUserDataFromStorage();
  }

  // Giriş yapılmış mı kontrol et
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = this.getAccessToken();
    const user = this.getUserData();
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

  // 🔥 Auth verilerini kaydet - LoginResponseDto yapısına göre
  private saveAuthData(response: LoginResponse): void {
    if (!this.isBrowser) return;
    
    // Token'ı kaydet
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.token);
    
    // User bilgilerini kaydet (LoginResponseDto'daki fieldlar)
    const userData = {
      userId: response.userId,
      username: response.username,
      email: response.email
    };
    
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    
    console.log('🔐 Auth data saved:', {
      token: response.token.substring(0, 20) + '...',
      user: userData
    });
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
  private getUserDataFromStorage(): any {
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
    const user = this.getUserData();
    
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