// src/app/pages/surveys/survey-list/survey-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Survey, SurveyResponse } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';
import { Router } from '@angular/router';

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

  constructor(private surveyService: SurveyService, private router: Router) {}

  ngOnInit(): void {
    this.surveyService.getSurveys().subscribe(surveys => {
      this.surveys = surveys;
    });

    this.surveyService.getResponses().subscribe(responses => {
      this.responses = responses;
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
    const duplicated = {
      ...survey,
      title: `${survey.title} - Kopya`,
      questions: survey.questions.map(q => ({ ...q, id: this.generateId() }))
    };

    delete (duplicated as any).id;
    delete (duplicated as any).createdAt;

    const newSurvey = this.surveyService.createSurvey(duplicated);
    this.showSuccess('Anket başarıyla kopyalandı!');
  }

  deleteSurvey(survey: Survey): void {
    if (confirm(`"${survey.title}" anketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      this.surveyService.deleteSurvey(survey.id);
      this.showSuccess('Anket başarıyla silindi!');
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
}