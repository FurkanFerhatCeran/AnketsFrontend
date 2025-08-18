import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/auth/auth.models';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  if (accessToken) {
    req = addToken(req, accessToken);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && accessToken) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // 🔥 Backend'de refresh token endpoint'i yok, bu yüzden bu kısmı kaldıralım
    // Veya authService.testAuth() ile token geçerliliğini test edebiliriz
    return authService.testAuth().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        // Test başarılıysa token hâlâ geçerli
        const currentToken = authService.getAccessToken();
        if (currentToken) {
          refreshTokenSubject.next(currentToken);
          return next(addToken(request, currentToken));
        } else {
          authService.clearAuthData();
          return throwError(() => new Error('Token geçersiz, yeniden giriş yapın.'));
        }
      }),
      catchError((err: any) => {
        isRefreshing = false;
        authService.clearAuthData();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token));
      })
    );
  }
}
