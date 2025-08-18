// src/app/pages/dashboard/dashboard.component.ts
// Dashboard bileşeninin düzeltilmiş ve güncellenmiş TypeScript kodu

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { LogoutRequest } from '../../models/auth/auth.models';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service';

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
  protected surveyService = inject(SurveyService);
  protected router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: any; // Backend'den gelen user data: {userId, username, email}
  isMenuOpen = true;
  notificationCount = 0;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay(),
      takeUntil(this.destroy$)
    );

  // Menü öğeleri
  menuItems = [
    { name: 'Anasayfa', icon: 'home', route: '/dashboard', exact: true },
    { name: 'Anketlerim', icon: 'assignment', route: '/dashboard/surveys', badge: 0 },
    { name: 'Yeni Anket', icon: 'add_circle', route: '/dashboard/surveys/create' },
    { name: 'Analizler', icon: 'analytics', route: '/dashboard/analytics' },
    { name: 'Profil', icon: 'person', route: '/dashboard/profile' },
    { name: 'Ayarlar', icon: 'settings', route: '/dashboard/settings' },
    { name: 'Yardım', icon: 'help_outline', route: '/dashboard/help' }
  ];

  ngOnInit(): void {
    // 🔥 Backend'den gelen user data yapısına göre
    this.currentUser = this.authService.getUserData(); 
    console.log('📊 Dashboard - Current user:', this.currentUser);
    
    if (!this.currentUser) {
      console.warn('❌ Kullanıcı verisi bulunamadı, login\'e yönlendiriliyor');
      this.router.navigate(['/login']);
      return;
    }

    // Anket sayısını alma
    this.surveyService.getSurveyCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        const surveysItem = this.menuItems.find(item => item.name === 'Anketlerim');
        if (surveysItem) {
          surveysItem.badge = count;
        }
      });
        
    // Bildirim simülasyonu
    setTimeout(() => {
      this.notificationCount = 3;
    }, 1000);

    // Telefon boyutunda menüyü kapatma
    this.isHandset$.pipe(takeUntil(this.destroy$)).subscribe(isHandset => {
      this.isMenuOpen = !isHandset;
    });

    // Rota değişimlerini dinleme
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // getCurrentPageTitle() metodu her rota değişiminde çağrılacak
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔥 PUBLIC - HTML template'de kullanılacak metodlar
  
  // Email'den isim çıkarma ve initials oluşturma
  getInitials(): string {
    const displayName = this.getUserDisplayName();
    
    if (displayName.includes(' ')) {
      // İsim ve soyisim varsa ilk harflerini al
      const parts = displayName.split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (displayName.length >= 2) {
      // Tek kelimeyse ilk 2 harfi al
      return displayName.substring(0, 2).toUpperCase();
    } else {
      // Son çare olarak ilk harfi al
      return displayName.substring(0, 1).toUpperCase();
    }
  }

  // 🔥 PUBLIC - Email'den kullanıcı ismini çıkar veya username kullan
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Kullanıcı';
    
    // Önce email'den isim çıkarmaya çalış
    if (this.currentUser.email) {
      const emailName = this.extractNameFromEmail(this.currentUser.email);
      if (emailName && emailName !== 'user') {
        return emailName;
      }
    }
    
    // Email'den çıkaramazsa username'i kullan
    const username = this.currentUser.username || 'kullanici';
    return this.capitalizeString(username);
  }

  // 🔥 PUBLIC - Gerçek kullanıcı email'ini döndür
  getUserEmail(): string {
    return this.currentUser?.email || 'user@ankets.com';
  }

  // 🔥 PRIVATE - Yardımcı metodlar

  // Email'den isim çıkarma fonksiyonu
  private extractNameFromEmail(email: string): string {
    try {
      // Email'in @ işaretinden önceki kısmı al
      const localPart = email.split('@')[0];
      
      // Nokta, çizgi, alt çizgi ile ayrılmışsa birleştir
      let name = localPart
        .replace(/[._-]/g, ' ')  // Özel karakterleri boşlukla değiştir
        .replace(/\d+/g, '')     // Sayıları kaldır
        .trim();
      
      // Her kelimeyi büyük harfle başlat
      name = name.split(' ')
        .map(word => this.capitalizeString(word))
        .filter(word => word.length > 0) // Boş kelimeleri filtrele
        .join(' ');
      
      return name || 'Kullanıcı';
    } catch (error) {
      console.warn('Email\'den isim çıkarılamadı:', error);
      return 'Kullanıcı';
    }
  }

  // String'i büyük harfle başlatma
  private capitalizeString(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // 🔥 PUBLIC - Diğer metodlar

  // Sayfa başlığını getir
  getCurrentPageTitle(): string {
    let title = 'Anasayfa';

    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    if (route.data['title']) {
      title = route.data['title'];
    } else {
      const currentRouteUrl = this.router.url.split('?')[0];
      const menuItem = this.menuItems.find(item => {
        if (item.exact) {
          return item.route === currentRouteUrl;
        }
        return currentRouteUrl.startsWith(item.route);
      });

      if (menuItem) {
        title = menuItem.name;
      }
    }
    return title;
  }

  logout() {
    console.log('🚪 Çıkış işlemi başlatılıyor...');
    
    // Backend'de logout endpoint'i varsa kullan
    const logoutRequest: LogoutRequest = {
      // Backend'de hangi fieldlar gerekiyorsa ekleyin
    };

    this.authService.logout(logoutRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Logout başarılı');
          this.handleLogout();
        },
        error: (err) => {
          console.error('❌ Logout error:', err);
          // Hata olsa bile çıkış yap
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
        this.router.navigate(['/dashboard/surveys/create']);
        break;
      case 'notifications':
        console.log('📢 Bildirimler açılıyor...');
        this.notificationCount = 0;
        break;
      case 'search':
        this.router.navigate(['/dashboard/search']);
        break;
      case 'help':
        this.router.navigate(['/dashboard/help']);
        break;
      default:
        console.log(`❓ Bilinmeyen action: ${action}`);
    }
  }
}
