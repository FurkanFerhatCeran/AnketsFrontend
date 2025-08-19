// src/app/pages/surveys/survey-create/survey-create.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { Question, Survey } from '../../../models/survey/survey.model';

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss'] // Uzantı .scss olarak değiştirildi
})
export class SurveyCreateComponent {
  //... diğer kodlar aynı kalacak
  survey: Survey = {
    id: '',
    title: '',
    description: '',
    questions: [],
    createdAt: new Date(),
    isActive: true
  };

  constructor(private surveyService: SurveyService, private router: Router) {}

  saveSurvey(): void {
    this.surveyService.createSurvey(this.survey);
    this.router.navigate(['/dashboard/surveys']);
  }

  cancel(): void {
   this.router.navigate(['/dashboard/surveys']);
  }

  addQuestion(): void {
    const newQuestion: Question = {
      id: this.generateId(),
      type: 'text',
      title: '',
      required: false,
    };
    this.survey.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    this.survey.questions.splice(index, 1);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  onOptionsChange(question: Question, event: Event): void {
    const target = event.target as HTMLInputElement;
    question.options = target.value.split(',').map(s => s.trim());
  }

  getOptionsString(question: Question): string {
    return question.options?.join(', ') || '';
  }
}