// src/app/app.config.ts
// Ana uygulama yapılandırma dosyası (Tüm özellikler birleştirilmiş)

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

// Bu import yolu, son verdiğiniz koda göre ayarlandı.
// Eğer rota dosyanızın adı 'routes.ts' ise, aşağıdaki satırı
// 'import { routes } from './routes';' olarak güncellediğinizden emin olun.
import { routes } from './app.routes'; 

import { authInterceptor } from './core/interceptors/auth.interceptor'; // authInterceptor'ı import et

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Performans iyileştirmesi için bölge değişiklik tespiti
    provideRouter(routes), // Uygulamanızın yönlendirmelerini sağlar
    provideClientHydration(), // Sunucu tarafı render ve hidrasyon desteği
    provideHttpClient(
      withFetch(), // HttpClient'ı fetch API desteğiyle sağlar
      withInterceptors([authInterceptor]) // HTTP isteklerine authInterceptor'ı ekler
    )
  ]
};
