// src/app/pages/home/home.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service';
import { SurveyTemplate, SurveyTemplateService } from '../../services/survey-template.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userName: string = 'Kullanıcı';
  surveyCount: number = 0;
  activeSurveyCount: number = 0;
  totalResponses: number = 0;
  responseRate: number = 0;
  popularTemplates: SurveyTemplate[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private surveyService: SurveyService,
    private templateService: SurveyTemplateService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSurveyStats();
    this.loadPopularTemplates();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      if (currentUser.nameSurname) {
        this.userName = currentUser.nameSurname;
      } else if (currentUser.username) {
        this.userName = currentUser.username;
      } else if (currentUser.email) {
        this.userName = this.extractNameFromEmail(currentUser.email);
      }
    }
  }

private loadSurveyStats(): void {
    // Anket istatistiklerini yükle
    this.surveyService.getSurveyCount().subscribe((count: number) => {
        this.surveyCount = count;
    });

    this.surveyService.getActiveSurveyCount().subscribe((count: number) => {
        this.activeSurveyCount = count;
    });

    this.surveyService.getTotalResponses().subscribe((responses: number) => {
        this.totalResponses = responses;
    });

    this.surveyService.getResponseRate().subscribe((rate: number) => {
        this.responseRate = rate;
    });
}

  private loadPopularTemplates(): void {
    this.templateService.getAllTemplates().subscribe({
      next: (templates) => {
        this.popularTemplates = templates;
      },
      error: (err) => {
        console.error('Template\'lar yüklenirken hata:', err);
      }
    });
  }

  selectTemplate(template: SurveyTemplate): void {
    // Template ID'sini query param olarak gönder
    this.router.navigate(['/dashboard/surveys/create'], { 
      queryParams: { 
        template: template.id,
        direct: 'true'
      }
    });
  }

  createBlankSurvey(): void {
    this.router.navigate(['/dashboard/surveys/create']);
  }

  viewMySurveys(): void {
    this.router.navigate(['/dashboard/surveys']);
  }

  private extractNameFromEmail(email: string): string {
    try {
      const localPart = email.split('@')[0];
      let name = localPart
        .replace(/[._-]/g, ' ')
        .replace(/\d+/g, '')
        .trim();
      
      name = name.split(' ')
        .map(word => this.capitalizeString(word))
        .filter(word => word.length > 0)
        .join(' ');
      
      return name || 'Kullanıcı';
    } catch (error) {
      return 'Kullanıcı';
    }
  }

  private capitalizeString(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  getEstimatedTime(questionCount: number): number {
    // Her soru için ortalama 30 saniye hesaplama
    const secondsPerQuestion = 30;
    const totalSeconds = questionCount * secondsPerQuestion;
    const minutes = Math.ceil(totalSeconds / 60);
    return Math.max(1, minutes); // Minimum 1 dakika
  }
}