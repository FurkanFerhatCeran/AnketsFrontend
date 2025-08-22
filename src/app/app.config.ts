// app.config.ts
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';



import { MessageService } from 'primeng/api'; // Bu satırı ekleyin


// Servisleri import et
import { ApiService } from './services/api.service';
import { QuestionService } from './services/question.service';
import { SurveyService } from './services/survey.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    MessageService, // Bu satırı ekleyin
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    // Servisleri providers'a ekle
    ApiService,
    SurveyService,
    QuestionService
  ]
};