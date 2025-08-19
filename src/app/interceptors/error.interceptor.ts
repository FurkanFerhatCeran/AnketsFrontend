import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Bilinmeyen bir hata oluştu';

        if (error.error instanceof ErrorEvent) {
          // Client-side hata
          errorMessage = `Bağlantı hatası: ${error.error.message}`;
        } else {
          // Server-side hata
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Geçersiz istek';
              break;
            case 401:
              errorMessage = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
              this.authService.clearAuthData();
              this.router.navigate(['/login']);
              break;
            case 403:
              errorMessage = 'Bu işlem için yetkiniz bulunmuyor';
              break;
            case 404:
              errorMessage = 'İstenen kaynak bulunamadı';
              break;
            case 500:
              errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
              break;
            default:
              errorMessage = error.error?.message || `Hata kodu: ${error.status}`;
          }
        }

        console.error('HTTP Error:', error);
        console.error('Error Message:', errorMessage);
        
        return throwError(() => ({
          ...error,
          userMessage: errorMessage
        }));
      })
    );
  }
}