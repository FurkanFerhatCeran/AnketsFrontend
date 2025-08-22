// src/app/pages/surveys/survey-create/survey-create.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { QuestionType } from '../../../models/question-type.model';
import { Question, Survey } from '../../../models/survey/survey.model';
import { QuestionService } from '../../../services/question.service';
import { SurveyService } from '../../../services/survey.service';

@Component({
    selector: 'app-survey-create',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './survey-create.component.html',
    styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {
    // surveyId opsiyonel olduğu için Omit kullanmaya gerek kalmadı
    survey: Partial<Survey> = {
        title: '',
        description: '',
        questions: [],
        isActive: true
    };
    
    questionTypes: QuestionType[] = [];
    isSaving = false;

    constructor(
        private surveyService: SurveyService,
        private questionService: QuestionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.questionService.getQuestionTypes().subscribe({
            next: (types) => {
                this.questionTypes = types;
            },
            error: (err) => {
                console.error('Soru tipleri yüklenemedi:', err);
            }
        });
    }

    saveSurvey(): void {
        if (!this.survey.title?.trim()) { // `?` ile null/undefined kontrolü
            alert('Anket başlığı zorunludur!');
            return;
        }

        this.isSaving = true;

        this.surveyService.createSurvey(this.survey as Omit<Survey, 'surveyId' | 'createdAt' | 'updatedAt'>).subscribe({
            next: (response: any) => {
                const surveyId = response.surveyId; // Doğru özellik adını kullanıyoruz
                console.log('Anket oluşturuldu. ID:', surveyId);
                
                if (this.survey.questions && this.survey.questions.length > 0) {
                    this.saveQuestions(surveyId);
                } else {
                    this.isSaving = false;
                    this.router.navigate(['/dashboard/surveys']);
                }
            },
            error: (error) => {
                console.error('Anket kaydedilirken hata oluştu:', error);
                alert('Anket kaydedilirken hata oluştu!');
                this.isSaving = false;
            }
        });
    }

    private saveQuestions(surveyId: number): void {
        const requests = (this.survey.questions || []).map(question => {
            const questionToSave: any = {
                questionTitle: question.questionTitle,
                questionDescription: question.questionDescription,
                surveyId: surveyId,
                questionTypeId: Number(question.questionTypeId),
                isRequired: question.isRequired,
                conditionalLogic: question.conditionalLogic,
                validationRules: question.validationRules,
                options: (question.options || []).map(o => ({
                    optionText: o.optionText,
                    optionValue: o.optionValue,
                    imageUrl: '',
                    sortOrder: o.sortOrder,
                    isOtherOption: o.isOtherOption || false,
                    conditionalLogic: o.conditionalLogic
                }))
            };
            
            return this.questionService.createQuestion(questionToSave).pipe(
                catchError(err => {
                    console.error(`Soru kaydedilirken bir hata oluştu:`, err);
                    return of(null);
                })
            );
        });

        if (requests.length === 0) {
            this.isSaving = false;
            this.router.navigate(['/dashboard/surveys']);
            return;
        }

        forkJoin(requests).subscribe({
            next: (responses) => {
                const failedRequests = responses.filter(r => r === null).length;
                if (failedRequests > 0) {
                    alert(`Anket oluşturuldu, ancak ${failedRequests} adet soru kaydedilemedi.`);
                } else {
                    alert('Anket ve tüm sorular başarıyla kaydedildi!');
                }
                this.isSaving = false;
                this.router.navigate(['/dashboard/surveys']);
            },
            error: (error) => {
                console.error('Soruları kaydederken genel bir hata oluştu:', error);
                alert('Soruları kaydederken genel bir hata oluştu!');
                this.isSaving = false;
            }
        });
    }

    // Diğer metotlar
    requiresOptions(typeId: number | string): boolean {
        const t = this.questionTypes.find(t => t.id === Number(typeId));
        return !!t?.requiredOptions;
    }

    onTypeChange(question: Question): void {
        if (this.requiresOptions(question.questionTypeId) && (!question.options || question.options.length === 0)) {
            question.options = [
                { optionText: '', optionValue: '', sortOrder: 0, imageUrl: '' },
                { optionText: '', optionValue: '', sortOrder: 1, imageUrl: '' }
            ];
        }
        if (!this.requiresOptions(question.questionTypeId)) {
            question.options = [];
        }
    }

    addOption(question: Question): void {
        if (!question.options) question.options = [];
        question.options.push({
            optionText: '',
            optionValue: '',
            sortOrder: question.options.length,
            imageUrl: ''
        });
    }

    removeOption(question: Question, idx: number): void {
        if (!question.options) return;
        question.options.splice(idx, 1);
        question.options.forEach((o, i) => (o.sortOrder = i));
    }

    onOptionTextChange(question: Question, idx: number, value: string): void {
        if (!question.options) return;
        question.options[idx].optionText = value;
        question.options[idx].optionValue = value;
        question.options[idx].sortOrder = idx;
    }

    cancel(): void {
        this.router.navigate(['/dashboard/surveys']);
    }

    addQuestion(): void {
        const newQuestion: Question = {
            questionId: 0,
            questionTitle: '',
            questionDescription: '',
            surveyId: 0,
            questionTypeId: 1,
            isRequired: false,
            conditionalLogic: '',
            validationRules: '',
            createdAt: new Date(),
            options: []
        };
        this.survey.questions!.push(newQuestion); // `!` ile null olmayan değer olduğunu belirtiyoruz
    }

    removeQuestion(index: number): void {
        this.survey.questions!.splice(index, 1); // `!` ile null olmayan değer olduğunu belirtiyoruz
    }

    trackByIndex(_i: number, _item: any): number {
        return _i;
    }
}