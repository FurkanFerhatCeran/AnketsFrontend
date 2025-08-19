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
    id: '', // String boş değer
    title: '',
    description: '',
    questions: [],
    createdAt: new Date(),
    isActive: true
  };

  constructor(private surveyService: SurveyService, private router: Router) {}

  saveSurvey(): void {
    if (!this.survey.title.trim()) {
      alert('Anket başlığı zorunludur!');
      return;
    }

    // Loading state ekleyin
    const createBtn = document.querySelector('.btn-primary') as HTMLButtonElement;
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.textContent = 'Kaydediliyor...';
    }

    this.surveyService.createSurvey({
      title: this.survey.title,
      description: this.survey.description,
      questions: this.survey.questions,
      isActive: this.survey.isActive
    }).subscribe({
      next: (response) => {
        console.log('Survey created:', response);
        this.router.navigate(['/dashboard/surveys']);
      },
      error: (error) => {
        console.error('Error creating survey:', error);
        alert('Anket kaydedilirken hata oluştu!');
        
        // Re-enable button
        if (createBtn) {
          createBtn.disabled = false;
          createBtn.textContent = 'Anketi Kaydet';
        }
      }
    });
  }

  cancel(): void {
   this.router.navigate(['/dashboard/surveys']);
  }

  addQuestion(): void {
    const newQuestion: Question = {
      id: this.generateId(), // String ID oluştur
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