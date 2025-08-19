// src/app/pages/surveys/survey-take/survey-take.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Survey, SurveyResponse } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';

@Component({
  selector: 'app-survey-take',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-take.component.html',
  styleUrls: ['./survey-take.component.scss'] // Uzantı .scss olarak değiştirildi
})
export class SurveyTakeComponent implements OnInit {
  //... diğer kodlar aynı kalacak
  survey!: Survey;
  answers: { [questionId: string]: any } = {};
  respondentName = '';
  submitting = false;
  errors: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const survey = this.surveyService.getSurveyById(id);
      if (survey) {
        this.survey = survey;
      } else {
       this.router.navigate(['/dashboard/surveys']);
      }
    } else {
     this.router.navigate(['/dashboard/surveys']);
    }
  }

  hasRequiredQuestions(): boolean {
    return this.survey.questions.some(q => q.required);
  }

  isChecked(questionId: string, option: string): boolean {
    const answer = this.answers[questionId];
    return Array.isArray(answer) && answer.includes(option);
  }

  onCheckboxChange(questionId: string, option: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentAnswers = this.answers[questionId] || [];
    
    if (target.checked) {
      this.answers[questionId] = [...currentAnswers, option];
    } else {
      this.answers[questionId] = currentAnswers.filter((item: string) => item !== option);
    }
  }

  selectRating(questionId: string, rating: number): void {
    this.answers[questionId] = rating;
  }

  getRatingRange(question: any): number[] {
    const min = question.min || 1;
    const max = question.max || 5;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  hasError(questionId: string): boolean {
    return this.errors.has(questionId);
  }

  validateForm(): boolean {
    this.errors.clear();
    
    for (const question of this.survey.questions) {
      if (question.required) {
        const answer = this.answers[question.id];
        
        if (answer === undefined || answer === null || answer === '') {
          this.errors.add(question.id);
        } else if (question.type === 'checkbox' && (!Array.isArray(answer) || answer.length === 0)) {
          this.errors.add(question.id);
        }
      }
    }

    return this.errors.size === 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) {
      const firstErrorElement = document.querySelector('.question-card.has-error');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    this.submitting = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response: Omit<SurveyResponse, 'id' | 'submittedAt'> = {
        surveyId: this.survey.id,
        answers: { ...this.answers },
        respondentName: this.respondentName.trim() || undefined
      };

      this.surveyService.submitResponse(response as SurveyResponse);
      alert('Yanıtınız başarıyla kaydedildi! Teşekkür ederiz.');
     this.router.navigate(['/dashboard/surveys']);
    } finally {
      this.submitting = false;
    }
  }

  onBack(): void {
    this.router.navigate(['/dashboard/surveys']);
  }
}