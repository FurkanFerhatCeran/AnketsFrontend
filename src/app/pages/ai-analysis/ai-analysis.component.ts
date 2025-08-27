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
import { ApiService } from '../../services/api.service';
import { SurveyService } from '../../services/survey.service';

interface ParsedAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  metadata: {
    surveyTitle: string;
    generatedAt: string;
    confidenceLevel: number;
  };
}

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
  parsedAnalysis: ParsedAnalysis | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private surveyService: SurveyService,
    private apiService: ApiService
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
    this.parsedAnalysis = null;
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

    this.apiService.generateAIAnalysis(this.selectedSurveyId).subscribe({
      next: (response: AIAnalysisResponse) => {
        this.aiAnalysisResult = response;
        this.parsedAnalysis = this.parseAnalysisResponse(response);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'AI analizi oluşturulurken bir hata oluştu.';
        this.isLoading = false;
        console.error('AI analizi sırasında hata:', err);
      }
    });
  }

  private parseAnalysisResponse(response: AIAnalysisResponse): ParsedAnalysis {
    try {
      // JSON string'i parse et
      const jsonData = JSON.parse(response.aiResponse);
      
      // Seçilen anketin başlığını bul
      const selectedSurvey = this.surveys.find(s => s.surveyId === this.selectedSurveyId);
      
      return {
        summary: jsonData.sections?.summary || 'Özet bilgisi bulunamadı.',
        insights: Array.isArray(jsonData.sections?.insights) 
          ? jsonData.sections.insights 
          : ['İçgörü bilgisi bulunamadı.'],
        recommendations: Array.isArray(jsonData.sections?.recommendations) 
          ? jsonData.sections.recommendations 
          : ['Öneri bilgisi bulunamadı.'],
        metadata: {
          surveyTitle: selectedSurvey?.title || jsonData.metadata?.survey_title || 'Bilinmeyen Anket',
          generatedAt: this.formatDate(response.createdAt),
          confidenceLevel: response.confidenceLevel || jsonData.analysis_info?.confidence_level || 0
        }
      };
    } catch (error) {
      console.error('JSON parse hatası:', error);
      
      // JSON parse edilemezse raw text olarak göster
      return {
        summary: response.aiResponse || 'Analiz sonucu bulunamadı.',
        insights: ['Analiz verisi JSON formatında değil veya parse edilemiyor.'],
        recommendations: ['Lütfen analizi tekrar çalıştırmayı deneyin.'],
        metadata: {
          surveyTitle: this.surveys.find(s => s.surveyId === this.selectedSurveyId)?.title || 'Bilinmeyen Anket',
          generatedAt: this.formatDate(response.createdAt),
          confidenceLevel: response.confidenceLevel || 0
        }
      };
    }
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
