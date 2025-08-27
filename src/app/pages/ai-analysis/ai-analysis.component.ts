// src/app/pages/ai-analysis/ai-analysis.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AIAnalysisResponse } from '../../models/ai-analysis/ai-analysis.model';
import { Survey } from '../../models/survey/survey.model';
import { ApiService } from '../../services/api.service'; // AiAnalysisService yerine ApiService kullanıldı
import { SurveyService } from '../../services/survey.service';


@Component({
  selector: 'app-ai-analysis',
  templateUrl: './ai-analysis.component.html',
  styleUrls: ['./ai-analysis.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule
  ]
})
export class AiAnalysisComponent implements OnInit {

  surveys: Survey[] = [];
  selectedSurveyId: number | null = null;
  aiAnalysisResult: AIAnalysisResponse | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private surveyService: SurveyService,
    private apiService: ApiService // AiAnalysisService yerine ApiService kullanıldı
  ) { }

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.surveyService.getSurveys().subscribe({
      next: (data: Survey[]) => {
        this.surveys = data;
      },
      error: (err: any) => {
        this.errorMessage = 'Anket listesi yüklenemedi. Lütfen sunucu bağlantısını kontrol edin.';
        console.error('Anketler yüklenirken hata oluştu:', err);
      }
    });
  }

  onSelectSurvey(surveyId: number): void {
    this.selectedSurveyId = surveyId;
    this.aiAnalysisResult = null;
    if (surveyId !== null) {
      this.generateAnalysis();
    }
  }

  generateAnalysis(): void {
    if (this.selectedSurveyId === null) {
      this.errorMessage = 'Lütfen analiz yapmak için bir anket seçin.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // AiAnalysisService yerine ApiService kullanıldı
    this.apiService.generateAIAnalysis(this.selectedSurveyId).subscribe({
      next: (response: AIAnalysisResponse) => {
        this.aiAnalysisResult = response;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'AI analizi oluşturulurken bir hata oluştu.';
        this.isLoading = false;
        console.error('AI analizi sırasında hata:', err);
      }
    });
  }
}
