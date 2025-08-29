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
  itemsPerPage = 20;
  total = 0;

  constructor(
    private router: Router, 
    private api: ApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    // Backend: GET /api/Admin/logs/paged?page=X&pageSize=Y
    this.api.getAdminLogsPaged(this.currentPage, this.itemsPerPage).subscribe((res: any) => {
      const items = res?.items || [];
      this.total = res?.total || items.length;
      // Map backend fields -> UI model
      this.logs = items.map((l: any) => ({
        id: l.logId ?? l.id,
        timestamp: l.createdAt ? new Date(l.createdAt) : new Date(),
        action: l.action,
        user: l.userId ?? '-',
        ip: l.ipAddress ?? '-',
        status: 'success',
        details: ''
      }));
      this.filteredLogs = [...this.logs];
    });
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

