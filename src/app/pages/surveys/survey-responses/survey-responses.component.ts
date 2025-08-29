import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { Survey, SurveyResponse } from '../../../models/survey/survey.model';
import { ApiService } from '../../../services/api.service';
import { SurveyService } from '../../../services/survey.service';

@Component({
  selector: 'app-survey-responses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './survey-responses.component.html',
  styleUrls: ['./survey-responses.component.scss']
})
export class SurveyResponsesComponent implements OnInit, OnDestroy {
  surveyId: number = 0;
  surveyTitle: string = '';
  responses: SurveyResponse[] = [];
  isLoading: boolean = false;
  totalResponses: number = 0;
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  
  // Filters
  filterForm: FormGroup;
  
  // Table columns
  displayedColumns: string[] = ['id', 'respondentName', 'submittedAt', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private surveyService: SurveyService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.surveyId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.surveyId) {
      this.loadSurveyInfo();
      this.loadResponses();
      this.setupFilterListeners();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSurveyInfo(): void {
    // Survey bilgilerini yükle
    this.surveyService.getSurveyById(this.surveyId).subscribe({
      next: (survey: Survey | null) => {
        if (survey) {
          this.surveyTitle = survey.title;
        }
      },
      error: (error) => {
        console.error('Error loading survey info:', error);
      }
    });
  }

  private loadResponses(): void {
    this.isLoading = true;
    
    const params: any = {
      page: this.currentPage + 1, // API 1-based indexing kullanıyor olabilir
      pageSize: this.pageSize
    };

    const formValue = this.filterForm.value;
    if (formValue.startDate) {
      params.startDate = this.formatDate(formValue.startDate);
    }
    if (formValue.endDate) {
      params.endDate = this.formatDate(formValue.endDate);
    }
    if (formValue.searchTerm) {
      params.search = String(formValue.searchTerm).trim();
    }

    this.apiService.getSurveyResponsesPaged(this.surveyId, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const raw = response?.data || response?.items || response || [];
          this.responses = (raw as any[]).map(item => ({
            id: item.id,
            surveyId: item.surveyId ?? this.surveyId,
            answers: item.answers,
            submittedAt: new Date(item.submittedAt ?? item.createdAt ?? Date.now()),
            respondentName: item.respondentName || item.name || `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || item.email || 'Anonim',
            email: item.email
          } as any));
          this.totalResponses = response.totalCount || response.total || this.responses.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading responses:', error);
          this.isLoading = false;
        }
      });
  }

  private setupFilterListeners(): void {
    // Tarih filtreleri değiştiğinde otomatik yenile
    this.filterForm.get('startDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.filterForm.get('endDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    // Arama terimi için debounce
    this.filterForm.get('searchTerm')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  private applyFilters(): void {
    this.currentPage = 0; // Filtre uygulandığında ilk sayfaya dön
    this.loadResponses();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadResponses();
  }

  // Not: Paginator localization framework-wide sağlanmalı; gerekirse module provider ile ayarlanır

  onClearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadResponses();
  }

  onExportResponses(): void {
    const rows = this.responses.map(r => ({
      id: r.id,
      surveyId: r.surveyId,
      respondentName: r.respondentName || '',
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
      // düz bir özet kolon
      answerCount: r.answers ? Object.keys(r.answers).length : 0
    }));

    const header = ['id', 'surveyId', 'respondentName', 'submittedAt', 'answerCount'];
    const csv = [header.join(','), ...rows.map(row => header.map(h => {
      const val = (row as any)[h] ?? '';
      const s = String(val).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-${this.surveyId}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onViewResponse(response: SurveyResponse): void {
    // Yanıt detayını görüntüle
    console.log('Viewing response:', response);
  }

  onDeleteResponse(response: SurveyResponse): void {
    if (confirm('Bu yanıtı silmek istediğinizden emin misiniz?')) {
      this.apiService.deleteSurveyResponse(response.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadResponses();
          },
          error: (error) => {
            console.error('Error deleting response:', error);
          }
        });
    }
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  getAnswerSummary(answers: any): string {
    if (!answers) return 'Yanıt yok';
    
    const answerCount = Object.keys(answers).length;
    return `${answerCount} soru yanıtlandı`;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/surveys']);
  }
}
