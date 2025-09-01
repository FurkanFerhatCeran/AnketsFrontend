import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
export class AdminLogsComponent implements OnInit, AfterViewInit {
  logs: any[] = [];
  filteredLogs: any[] = [];
  filterType = 'all';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 25;
  total = 0;
  isLoading = false;
  dataLoaded = false;
  
  // Log türü seçimi
  logType = 'all'; // 'all', 'admin', 'user'

  constructor(
    private router: Router, 
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🔄 Admin Logs Component - ngOnInit');
    // Component başlatıldığında hemen logları yükle
    this.initializeLogs();
  }

  ngAfterViewInit(): void {
    console.log('🔄 Admin Logs Component - ngAfterViewInit');
    // View hazır olduktan sonra tekrar kontrol et
    if (!this.dataLoaded) {
      console.log(' View hazır, loglar tekrar yükleniyor...');
      this.initializeLogs();
    }
  }

  // Logları başlat
  private initializeLogs(): void {
    if (this.dataLoaded) {
      console.log('⚠️ Loglar zaten yüklenmiş, tekrar yüklenmiyor');
      return;
    }

    console.log('🔄 Loglar başlatılıyor...');
    this.loadLogs();
  }

  // Log türü değiştiğinde çağrılır
  onLogTypeChange(event: any): void {
    this.logType = event.target.value;
    this.currentPage = 1;
    this.loadLogs();
  }

  loadLogs(): void {
    console.log(`🔄 Loglar yükleniyor... Log türü: ${this.logType}`);
    this.isLoading = true;

    if (this.logType === 'admin') {
      this.loadAdminLogs();
    } else if (this.logType === 'user') {
      this.loadUserLogs();
    } else {
      this.loadAllLogs();
    }
  }

  // Admin logları yükle
  loadAdminLogs(): void {
    console.log('🔍 Admin logları yükleniyor...');
    this.api.getAdminLogsPaged(this.currentPage, this.itemsPerPage).subscribe({
      next: (res: any) => {
        console.log('✅ Admin logları yüklendi:', res);
        this.processLogsResponse(res);
        this.isLoading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges(); // Change detection'ı zorla
      },
      error: (err) => {
        console.error('❌ Admin logları yüklenirken hata:', err);
        this.handleError();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Kullanıcı logları yükle
  loadUserLogs(): void {
    console.log('🔍 Kullanıcı logları yükleniyor...');
    const endpoint = `/api/Logs/user?page=${this.currentPage}&pageSize=${this.itemsPerPage}`;
    this.http.get(`${environment.apiUrl}${endpoint}`).subscribe({
      next: (res: any) => {
        console.log('✅ Kullanıcı logları yüklendi:', res);
        this.processLogsResponse(res);
        this.isLoading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Kullanıcı logları yüklenirken hata:', err);
        console.log('🔄 Fallback: Genel log endpoint\'i deneniyor...');
        this.loadAllLogs();
      }
    });
  }

  // Tüm logları yükle
  loadAllLogs(): void {
    console.log('🔍 Tüm loglar yükleniyor...');
    const endpoint = `/api/Logs?page=${this.currentPage}&pageSize=${this.itemsPerPage}`;
    this.http.get(`${environment.apiUrl}${endpoint}`).subscribe({
      next: (res: any) => {
        console.log('✅ Tüm loglar yüklendi:', res);
        this.processLogsResponse(res);
        this.isLoading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Tüm loglar yüklenirken hata:', err);
        console.log('🔄 Fallback: Admin loglarına geri dönülüyor...');
        this.loadAdminLogs();
      }
    });
  }

  // Log response'ını işle
  private processLogsResponse(res: any): void {
    const items = res?.items || res?.data || res || [];
    this.total = res?.total || res?.count || items.length;
    
    console.log(`📊 ${items.length} log işleniyor, toplam: ${this.total}`);
    
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
    
    console.log(`✅ ${this.logs.length} log başarıyla işlendi`);
    console.log('📋 Log örnekleri:', this.logs.slice(0, 2));
    
    // Change detection'ı zorla
    this.cdr.detectChanges();
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
    console.warn('⚠️ Hata durumunda loglar temizleniyor');
    this.logs = [];
    this.filteredLogs = [];
    this.total = 0;
    this.dataLoaded = false;
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

