import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-surveys',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-surveys">
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
            <h1>Anket Yönetimi</h1>
            <p>Sistem anketlerini görüntüleyin ve yönetin</p>
          </div>
        </div>
      </div>
      
      <div class="surveys-content">
        <div class="surveys-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalSurveys }}</div>
              <div class="stat-label">Toplam Anket</div>
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
              <div class="stat-number">{{ activeSurveys }}</div>
              <div class="stat-label">Aktif Anket</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon responses">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalResponses }}</div>
              <div class="stat-label">Toplam Yanıt</div>
            </div>
          </div>
        </div>
        
        <div class="surveys-table-section">
          <div class="section-header">
            <h3>Anket Listesi</h3>
            <div class="header-actions">
              <select (change)="onFilterChange($event)" [value]="filterStatus">
                <option value="all">Tüm Anketler</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
                <option value="draft">Taslak</option>
              </select>
              <div class="search-box">
                <input type="text" placeholder="Anket ara..." (input)="onSearch($event)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="surveys-table">
            <div class="table-header">
              <div class="th">Anket</div>
              <div class="th">Oluşturan</div>
              <div class="th">Durum</div>
              <div class="th">Yanıt Sayısı</div>
              <div class="th">Oluşturulma</div>
            </div>
            
            <div class="table-body">
              <div *ngFor="let survey of filteredSurveys" class="table-row">
                <div class="td survey-info">
                  <div class="survey-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div class="survey-details">
                    <div class="survey-title">{{ survey.title }}</div>
                    <div class="survey-description">{{ survey.description }}</div>
                  </div>
                </div>
                <div class="td">{{ survey.creator }}</div>
                <div class="td">
                  <span class="status-badge" [class]="getStatusClass(survey.status)">
                    {{ getStatusText(survey.status) }}
                  </span>
                </div>
                <div class="td">
                  <div class="response-count">
                    <span class="count">{{ survey.responses }}</span>
                    <span class="label">yanıt</span>
                  </div>
                </div>
                <div class="td">{{ formatDate(survey.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-surveys {
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
    
    .surveys-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .surveys-stats {
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
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
    
    .stat-icon.active {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    }
    
    .stat-icon.responses {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
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
    
    .surveys-table-section {
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
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .header-actions select {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      background: white;
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
    
    .surveys-table .table-header {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1fr 1fr 1fr;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }
    
    .surveys-table .th {
      padding: 12px 16px;
      border-right: 1px solid #e2e8f0;
    }
    
    .surveys-table .th:last-child {
      border-right: none;
    }
    
    .surveys-table .table-row {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1fr 1fr 1fr;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }
    
    .surveys-table .table-row:hover {
      background: #f8fafc;
    }
    
    .surveys-table .td {
      padding: 12px 16px;
      border-right: 1px solid #e2e8f0;
      font-size: 14px;
      color: #374151;
      display: flex;
      align-items: center;
    }
    
    .surveys-table .td:last-child {
      border-right: none;
    }
    
    .survey-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .survey-icon {
      width: 32px;
      height: 32px;
      background: rgba(5, 150, 105, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #059669;
    }
    
    .survey-title {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 2px;
    }
    
    .survey-description {
      font-size: 12px;
      color: #64748b;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-badge.active {
      background: rgba(5, 150, 105, 0.1);
      color: #059669;
    }
    
    .status-badge.completed {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
    }
    
    .status-badge.draft {
      background: rgba(217, 119, 6, 0.1);
      color: #d97706;
    }
    
    .response-count {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .response-count .count {
      font-weight: 600;
      color: #1e293b;
    }
    
    .response-count .label {
      font-size: 12px;
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
    
    .action-btn.view {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
    }
    
    .action-btn.view:hover {
      background: rgba(100, 116, 139, 0.2);
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
export class AdminSurveysComponent implements OnInit, AfterViewInit {
  totalSurveys = 0;
  activeSurveys = 0;
  totalResponses = 0;
  
  surveys: any[] = [];
  filteredSurveys: any[] = [];
  searchTerm = '';
  filterStatus = 'all';
  isLoading = false;
  dataLoaded = false;

  constructor(
    private router: Router, 
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🔄 Admin Surveys Component - ngOnInit');
    // Component başlatıldığında hemen verileri yükle
    this.initializeData();
  }

  ngAfterViewInit(): void {
    console.log('🔄 Admin Surveys Component - ngAfterViewInit');
    // View hazır olduktan sonra tekrar kontrol et
    if (!this.dataLoaded) {
      console.log(' View hazır, veriler tekrar yükleniyor...');
      this.initializeData();
    }
  }

  // Verileri başlat
  private initializeData(): void {
    if (this.dataLoaded) {
      console.log('⚠️ Veriler zaten yüklenmiş, tekrar yüklenmiyor');
      return;
    }

    console.log('🔄 Veriler başlatılıyor...');
    this.loadStats();
    this.loadSurveys();
  }

  // Genel istatistikleri yükle
  loadStats(): void {
    console.log('📊 İstatistikler yükleniyor...');
    
    // Toplam anket sayısı
    this.api.getAdminSurveysPaged(1, 1).subscribe({
      next: (res: any) => {
        this.totalSurveys = res?.total ?? 0;
        console.log(`✅ Toplam anket sayısı: ${this.totalSurveys}`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Toplam anket sayısı yüklenirken hata:', err);
        this.totalSurveys = 0;
        this.cdr.detectChanges();
      }
    });

    // Toplam yanıt sayısı
    this.api.getAdminResponsesCount().subscribe({
      next: (res: any) => {
        this.totalResponses = res?.count ?? 0;
        console.log(`✅ Toplam yanıt sayısı: ${this.totalResponses}`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Toplam yanıt sayısı yüklenirken hata:', err);
        this.totalResponses = 0;
        this.cdr.detectChanges();
      }
    });
  }

  // Anket listesini yükle
  loadSurveys(): void {
    this.isLoading = true;
    console.log('🔄 Anketler yükleniyor...');

    // Backend'den anketleri çek
    this.api.getAdminSurveysPaged(1, 200).subscribe({
      next: (res: any) => {
        console.log('✅ Backend yanıtı:', res);
        const items = res?.items || [];
        
        if (items.length > 0) {
          // Her anket için yanıt sayısını çek
          this.loadSurveyResponses(items);
        } else {
          this.processSurveysResponse(res);
        }
      },
      error: (err) => {
        console.error('❌ Anketler yüklenirken hata:', err);
        this.isLoading = false;
        this.surveys = [];
        this.filteredSurveys = [];
        this.activeSurveys = 0;
        this.cdr.detectChanges();
      }
    });
  }

  // Her anket için yanıt sayısını çek
  private loadSurveyResponses(surveys: any[]): void {
    console.log(' Yanıt sayıları yükleniyor...');
    
    const surveyPromises = surveys.map(survey => {
      const surveyId = survey.surveyId ?? survey.id;
      return this.getSurveyResponseCount(surveyId).then(count => ({
        ...survey,
        responseCount: count
      }));
    });

    Promise.all(surveyPromises).then(enhancedSurveys => {
      console.log('✅ Yanıt sayıları yüklendi:', enhancedSurveys);
      this.processSurveysResponse({ items: enhancedSurveys, total: surveys.length });
    }).catch(err => {
      console.error('❌ Yanıt sayıları yüklenirken hata:', err);
      // Hata durumunda yanıt sayısı olmadan devam et
      this.processSurveysResponse({ items: surveys, total: surveys.length });
    });
  }

  // Tek bir anket için yanıt sayısını çek
  private async getSurveyResponseCount(surveyId: number): Promise<number> {
    try {
      // Önce API servisinden dene
      const response = await this.api.getSurveyStatistics(surveyId).toPromise();
      return response?.totalResponses ?? response?.responseCount ?? 0;
    } catch (err) {
      // API servisi çalışmazsa direkt HTTP ile dene
      try {
        const response = await this.http.get(`${environment.apiUrl}/api/SurveyResponses/statistics/${surveyId}`).toPromise() as any;
        return response?.totalResponses ?? response?.responseCount ?? response?.count ?? 0;
      } catch (httpErr) {
        console.warn(`⚠️ Anket ${surveyId} için yanıt sayısı alınamadı:`, httpErr);
        return 0;
      }
    }
  }

  // Anket response'unu işle
  private processSurveysResponse(res: any): void {
    const items = res?.items || [];
    console.log(` ${items.length} anket işleniyor...`);
    
    const mapped = items.map((s: any) => ({
      id: s.surveyId ?? s.id,
      title: s.title ?? s.surveyTitle ?? `#${s.surveyId ?? s.id}`,
      description: s.description ?? '',
      creator: s.creatorEmail ?? (s.creatorId ? `user:${s.creatorId}` : '-'),
      status: s.isActive ? 'active' : (s.isDraft ? 'draft' : 'completed'),
      responses: s.responseCount ?? s.responsesCount ?? s.responseCount ?? 0,
      createdAt: s.createdAt ?? s.createdOn ?? new Date().toISOString(),
      isActive: !!s.isActive
    }));

    this.surveys = mapped;
    this.filteredSurveys = [...this.surveys];

    // Aktif anket sayısı liste üzerinden
    this.activeSurveys = mapped.filter((m: any) => m.isActive).length;

    // Toplam anket sayısı fallback
    if (!this.totalSurveys && typeof res?.total === 'number') {
      this.totalSurveys = res.total;
    } else if (!this.totalSurveys) {
      this.totalSurveys = mapped.length;
    }

    // Toplam yanıt sayısını hesapla (fallback)
    if (!this.totalResponses) {
      this.totalResponses = mapped.reduce((sum: number, survey: any) => sum + (survey.responses || 0), 0);
    }

    this.isLoading = false;
    this.dataLoaded = true;
    
    console.log(`✅ ${this.surveys.length} anket yüklendi, toplam yanıt: ${this.totalResponses}`);
    
    // Change detection'ı zorla
    this.cdr.detectChanges();
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onFilterChange(event: any): void {
    this.filterStatus = event.target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredSurveys = this.surveys.filter(survey => {
      const matchesSearch = !this.searchTerm || 
        (survey.title || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (survey.description || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (survey.creator || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.filterStatus === 'all' || survey.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    return status;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'draft': return 'Taslak';
      default: return status;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  }

  viewSurvey(survey: any): void {
    console.log('View survey:', survey);
    // TODO: Navigate to survey view
  }

  editSurvey(survey: any): void {
    console.log('Edit survey:', survey);
    // TODO: Navigate to survey edit
  }

  deleteSurvey(survey: any): void {
    console.log('Delete survey:', survey);
    // TODO: Delete confirmation modal
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}

