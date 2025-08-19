// src/app/pages/surveys/survey-edit/survey-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { Survey, Question } from '../../../models/survey/survey.model';

@Component({
  selector: 'app-survey-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.scss'] // Uzantı .scss olarak değiştirildi
})
export class SurveyEditComponent implements OnInit {
  //... diğer kodlar aynı kalacak
  survey!: Survey;
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.surveyService.getSurveyById(id).subscribe({
        next: (survey) => {
          if (survey) {
            this.survey = { ...survey };
            this.isEditing = true;
          } else {
            this.router.navigate(['/dashboard/surveys']);
          }
        },
        error: (error) => {
          console.error('Error loading survey:', error);
          this.router.navigate(['/dashboard/surveys']);
        }
      });
    } else {
      this.router.navigate(['/dashboard/surveys']);
    }
  }

  saveSurvey(): void {
    if (this.isEditing) {
      this.surveyService.updateSurvey(this.survey.id, this.survey).subscribe({
        next: (response) => {
          console.log('Survey updated:', response);
          this.router.navigate(['/dashboard/surveys']);
        },
        error: (error) => {
          console.error('Error updating survey:', error);
          alert('Anket güncellenirken hata oluştu!');
        }
      });
    }
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