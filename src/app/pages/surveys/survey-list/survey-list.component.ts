// src/app/pages/surveys/survey-list/survey-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Survey } from '../../../models/survey/survey.model';
import { QuestionService } from '../../../services/question.service';
import { SurveyService } from '../../../services/survey.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
  surveys: Survey[] = [];
  isLoading = true;
  showSuccessMessage = false;
  successMessage = '';
  activeDropdown: number | null = null;

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    private questionService: QuestionService 
  ) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.surveyService.getSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.loadQuestionCounts();
      },
      error: (error) => {
        console.error('Anketler yüklenirken hata oluştu:', error);
        this.isLoading = false;
      }
    });
  }

  loadQuestionCounts(): void {
    const requests = this.surveys.map(survey =>
      this.questionService.getQuestionsBySurvey(survey.surveyId!).pipe(
        map(questions => ({ surveyId: survey.surveyId, count: questions.length })),
        catchError(error => {
          console.error(`Anket ${survey.surveyId} için soru sayısı yüklenirken hata:`, error);
          return of({ surveyId: survey.surveyId, count: 0 }); 
        })
      )
    );

    if (requests.length > 0) {
      forkJoin(requests).subscribe(counts => {
        this.surveys = this.surveys.map(survey => {
          const questionCount = counts.find(c => c.surveyId === survey.surveyId)?.count || 0;
          return { ...survey, questionCount };
        });
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }

  getQuestionCount(survey: Survey): number {
    return survey.questionCount || 0;
  }

  getActiveCount(): number {
    return this.surveys.filter(s => s.isActive).length;
  }

  getTotalResponses(): number {
    return this.surveys.reduce((total, survey) => total + (survey.responseCount || 0), 0);
  }

  getResponseCount(surveyId: number): number {
    const survey = this.surveys.find(s => s.surveyId === surveyId);
    return survey ? survey.responseCount || 0 : 0;
  }

  getCompletionRate(surveyId: number): number {
    // Basit bir tamamlanma oranı hesaplama (gerçek uygulamada daha karmaşık olabilir)
    const responseCount = this.getResponseCount(surveyId);
    return Math.min(100, Math.floor((responseCount / 50) * 100)); // 50 yanıt %100 olarak kabul ediliyor
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/surveys/create']);
  }

  navigateToEdit(surveyId: number): void {
    this.router.navigate(['/dashboard/surveys/edit', surveyId]);
  }

  navigateToView(surveyId: number): void {
    this.router.navigate(['/survey', surveyId], { 
      queryParams: { preview: 'true' } 
    });
  }

  navigateToResults(surveyId: number): void {
    this.router.navigate(['/dashboard/surveys/results', surveyId]);
  }

  toggleDropdown(surveyId: number): void {
    this.activeDropdown = this.activeDropdown === surveyId ? null : surveyId;
  }

  toggleSurveyStatus(survey: Survey): void {
    const updatedSurvey = { ...survey, isActive: !survey.isActive };
    this.surveyService.updateSurvey(survey.surveyId!, updatedSurvey).subscribe({ 
      next: () => {
        survey.isActive = !survey.isActive;
        this.showSuccess(`Anket ${survey.isActive ? 'aktif' : 'pasif'} hale getirildi.`);
        this.activeDropdown = null;
      },
      error: (error) => {
        console.error('Anket durumu güncellenirken hata:', error);
        alert('Anket durumu güncellenirken bir hata oluştu!');
      }
    });
  }

  duplicateSurvey(survey: Survey): void {
    const newSurvey = {
      title: `${survey.title} (Kopya)`,
      description: survey.description,
      isActive: false, // Kopya anket başlangıçta pasif olsun
      questions: [] // Sorular ayrıca kopyalanacak
    };
    
    this.surveyService.createSurvey(newSurvey).subscribe({
      next: (createdSurvey) => {
        // Soruları kopyala
        this.copyQuestions(survey.surveyId!, createdSurvey.surveyId!);
      },
      error: (error) => {
        console.error('Anket kopyalanırken hata:', error);
        alert('Anket kopyalanırken bir hata oluştu!');
      }
    });
  }

  private copyQuestions(sourceSurveyId: number, targetSurveyId: number): void {
    this.questionService.getQuestionsBySurvey(sourceSurveyId).subscribe({
      next: (questions) => {
        const questionRequests = questions.map(question => {
          const questionCopy = {
            ...question,
            surveyId: targetSurveyId,
            questionId: 0 // Yeni soru oluşturulacak
          };
          return this.questionService.createQuestion(questionCopy);
        });

        forkJoin(questionRequests).subscribe({
          next: () => {
            this.loadSurveys();
            this.showSuccess('Anket başarıyla kopyalandı.');
            this.activeDropdown = null;
          },
          error: (error) => {
            console.error('Sorular kopyalanırken hata:', error);
            this.showSuccess('Anket kopyalandı ancak sorular kopyalanırken hata oluştu!');
          }
        });
      },
      error: (error) => {
        console.error('Kaynak sorular yüklenirken hata:', error);
        this.showSuccess('Anket kopyalandı ancak sorular kopyalanamadı!');
      }
    });
  }

  shareSurvey(survey: Survey): void {
    const shareUrl = `${window.location.origin}/survey/${survey.surveyId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.showSuccess('Paylaşım linki panoya kopyalandı.');
      this.activeDropdown = null;
    }).catch(() => {
      // Clipboard API desteklenmiyorsa
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showSuccess('Paylaşım linki panoya kopyalandı.');
      this.activeDropdown = null;
    });
  }

  exportSurvey(survey: Survey): void {
    // Basit CSV dışa aktarma
    const csvContent = this.convertToCSV(survey);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.activeDropdown = null;
    this.showSuccess('Anket başarıyla dışa aktarıldı.');
  }

  private convertToCSV(survey: Survey): string {
    const headers = ['Anket Bilgileri', 'Değer'];
    const rows = [
      ['Başlık', survey.title],
      ['Açıklama', survey.description || ''],
      ['Durum', survey.isActive ? 'Aktif' : 'Pasif'],
      ['Soru Sayısı', (survey.questionCount || 0).toString()],
      ['Oluşturulma Tarihi', this.formatDate(survey.createdAt)]
    ];
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  showHelp(): void {
    alert('Yardım sayfası yakında eklenecek!');
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  trackBySurvey(index: number, survey: Survey): number {
    return survey.surveyId!;
  }
}