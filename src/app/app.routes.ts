import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/NotFound/not-found.component'; // Doğru yolu kontrol et ve düzelt
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  // Uygulamanın kök dizinini login sayfasına yönlendir.
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },

  // ** En sona eklenmeli! **
  // Geçersiz bir URL girildiğinde NotFoundComponent'e yönlendir
  { path: '**', component: NotFoundComponent }
];
