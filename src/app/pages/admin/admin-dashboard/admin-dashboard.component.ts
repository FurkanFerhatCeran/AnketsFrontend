import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

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
    private api: ApiService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentAdmin = this.authService.getCurrentUser();
    this.loadAdminStats();
    this.loadRecentLogs();
    this.loadRecentSurveys();
  }

  loadAdminStats(): void {
    // Toplam anket sayısı
    this.api.getAdminSurveysPaged(1, 1).subscribe({
      next: (res: any) => {
        this.stats.totalSurveys = res?.total ?? 0;
      },
      error: (err) => {
        console.error('Anket sayısı yüklenirken hata:', err);
        this.stats.totalSurveys = 0;
      }
    });

    // Toplam kullanıcı sayısı
    this.http.get<{count: number}>(`${environment.apiUrl}/api/Admin/users/count`).subscribe({
      next: (res) => {
        this.stats.totalUsers = res?.count ?? 0;
      },
      error: (err) => {
        console.error('Kullanıcı sayısı yüklenirken hata:', err);
        this.stats.totalUsers = 0;
      }
    });

    // Aktif kullanıcı sayısı
    this.http.get<{count: number}>(`${environment.apiUrl}/api/Admin/users/active-count`).subscribe({
      next: (res) => {
        this.stats.activeUsers = res?.count ?? 0;
      },
      error: (err) => {
        console.error('Aktif kullanıcı sayısı yüklenirken hata:', err);
        this.stats.activeUsers = 0;
      }
    });

    // Toplam yanıt sayısı
    this.http.get<{count: number}>(`${environment.apiUrl}/api/Admin/responses/count`).subscribe({
      next: (res) => {
        this.stats.totalResponses = res?.count ?? 0;
      },
      error: (err) => {
        console.error('Yanıt sayısı yüklenirken hata:', err);
        this.stats.totalResponses = 0;
      }
    });
  }

  loadRecentLogs(): void {
    this.api.getAdminLogsPaged(1, 5).subscribe((res: any) => {
      const items = res?.items || [];
      this.recentLogs = items.map((l: any) => ({
        id: l.logId ?? l.id,
        action: l.action,
        user: l.userId ? String(l.userId) : '-',
        timestamp: l.createdAt ? new Date(l.createdAt) : new Date(),
        ip: l.ipAddress || '-',
        status: 'success'
      }));
    });
  }

  loadRecentSurveys(): void {
    this.api.getAdminSurveysPaged(1, 3).subscribe((res: any) => {
      const items = res?.items || [];
      this.recentSurveys = items.map((s: any) => ({
        id: s.surveyId ?? s.id,
        title: s.title ?? s.surveyTitle ?? `#${s.surveyId}`,
        creator: s.creatorId ? `user:${s.creatorId}` : '-',
        responses: s.responseCount ?? 0,
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        status: s.isActive ? 'active' : 'completed'
      }));
    });
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

