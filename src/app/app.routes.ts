// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
// Şifremi unuttum sayfasını içe aktarıyoruz
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/NotFound/not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';


import { HomeComponent } from './pages/home/home.component';
// Anket sayfalarını import ediyoruz
import { SurveyCreateComponent } from './pages/surveys/survey-create/survey-create.component';
import { SurveyEditComponent } from './pages/surveys/survey-edit/survey-edit.component';
import { SurveyListComponent } from './pages/surveys/survey-list/survey-list.component';
import { SurveyTakeComponent } from './pages/surveys/survey-take/survey-take.component';
import { AboutComponent } from './pages/about/about.component';

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
      { path: 'home', component: HomeComponent }, // ← Home route'u ekleyin
      { path: '', redirectTo: 'surveys', pathMatch: 'full' }, // Dashboard ana sayfa olarak anketleri göster
      { path: 'profile', component: ProfileComponent },
      
      // Anket ile ilgili sayfalar dashboard'un alt rotalarıdır
      { path: 'surveys', component: SurveyListComponent },
      { path: 'surveys/create', component: SurveyCreateComponent },
      { path: 'surveys/edit/:id', component: SurveyEditComponent },
      { path: 'surveys/take/:id', component: SurveyTakeComponent },
      
      // Hakkımızda sayfası eklendi
      { path: 'about', component: AboutComponent },
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
