import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { QuestionType } from '../../../models/question-type.model';
import { ApiService } from '../../../services/api.service';
import { QuestionService } from '../../../services/question.service';

@Component({
    selector: 'app-survey-edit',
    standalone: true,
    templateUrl: './survey-edit.component.html',
    styleUrls: ['./survey-edit.component.scss'],
    imports: [CommonModule, FormsModule]
})
export class SurveyEditComponent implements OnInit {
    survey: any = {
        id: 0,
        title: '',
        description: '',
        questions: []
    };
    
    questionTypes: QuestionType[] = [];
    isLoading = true;
    isSaving = false;

    constructor(
        private apiService: ApiService,
        private questionService: QuestionService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadQuestionTypes();
        this.loadSurveyAndQuestions();
    }

    loadQuestionTypes(): void {
        this.questionService.getQuestionTypes().subscribe({
            next: (types) => {
                this.questionTypes = types;
            },
            error: (error) => {
                console.error('Soru tipleri yüklenirken hata:', error);
            }
        });
    }

    loadSurveyAndQuestions(): void {
        const surveyId = this.route.snapshot.params['id'];
        
        if (!surveyId) {
            console.error('Anket ID bulunamadı.');
            this.router.navigate(['/dashboard/surveys']);
            return;
        }

        const surveyRequest = this.apiService.getSurveyById(surveyId);
        const questionsRequest = this.questionService.getQuestionsBySurvey(surveyId);

        forkJoin([surveyRequest, questionsRequest]).subscribe({
            next: ([survey, questions]) => {
                // API'den gelen verinin 'surveyId' alanını alıp 'id' alanına atama
                if (survey && survey.surveyId) {
                    this.survey = { 
                        id: survey.surveyId, 
                        title: survey.title,
                        description: survey.description,
                        questions: questions || [] 
                    };
                } else {
                    console.error('API’den dönen ankette ID (surveyId) bulunamadı.');
                    this.router.navigate(['/dashboard/surveys']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Anket veya sorular yüklenirken hata:', error);
                this.isLoading = false;
                this.router.navigate(['/dashboard/surveys']);
            }
        });
    }

    requiresOptions(questionTypeId: number | string): boolean {
        const questionType = this.questionTypes.find(t => t.id === Number(questionTypeId));
        return !!questionType?.requiredOptions;
    }

    onTypeChange(question: any): void {
        if (this.requiresOptions(question.questionTypeId) && (!question.options || question.options.length === 0)) {
            question.options = [
                { optionText: '', optionValue: '', sortOrder: 0, imageUrl: '', isOtherOption: false, conditionalLogic: '' },
                { optionText: '', optionValue: '', sortOrder: 1, imageUrl: '', isOtherOption: false, conditionalLogic: '' }
            ];
        }
        if (!this.requiresOptions(question.questionTypeId)) {
            question.options = [];
        }
    }

    addOption(question: any): void {
        if (!question.options) question.options = [];
        question.options.push({
            optionText: '',
            optionValue: '',
            sortOrder: question.options.length,
            imageUrl: '',
            isOtherOption: false,
            conditionalLogic: ''
        });
    }

    removeOption(question: any, idx: number): void {
        if (!question.options) return;
        question.options.splice(idx, 1);
        question.options.forEach((o: any, i: number) => (o.sortOrder = i));
    }

    onOptionTextChange(question: any, idx: number, value: string): void {
        if (!question.options) return;
        question.options[idx].optionText = value;
        question.options[idx].optionValue = value;
        question.options[idx].sortOrder = idx;
    }

    addQuestion(): void {
        const newQuestion = {
            questionId: 0,
            questionTitle: '',
            questionDescription: '',
            questionTypeId: 1,
            isRequired: false,
            conditionalLogic: '',
            validationRules: '',
            options: []
        };
        this.survey.questions.push(newQuestion);
    }

    removeQuestion(index: number): void {
        const question = this.survey.questions[index];
        if (question?.questionId && question.questionId > 0) {
            this.questionService.deleteQuestion(question.questionId).subscribe({
                next: () => {
                    this.survey.questions.splice(index, 1);
                    console.log('Soru başarıyla silindi.');
                },
                error: (err) => {
                    console.error('Soru silinirken hata:', err);
                }
            });
        } else {
            this.survey.questions.splice(index, 1);
            console.log('Henüz kaydedilmemiş soru silindi.');
        }
    }

    saveSurvey(): void {
        if (!this.survey.id) {
            console.error('Anket ID bulunamadı. Güncelleme işlemi durduruldu.');
            alert('Anket ID bulunamadığı için güncelleme yapılamıyor.');
            this.isSaving = false;
            return;
        }

        this.isSaving = true;
        
        this.apiService.updateSurvey(this.survey.id, {
            title: this.survey.title,
            description: this.survey.description
        }).subscribe({
            next: () => {
                this.updateQuestions();
            },
            error: (error) => {
                console.error('Anket güncellenirken hata:', error);
                this.isSaving = false;
                alert('Anket güncellenirken hata oluştu! Detaylar için konsola bakın.');
            }
        });
    }

    updateQuestions(): void {
        const requests = this.survey.questions.map((question: any) => {
            const payload: any = {
                questionTitle: question.questionTitle,
                questionDescription: question.questionDescription || '',
                surveyId: this.survey.id,
                questionTypeId: Number(question.questionTypeId),
                isRequired: question.isRequired,
                conditionalLogic: question.conditionalLogic || '',
                validationRules: question.validationRules || null,
                options: (question.options || []).map((o: any, i: number) => ({
                    optionText: o.optionText,
                    optionValue: o.optionValue ?? o.optionText,
                    sortOrder: i,
                    imageUrl: o.imageUrl ?? '',
                    isOtherOption: o.isOtherOption ?? false,
                    conditionalLogic: o.conditionalLogic ?? ''
                }))
            };
            
            if (question.questionId && question.questionId > 0) {
                return this.questionService.updateQuestion(question.questionId, payload).pipe(
                    catchError(err => {
                        console.error(`Soru güncellenirken hata oluştu:`, err);
                        return of(null);
                    })
                );
            } else {
                return this.questionService.createQuestion(payload).pipe(
                    catchError(err => {
                        console.error(`Soru oluşturulurken hata oluştu:`, err);
                        return of(null);
                    })
                );
            }
        });

        if (requests.length === 0) {
            this.isSaving = false;
            this.router.navigate(['/dashboard/surveys']);
            return;
        }

        forkJoin(requests).subscribe({
            next: (responses: any) => {
                const failedCount = responses.filter((r: any) => r === null).length;
                if (failedCount > 0) {
                    alert(`${failedCount} adet soru kaydedilirken/güncellenirken hata oluştu.`);
                } else {
                    alert('Anket ve tüm sorular başarıyla güncellendi!');
                }
                this.isSaving = false;
                this.router.navigate(['/dashboard/surveys']);
            },
            error: (error) => {
                console.error('Sorular güncellenirken/oluşturulurken genel hata:', error);
                this.isSaving = false;
                alert('Sorular güncellenirken/oluşturulurken genel hata oluştu!');
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/dashboard/surveys']);
    }

    trackByIndex(_i: number, _item: any): number {
        return _i;
    }
}