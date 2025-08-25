// src/app/pages/surveys/survey-take/survey-take.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType } from '../../../models/question-type.model';
import { ApiService } from '../../../services/api.service';
import { forkJoin, combineLatest } from 'rxjs';

@Component({
  selector: 'app-survey-take',
  standalone: true,
  templateUrl: './survey-take.component.html',
  styleUrls: ['./survey-take.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class SurveyTakeComponent implements OnInit {
  survey: any = { questions: [] };
  questionTypes: QuestionType[] = [];
  answers: { [key: number]: any } = {};
  respondentName: string = '';
  submitting = false;
  errors: number[] = [];
  isLoading = true;
  isPreviewMode = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      const id = Number(params.get('id'));
      this.isPreviewMode = query.get('preview') === 'true';
      this.loadSurvey(id);
    });

    this.loadQuestionTypes();
  }

  loadQuestionTypes(): void {
    this.apiService.getQuestionTypes().subscribe({
      next: (types) => {
        this.questionTypes = types;
      },
      error: (error) => {
        console.error('Soru tipleri yüklenirken hata:', error);
      }
    });
  }

  loadSurvey(surveyId: number): void {
    this.isLoading = true;

    forkJoin({
      survey: this.apiService.getSurveyById(surveyId),
      questions: this.apiService.getQuestionsBySurvey(surveyId)
    }).subscribe({
      next: ({ survey, questions }) => {
        this.survey = survey || { questions: [] };
        this.survey.questions = Array.isArray(questions) ? questions : [];

        // Başlangıç değerleri
        this.survey.questions.forEach((q: any) => {
          if ([3, 4, 5].includes(q.questionTypeId) && !q.options) q.options = [];
          if (q.questionTypeId === 4 && !this.answers[q.questionId]) this.answers[q.questionId] = [];
          if (q.questionTypeId === 9 && this.answers[q.questionId] === undefined) this.answers[q.questionId] = null;
          if (q.questionTypeId === 10 && this.answers[q.questionId] === undefined) this.answers[q.questionId] = 5;
        });

        this.isLoading = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Önizleme yüklenirken hata:', err);
        this.survey = { questions: [] };
        this.isLoading = false;
      }
    });
  }

  hasRequiredQuestions(): boolean {
    return this.survey.questions && this.survey.questions.some((q: any) => q.isRequired);
  }

  hasError(questionId: number): boolean {
    return this.errors.includes(questionId);
  }

  isChecked(questionId: number, optionValue: string): boolean {
    return this.answers[questionId] && this.answers[questionId].includes(optionValue);
  }

  onCheckboxChange(questionId: number, optionValue: string, event: any): void {
    if (!this.answers[questionId]) {
      this.answers[questionId] = [];
    }
    
    if (event.target.checked) {
      if (!this.answers[questionId].includes(optionValue)) {
        this.answers[questionId].push(optionValue);
      }
    } else {
      this.answers[questionId] = this.answers[questionId].filter((v: string) => v !== optionValue);
    }
  }

  onScaleChange(questionId: number, event: any): void {
    this.answers[questionId] = event.target.value;
  }

  onFileChange(questionId: number, event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan büyük olamaz!');
        event.target.value = '';
        return;
      }
      
      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 
                           'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Sadece JPG, PNG, PDF, DOC ve DOCX dosyaları yükleyebilirsiniz!');
        event.target.value = '';
        return;
      }
      
      this.answers[questionId] = file;
    }
  }

  getFileName(questionId: number): string {
    const file = this.answers[questionId];
    return file instanceof File ? file.name : '';
  }

  validateForm(): boolean {
    this.errors = [];
    
    if (this.survey.questions) {
      this.survey.questions.forEach((question: any) => {
        if (question.isRequired) {
          let hasError = false;
          
          switch (question.questionTypeId) {
            case 4: // Çoklu seçim
              if (!this.answers[question.questionId] || this.answers[question.questionId].length === 0) {
                hasError = true;
              }
              break;
              
            case 13: // Dosya yükleme
              if (!this.answers[question.questionId] || !(this.answers[question.questionId] instanceof File)) {
                hasError = true;
              }
              break;
              
            case 9: // Rating
            case 5: // Dropdown
              if (this.answers[question.questionId] === null || this.answers[question.questionId] === undefined || this.answers[question.questionId] === '') {
                hasError = true;
              }
              break;
              
            default:
              // Diğer tüm soru tipleri için kontrol
              if (!this.answers[question.questionId] && this.answers[question.questionId] !== 0) {
                hasError = true;
              }
          }
          
          if (hasError) {
            this.errors.push(question.questionId);
          }
        }
      });
    }

    return this.errors.length === 0;
  }

  scrollToFirstError(): void {
    if (this.errors.length > 0) {
      const firstErrorElement = document.querySelector('.has-error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // Önizleme modunda form gönderimini engelle
  onSubmit(): void {
    if (this.isPreviewMode) {
      return; // Önizleme modunda form gönderimi yapılmaz
    }

    if (!this.validateForm()) {
      alert('Lütfen zorunlu alanları doldurun.');
      this.scrollToFirstError();
      return;
    }

    this.submitting = true;
    
    // Dosya yükleme sorularını işle
    const formData = new FormData();
    const answersData: any[] = [];
    
    Object.keys(this.answers).forEach(questionId => {
      const answer = this.answers[parseInt(questionId)];
      
      if (answer instanceof File) {
        // Dosya ise formData'ya ekle
        formData.append(`file_${questionId}`, answer);
        answersData.push({
          questionId: parseInt(questionId),
          answer: answer.name,
          isFile: true,
          fileType: answer.type,
          fileSize: answer.size
        });
      } else {
        // Normal cevap
        answersData.push({
          questionId: parseInt(questionId),
          answer: answer,
          isFile: false
        });
      }
    });
    
    const responseData = {
      surveyId: this.survey.surveyId || this.survey.id,
      respondentName: this.respondentName.trim() || 'Anonim',
      answers: answersData,
      submittedAt: new Date().toISOString()
    };
    
    formData.append('responseData', JSON.stringify(responseData));

    this.apiService.submitSurveyResponse(formData).subscribe({
      next: (response: any) => {
        this.submitting = false;
        this.router.navigate(['/survey-thank-you'], {
          queryParams: { surveyId: this.survey.surveyId || this.survey.id }
        });
      },
      error: (error) => {
        console.error('Yanıt gönderilirken hata:', error);
        this.submitting = false;
        alert('Anket gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    });
  }

  // Önizleme modunda geri dönüş
  onBack(): void {
    if (this.isPreviewMode) {
      this.router.navigate(['/dashboard/surveys']);
    } else {
      if (confirm('Anketteki ilerlemeniz kaybolacak. Emin misiniz?')) {
        this.router.navigate(['/surveys']);
      }
    }
  }

  // Önizleme modunda düzenleme sayfasına git
  navigateToEdit(): void {
    if (this.survey) {
      this.router.navigate(['/dashboard/surveys/edit', this.survey.surveyId || this.survey.id]);
    }
  }

  // Önizleme modunda anketi doldur sayfasına git
  navigateToTake(): void {
    if (this.survey) {
      this.router.navigate(['/dashboard/surveys/take', this.survey.surveyId || this.survey.id]);
    }
  }
}