// src/app/pages/home/home.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userName: string = 'Kullanıcı';
  surveyCount: number = 0;
  activeSurveyCount: number = 0;
  totalResponses: number = 0;
  responseRate: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private surveyService: SurveyService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSurveyStats();
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
  selectTemplate(templateType: string): void {
    this.router.navigate(['/dashboard/surveys/create'], { 
      state: { template: templateType } 
    });
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
}