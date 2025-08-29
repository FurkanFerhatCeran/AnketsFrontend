// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
// Şifremi unuttum sayfasını içe aktarıyoruz
import { AdminGuard } from './guards/admin.guard';
import { AdminLogsComponent } from './pages/admin/admin-logs.component';
import { AdminSurveysComponent } from './pages/admin/admin-surveys.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/NotFound/not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';
// Ayarlar bileşeni için gerekli import
import { SettingsComponent } from './pages/settings/settings.component';

import { HomeComponent } from './pages/home/home.component';
// Anket sayfalarını import ediyoruz
import { AboutComponent } from './pages/about/about.component';
import { SurveyCreateComponent } from './pages/surveys/survey-create/survey-create.component';
import { SurveyEditComponent } from './pages/surveys/survey-edit/survey-edit.component';
import { SurveyListComponent } from './pages/surveys/survey-list/survey-list.component';
import { SurveyResponsesComponent } from './pages/surveys/survey-responses/survey-responses.component';
import { SurveyTakeComponent } from './pages/surveys/survey-take/survey-take.component';


import { AiAnalysisComponent } from './pages/ai-analysis/ai-analysis.component'; // <-- AI Analysis Component'i import edin

export const routes: Routes = [
  // Giriş yapmadan erişilebilen yollar
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Eksik olan 'şifremi unuttum' rotası eklendi
  { path: 'forgot-password', component: ForgotPasswordComponent },
  
  // Oturum açtıktan sonra erişilebilen yollar (AuthGuard ile korunuyor)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Dashboard ana sayfa olarak home'u göster
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      
      // Anket ile ilgili sayfalar dashboard'un alt rotalarıdır
      { path: 'surveys', component: SurveyListComponent },
      { path: 'surveys/create', component: SurveyCreateComponent },
      { path: 'surveys/edit/:id', component: SurveyEditComponent },
      { path: 'surveys/take/:id', component: SurveyTakeComponent },
      { path: 'surveys/responses/:id', component: SurveyResponsesComponent },
      
      // Hakkımızda sayfası eklendi
      { path: 'about', component: AboutComponent },


            // Yapay Zeka Analiz rotası eklendi
      { path: 'ai-analysis', component: AiAnalysisComponent },
      { path: 'ai-analysis/:id', component: AiAnalysisComponent }, // ID ile analiz


         // Ayarlar rotası eklendi
      { path: 'settings', component: SettingsComponent }
    ]
  },
  // Admin area (separate layout)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'surveys', pathMatch: 'full' },
      { path: 'surveys', component: AdminSurveysComponent },
      { path: 'logs', component: AdminLogsComponent }
    ]
  },
  
  // Oturum açma gerektirmeyen anket görüntüleme (public) sayfaları için
  // Eğer anketler herkese açık olacaksa bu rotaları korumasız bırakabiliriz
  // Ancak uygulamanızda login sonrası erişim olduğu için bu yolları kaldırmak daha iyi.
  // { path: 'public/surveys/take/:id', component: SurveyTakeComponent },

  // Public anket önizleme (login gerektirmeyen)
  { path: 'survey/:id', component: SurveyTakeComponent },

  // ** En sona eklenmeli! **
  // Tanımlanan yollar dışında kalan tüm istekleri 404 sayfasına yönlendirir
  { path: '**', component: NotFoundComponent }
];