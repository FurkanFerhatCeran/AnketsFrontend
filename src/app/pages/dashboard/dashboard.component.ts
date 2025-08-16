import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { LogoutRequest } from '../../models/auth/auth.models';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service'; // Yeni eklenen servis

// Material Modülleri
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  protected authService = inject(AuthService);
  protected surveyService = inject(SurveyService); // SurveyService enjekte edildi
  protected router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: any; // Kullanıcı verisi için dinamik tip
  isMenuOpen = true;
  notificationCount = 0; // Bildirim sayısı dinamik hale getirildi

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay(),
      takeUntil(this.destroy$)
    );

  menuItems = [
    { name: 'Anasayfa', icon: 'home', route: '/dashboard', exact: true },
    { name: 'Anketlerim', icon: 'assignment', route: '/surveys', badge: 0 }, // Badge değeri dinamik hale getirildi
    { name: 'Yeni Anket', icon: 'add_circle', route: '/surveys/create' },
    { name: 'Analizler', icon: 'analytics', route: '/analytics' },
    { name: 'Profil', icon: 'person', route: '/profile' }
  ];

  ngOnInit(): void {
    // Kullanıcı verisini servisten çekme
    this.currentUser = this.authService.getUserData();
    if (!this.currentUser) {
      // Eğer kullanıcı verisi yoksa login sayfasına yönlendir
      this.router.navigate(['/login']);
    }

    // Dinamik anket sayısını alma
    this.surveyService.getSurveyCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        // 'Anketlerim' menü öğesinin rozetini dinamik olarak güncelle
        const surveysItem = this.menuItems.find(item => item.name === 'Anketlerim');
        if (surveysItem) {
          surveysItem.badge = count;
        }
      });
      
    // Dinamik bildirim sayısını alma (Bu kısım için örnek bir simülasyon)
    // Gerçek bir uygulamada bir API çağrısı ile veriler çekilir.
    setTimeout(() => {
      this.notificationCount = 5; // Simülasyon: 5 bildirim geldi
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(): string {
    if (!this.currentUser?.nameSurname) return '';
    return this.currentUser.nameSurname
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }

  logout() {
    const refreshToken = this.authService.getRefreshToken();
    
    if (!refreshToken) {
      this.handleLogout();
      return;
    }

    const logoutRequest: LogoutRequest = {
      refreshToken: refreshToken,
      logoutFromAllDevices: false
    };

    this.authService.logout(logoutRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleLogout(),
        error: (err) => {
          console.error('Logout error:', err);
          this.handleLogout();
        }
      });
  }

  private handleLogout() {
    this.authService.clearAuthData();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  quickAction(action: string) {
    switch(action) {
      case 'new-survey':
        this.router.navigate(['/surveys/create']);
        break;
      case 'notifications':
        // Gerçek bir uygulamada bildirimler sayfasına yönlendirilir
        console.log('Bildirimlere yönlendiriliyor...');
        break;
    }
  }
}
