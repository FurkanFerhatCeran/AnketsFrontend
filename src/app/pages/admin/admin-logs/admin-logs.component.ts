import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  itemsPerPage = 20;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    // TODO: Admin servisinden gerçek log verilerini çek
    this.logs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        action: 'Kullanıcı Girişi',
        user: 'john.doe@email.com',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success',
        details: 'Başarılı giriş yapıldı'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        action: 'Anket Oluşturuldu',
        user: 'jane.smith@email.com',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        status: 'success',
        details: 'Müşteri Memnuniyet Anketi oluşturuldu'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        action: 'Başarısız Giriş Denemesi',
        user: 'unknown@email.com',
        ip: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        status: 'error',
        details: 'Geçersiz şifre girişi'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        action: 'Anket Yanıtlandı',
        user: 'user123@email.com',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS)',
        status: 'success',
        details: 'Anket ID: 15 yanıtlandı'
      },
      // Daha fazla örnek log
      ...Array.from({ length: 50 }, (_, i) => ({
        id: i + 5,
        timestamp: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
        action: ['Kullanıcı Girişi', 'Anket Oluşturuldu', 'Anket Yanıtlandı', 'Şifre Değiştirildi'][i % 4],
        user: `user${i}@email.com`,
        ip: `192.168.1.${100 + (i % 50)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: i % 10 === 0 ? 'error' : 'success',
        details: `İşlem detayı ${i + 5}`
      }))
    ];
    
    this.filteredLogs = [...this.logs];
  }

  filterLogs(): void {
    this.filteredLogs = this.logs.filter(log => {
      const matchesType = this.filterType === 'all' || log.status === this.filterType;
      const matchesSearch = !this.searchTerm || 
        log.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.ip.includes(this.searchTerm);
      
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
    return Math.ceil(this.filteredLogs.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    // Basit sayfalama: maksimum 5 sayfa göster
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

