import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentAdmin: any = null;
  stats = {
    totalUsers: 0,
    totalSurveys: 0,
    totalResponses: 0,
    activeUsers: 0
  };

  recentLogs: any[] = [];
  recentSurveys: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentAdmin = this.authService.getCurrentUser();
    this.loadAdminStats();
    this.loadRecentLogs();
    this.loadRecentSurveys();
  }

  loadAdminStats(): void {
    // TODO: Admin servisinden gerçek verileri çek
    this.stats = {
      totalUsers: 156,
      totalSurveys: 42,
      totalResponses: 1284,
      activeUsers: 23
    };
  }

  loadRecentLogs(): void {
    // TODO: Log servisinden gerçek verileri çek
    this.recentLogs = [
      {
        id: 1,
        action: 'Kullanıcı Girişi',
        user: 'john.doe@email.com',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        ip: '192.168.1.100',
        status: 'success'
      },
      {
        id: 2,
        action: 'Anket Oluşturuldu',
        user: 'jane.smith@email.com',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        ip: '192.168.1.101',
        status: 'success'
      },
      {
        id: 3,
        action: 'Başarısız Giriş Denemesi',
        user: 'unknown@email.com',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        ip: '10.0.0.1',
        status: 'error'
      },
      {
        id: 4,
        action: 'Anket Yanıtlandı',
        user: 'user123@email.com',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        ip: '192.168.1.102',
        status: 'success'
      }
    ];
  }

  loadRecentSurveys(): void {
    // TODO: Survey servisinden gerçek verileri çek
    this.recentSurveys = [
      {
        id: 1,
        title: 'Müşteri Memnuniyet Anketi',
        creator: 'admin@company.com',
        responses: 45,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 2,
        title: 'Çalışan Motivasyon Araştırması',
        creator: 'hr@company.com',
        responses: 23,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 3,
        title: 'Ürün Geri Bildirim Formu',
        creator: 'product@company.com',
        responses: 67,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed'
      }
    ];
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Hata olsa bile çıkış yap
        this.authService.clearAuthData();
        this.router.navigate(['/login']);
      }
    });
  }

  goToUserDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToLogs(): void {
    this.router.navigate(['/admin/logs']);
  }

  navigateToSurveys(): void {
    this.router.navigate(['/admin/surveys']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'status-success';
      case 'error': return 'status-error';
      case 'warning': return 'status-warning';
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return 'Şimdi';
  }
}

