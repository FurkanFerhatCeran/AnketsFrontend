import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-users">
      <div class="page-header">
        <div class="header-content">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            <span>Geri</span>
          </button>
          <div class="page-title">
            <h1>Kullanıcı Yönetimi</h1>
            <p>Sistem kullanıcılarını görüntüleyin ve yönetin</p>
          </div>
        </div>
      </div>
      
      <div class="users-content">
        <div class="users-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalUsers }}</div>
              <div class="stat-label">Toplam Kullanıcı</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ activeUsers }}</div>
              <div class="stat-label">Aktif Kullanıcı</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon admin">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ adminUsers }}</div>
              <div class="stat-label">Admin Kullanıcı</div>
            </div>
          </div>
        </div>
        
        <div class="users-table-section">
          <div class="section-header">
            <h3>Kullanıcı Listesi</h3>
            <div class="search-box">
              <input type="text" placeholder="Kullanıcı ara..." (input)="onSearch($event)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
          
          <div class="users-table">
            <div class="table-header">
              <div class="th">Kullanıcı</div>
              <div class="th">Email</div>
              <div class="th">Rol</div>
              <div class="th">Durum</div>
              <div class="th">Kayıt Tarihi</div>
              <div class="th">İşlemler</div>
            </div>
            
            <div class="table-body">
              <div *ngFor="let user of filteredUsers" class="table-row">
                <div class="td user-info">
                  <div class="user-avatar">
                    <span>{{ getUserInitials(user.nameSurname) }}</span>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.nameSurname }}</div>
                    <div class="user-username">@{{ user.username }}</div>
                  </div>
                </div>
                <div class="td">{{ user.email }}</div>
                <div class="td">
                  <span class="role-badge" [class]="getRoleClass(user.roleName)">
                    {{ user.roleName }}
                  </span>
                </div>
                <div class="td">
                  <span class="status-badge" [class]="getStatusClass(user.isActive)">
                    {{ user.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </div>
                <div class="td">{{ formatDate(user.createdAt) }}</div>
                <div class="td actions">
                  <button class="action-btn edit" (click)="editUser(user)" title="Düzenle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn delete" (click)="deleteUser(user)" title="Sil">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', sans-serif;
    }
    
    .page-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 20px 24px;
    }
    
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }
    
    .back-btn:hover {
      border-color: #2d1b69;
      color: #2d1b69;
    }
    
    .page-title h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px 0;
    }
    
    .page-title p {
      color: #64748b;
      margin: 0;
      font-size: 14px;
    }
    
    .users-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .users-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    .stat-icon.active {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    }
    
    .stat-icon.admin {
      background: linear-gradient(135deg, #2d1b69 0%, #11047a 100%);
    }
    
    .stat-info .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }
    
    .stat-info .stat-label {
      color: #64748b;
      font-size: 14px;
    }
    
    .users-table-section {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .section-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .section-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    .search-box {
      position: relative;
    }
    
    .search-box input {
      padding: 8px 12px 8px 36px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      min-width: 250px;
    }
    
    .search-box svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
    
    .users-table .table-header {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr 1fr;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }
    
    .users-table .th {
      padding: 12px 16px;
      border-right: 1px solid #e2e8f0;
    }
    
    .users-table .th:last-child {
      border-right: none;
    }
    
    .users-table .table-row {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr 1fr;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }
    
    .users-table .table-row:hover {
      background: #f8fafc;
    }
    
    .users-table .td {
      padding: 12px 16px;
      border-right: 1px solid #e2e8f0;
      font-size: 14px;
      color: #374151;
      display: flex;
      align-items: center;
    }
    
    .users-table .td:last-child {
      border-right: none;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }
    
    .user-name {
      font-weight: 500;
      color: #1e293b;
    }
    
    .user-username {
      font-size: 12px;
      color: #64748b;
    }
    
    .role-badge, .status-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .role-badge.admin {
      background: rgba(45, 27, 105, 0.1);
      color: #2d1b69;
    }
    
    .role-badge.user {
      background: rgba(14, 165, 233, 0.1);
      color: #0ea5e9;
    }
    
    .status-badge.active {
      background: rgba(5, 150, 105, 0.1);
      color: #059669;
    }
    
    .status-badge.inactive {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .action-btn.edit {
      background: rgba(14, 165, 233, 0.1);
      color: #0ea5e9;
    }
    
    .action-btn.edit:hover {
      background: rgba(14, 165, 233, 0.2);
    }
    
    .action-btn.delete {
      background: rgba(220, 38, 38, 0.1);
      color: #dc2626;
    }
    
    .action-btn.delete:hover {
      background: rgba(220, 38, 38, 0.2);
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  totalUsers = 0;
  activeUsers = 0;
  adminUsers = 0;
  
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  isLoading = false;

  constructor(
    private router: Router, 
    private api: ApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
  }

  // İstatistikleri yükle
  loadStats(): void {
    // Toplam kullanıcı sayısı
    this.api.getAdminUsersCount().subscribe({
      next: (res: any) => {
        this.totalUsers = res?.count ?? 0;
      },
      error: (err) => {
        console.error('Toplam kullanıcı sayısı yüklenirken hata:', err);
        this.totalUsers = 0;
      }
    });

    // Aktif kullanıcı sayısı
    this.api.getAdminActiveUsersCount().subscribe({
      next: (res: any) => {
        this.activeUsers = res?.count ?? 0;
      },
      error: (err) => {
        console.error('Aktif kullanıcı sayısı yüklenirken hata:', err);
        this.activeUsers = 0;
      }
    });
  }

  // Kullanıcı listesini yükle
  loadUsers(): void {
    this.isLoading = true;
    console.log('🔄 Kullanıcılar yükleniyor...');

    // Backend'den kullanıcıları çek
    const endpoint = '/api/Admin/users';
    this.http.get(`${environment.apiUrl}${endpoint}`).subscribe({
      next: (res: any) => {
        console.log('✅ Backend yanıtı:', res);
        this.processUsersResponse(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Backend hatası:', err);
        this.isLoading = false;
        // Hata durumunda mock verileri göster
        this.loadMockUsers();
      }
    });
  }

  // Backend response'unu işle
  private processUsersResponse(res: any): void {
    // Backend'den gelen format: { items: [...], total: number, page: number, pageSize: number }
    const items = res?.items || [];
    const total = res?.total || 0;
    
    console.log(`📊 ${items.length} kullanıcı bulundu, toplam: ${total}`);
    
    if (Array.isArray(items) && items.length > 0) {
      // Backend'den gelen veriyi doğrudan kullan
      this.users = items.map((u: any) => ({
        userId: u.userId,
        nameSurname: u.nameSurname,
        username: u.username,
        email: u.email,
        roleName: u.roleName,
        isActive: u.isActive,
        createdAt: u.createdAt
      }));

      this.filteredUsers = [...this.users];

      // Admin kullanıcı sayısını hesapla
      this.adminUsers = this.users.filter(u => 
        (u.roleName || '').toLowerCase().includes('admin')
      ).length;

      // Backend'den gelen total değerini kullan
      if (total > 0) {
        this.totalUsers = total;
      } else {
        this.totalUsers = this.users.length;
      }

      // Aktif kullanıcı sayısını hesapla
      this.activeUsers = this.users.filter(u => u.isActive).length;

      console.log(`✅ ${this.users.length} kullanıcı yüklendi`);
      console.log(`📈 Toplam: ${this.totalUsers}, Aktif: ${this.activeUsers}, Admin: ${this.adminUsers}`);
    } else {
      console.warn('⚠️ Backend\'den kullanıcı verisi gelmedi');
      this.users = [];
      this.filteredUsers = [];
    }
  }

  // Mock kullanıcılar (sadece hata durumunda)
  private loadMockUsers(): void {
    console.log('⚠️ Mock kullanıcılar yükleniyor (backend hatası nedeniyle)');
    this.users = [
      {
        userId: 1,
        nameSurname: 'Admin User',
        username: 'admin',
        email: 'admin@ankets.com',
        roleName: 'Admin',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    this.filteredUsers = [...this.users];
    this.totalUsers = 1;
    this.activeUsers = 1;
    this.adminUsers = 1;
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.filteredUsers = this.users.filter(user => 
      (user.nameSurname || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getUserInitials(nameSurname: string): string {
    if (!nameSurname) return 'U';
    return nameSurname.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRoleClass(roleName: string): string {
    return (roleName || '').toLowerCase().includes('admin') ? 'admin' : 'user';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'active' : 'inactive';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  }

  editUser(user: any): void {
    console.log('Edit user:', user);
    // TODO: Edit user modal/page
  }

  deleteUser(user: any): void {
    console.log('Delete user:', user);
    // TODO: Delete confirmation modal
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}

