// src/app/pages/surveys/survey-list/survey-list.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Survey, SurveyResponse } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss'] // Uzantı .scss olarak değiştirildi
})
export class SurveyListComponent implements OnInit {
  //... diğer kodlar aynı kalacak
  surveys: Survey[] = [];
  responses: SurveyResponse[] = [];
  showSuccessMessage = false;
  successMessage = '';
  activeDropdown: string | null = null; // Dropdown state
  showDeleteModal = false;
  surveyToDelete: Survey | null = null;

  constructor(private surveyService: SurveyService, private router: Router) {}

  ngOnInit(): void {
    console.log('🚀 Survey List Component initialized');
    this.loadSurveys();
  }

  private loadSurveys(): void {
    console.log('📊 Loading surveys...');
    
    this.surveyService.getSurveys().subscribe({
      next: (surveys) => {
        console.log('✅ Surveys loaded:', surveys);
        this.surveys = surveys || [];
        
        // Her survey için response'ları yükle
        this.surveys.forEach(survey => {
          this.loadResponsesForSurvey(survey.id);
        });
      },
      error: (error) => {
        console.error('❌ Error loading surveys:', error);
        this.surveys = [];
        alert('Anketler yüklenirken hata oluştu!');
      }
    });
  }

  private loadResponsesForSurvey(surveyId: string): void {
    this.surveyService.getSurveyResponses(surveyId).subscribe({
      next: (responses) => {
        // Responses'ları birleştir
        this.responses = [...this.responses, ...responses];
      },
      error: (error) => {
        console.warn('⚠️ Could not load responses for survey:', surveyId, error);
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/surveys/create']);
  }

  navigateToEdit(surveyId: string): void {
    this.router.navigate(['/dashboard/surveys/edit', surveyId]);
  }

  navigateToView(surveyId: string): void {
   this.router.navigate(['/dashboard/surveys/take', surveyId]);
  }

  navigateToResults(surveyId: string): void {
    // Sonuçlar sayfasını router'a ekleyecekseniz
   this.router.navigate(['/dashboard/surveys/results', surveyId]);
    // veya doğrudan component'i gösterebilirsiniz.
  }

  duplicateSurvey(survey: Survey): void {
    if (!survey || !survey.questions || !Array.isArray(survey.questions)) {
      console.error('❌ Survey not valid for duplication');
      return;
    }

    console.log('📄 Duplicating survey:', survey.title);

    const duplicated: Omit<Survey, 'id' | 'createdAt'> = {
      title: `${survey.title} - Kopya`,
      description: survey.description,
      questions: survey.questions.map(q => ({ 
        ...q, 
        id: this.generateId() // String ID oluştur
      })),
      isActive: survey.isActive
    };

    this.surveyService.createSurvey(duplicated).subscribe({
      next: (response) => {
        console.log('✅ Survey duplicated:', response);
        this.showSuccess('Anket başarıyla kopyalandı!');
      },
      error: (error) => {
        console.error('❌ Error duplicating survey:', error);
        alert('Anket kopyalanırken hata oluştu!');
      }
    });
    
    this.activeDropdown = null; // Close dropdown
  }

  deleteSurvey(survey: Survey): void {
    if (!survey || !survey.id) {
      console.error('Survey not valid for deletion');
      return;
    }

    if (confirm(`"${survey.title}" anketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      this.surveyService.deleteSurvey(survey.id).subscribe({
        next: () => {
          this.showSuccess('Anket başarıyla silindi!');
          this.surveys = this.surveys.filter(s => s.id !== survey.id);
        },
        error: (error) => {
          console.error('Error deleting survey:', error);
          alert('Anket silinirken hata oluştu!');
        }
      });
    }
  }

  getResponseCount(surveyId: string): number {
    return this.responses.filter(r => r.surveyId === surveyId).length;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 4000);
  }

  // Track function for ngFor performance
  trackBySurvey(index: number, survey: Survey): string {
    return survey.id; // Zaten string, doğru
  }

  // Get active surveys count
  getActiveCount(): number {
    return this.surveys.filter(s => s.isActive).length;
  }

  // Get total responses count
  getTotalResponses(): number {
    return this.responses.length;
  }

  // Get completion rate for progress bar
  getCompletionRate(surveyId: string): number {
    const responseCount = this.getResponseCount(surveyId);
    const survey = this.surveys.find(s => s.id === surveyId); // String karşılaştırma
    const questionCount = survey?.questions?.length || 1;
    return Math.min(100, (responseCount / questionCount) * 10);
  }

  // Toggle survey status
  toggleSurveyStatus(survey: Survey): void {
    const newStatus = !survey.isActive;
    
    this.surveyService.updateSurvey(survey.id, { isActive: newStatus }).subscribe({
      next: () => {
        survey.isActive = newStatus;
        this.showSuccess(`Anket ${newStatus ? 'aktifleştirildi' : 'duraklatıldı'}!`);
      },
      error: (error) => {
        console.error('Error toggling survey status:', error);
        alert('Durum değiştirilemedi!');
      }
    });
    
    this.activeDropdown = null; // Close dropdown
  }

  // Menu toggle (for dropdown)
  toggleMenu(surveyId: string): void {
    // Implement dropdown menu logic if needed
    console.log('Toggle menu for:', surveyId);
  }

  // Dropdown toggle
  toggleDropdown(surveyId: string): void {
    this.activeDropdown = this.activeDropdown === surveyId ? null : surveyId;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-dropdown')) {
      this.activeDropdown = null;
    }
  }

  // Quick delete from header
  quickDelete(survey: Survey): void {
    this.confirmDelete(survey);
  }

  // Confirm delete modal
  confirmDelete(survey: Survey): void {
    this.surveyToDelete = survey;
    this.showDeleteModal = true;
    this.activeDropdown = null; // Close dropdown
  }

  // Cancel delete
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.surveyToDelete = null;
  }

  // Execute delete
  executeDelete(): void {
    if (this.surveyToDelete) {
      this.surveyService.deleteSurvey(this.surveyToDelete.id).subscribe({
        next: () => {
          this.showSuccess(`"${this.surveyToDelete!.title}" anketi silindi!`);
          this.surveys = this.surveys.filter(s => s.id !== this.surveyToDelete!.id);
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting survey:', error);
          alert('Anket silinirken hata oluştu!');
          this.cancelDelete();
        }
      });
    }
  }

  // Share survey
  shareSurvey(survey: Survey): void {
    const shareUrl = `${window.location.origin}/survey/${survey.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.showSuccess('Anket linki panoya kopyalandı!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showSuccess('Anket linki kopyalandı!');
    });
    this.activeDropdown = null;
  }

  // Export survey
  exportSurvey(survey: Survey): void {
    console.log('Exporting survey:', survey.title);
    // Implement export functionality
    this.showSuccess('Anket verisi dışa aktarılıyor...');
    this.activeDropdown = null;
  }
}