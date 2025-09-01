import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss']
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  filteredLogs: any[] = [];
  filterType = 'all';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 25;
  total = 0;
  
  // Yeni eklenen: Log türü seçimi
  logType = 'all'; // 'all', 'admin', 'user'

  constructor(
    private router: Router, 
    private api: ApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  // Log türü değiştiğinde çağrılır
  onLogTypeChange(event: any): void {
    this.logType = event.target.value;
    this.currentPage = 1;
    this.loadLogs();
  }

  loadLogs(): void {
    if (this.logType === 'admin') {
      // Sadece admin logları
      this.loadAdminLogs();
    } else if (this.logType === 'user') {
      // Sadece kullanıcı logları
      this.loadUserLogs();
    } else {
      // Tüm loglar (hem admin hem kullanıcı)
      this.loadAllLogs();
    }
  }

  // Admin logları yükle
  loadAdminLogs(): void {
    this.api.getAdminLogsPaged(this.currentPage, this.itemsPerPage).subscribe({
      next: (res: any) => {
        this.processLogsResponse(res);
      },
      error: (err) => {
        console.error('Admin logları yüklenirken hata:', err);
        this.handleError();
      }
    });
  }

  // Kullanıcı logları yükle (yeni endpoint)
  loadUserLogs(): void {
    // Backend'de /api/Logs/user endpoint'i varsa kullan
    const endpoint = `/api/Logs/user?page=${this.currentPage}&pageSize=${this.itemsPerPage}`;
    this.http.get(`${environment.apiUrl}${endpoint}`).subscribe({
      next: (res: any) => {
        this.processLogsResponse(res);
      },
      error: (err) => {
        console.error('Kullanıcı logları yüklenirken hata:', err);
        // Fallback: genel log endpoint'ini dene
        this.loadAllLogs();
      }
    });
  }

  // Tüm logları yükle (yeni endpoint)
  loadAllLogs(): void {
    // Backend'de /api/Logs endpoint'i varsa kullan
    const endpoint = `/api/Logs?page=${this.currentPage}&pageSize=${this.itemsPerPage}`;
    this.http.get(`${environment.apiUrl}${endpoint}`).subscribe({
      next: (res: any) => {
        this.processLogsResponse(res);
      },
      error: (err) => {
        console.error('Tüm loglar yüklenirken hata:', err);
        // Fallback: admin loglarına geri dön
        console.log('Fallback: Admin logları yükleniyor...');
        this.loadAdminLogs();
      }
    });
  }

  // Log response'ını işle
  private processLogsResponse(res: any): void {
    const items = res?.items || res?.data || [];
    this.total = res?.total || res?.count || items.length;
    
    this.logs = items.map((l: any) => ({
      id: l.logId ?? l.id ?? Math.random(),
      timestamp: l.createdAt ? new Date(l.createdAt) : new Date(),
      action: l.action ?? l.message ?? 'Bilinmeyen işlem',
      user: l.userId ?? l.userName ?? l.email ?? '-',
      ip: l.ipAddress ?? l.ip ?? '-',
      status: this.determineStatus(l),
      details: l.details ?? l.description ?? '',
      logType: l.logType ?? 'system'
    }));
    
    this.filteredLogs = [...this.logs];
  }

  // Log durumunu belirle
  private determineStatus(log: any): string {
    if (log.status) return log.status;
    if (log.level === 'ERROR' || log.level === 'error') return 'error';
    if (log.level === 'WARN' || log.level === 'warn') return 'warning';
    return 'success';
  }

  // Hata durumunda
  private handleError(): void {
    this.logs = [];
    this.filteredLogs = [];
    this.total = 0;
  }

  filterLogs(): void {
    this.filteredLogs = this.logs.filter(log => {
      const matchesType = this.filterType === 'all' || log.status === this.filterType;
      const matchesSearch = !this.searchTerm || 
        (log.action || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (log.user || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (log.ip || '').includes(this.searchTerm);
      
      return matchesType && matchesSearch;
    });
    
    this.currentPage = 1;
  }

  onFilterChange(event: any): void {
    this.filterType = event.target.value;
    this.filterLogs();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.filterLogs();
  }

  getPaginatedLogs(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredLogs.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil((this.total || 0) / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'status-success';
      case 'error': return 'status-error';
      case 'warning': return 'status-warning';
      default: return 'status-default';
    }
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('tr-TR');
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}

