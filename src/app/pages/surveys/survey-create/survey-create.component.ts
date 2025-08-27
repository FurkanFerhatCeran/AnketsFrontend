// src/app/pages/surveys/survey-create/survey-create.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { SurveyTemplateSelectorComponent } from '../../../components/survey/survey-template-selector/survey-template-selector.component';
import { QuestionType } from '../../../models/question-type.model';
import { Question, Survey } from '../../../models/survey/survey.model';
import { QuestionService } from '../../../services/question.service';
import { SurveyService } from '../../../services/survey.service';
import { SurveyTemplate, SurveyTemplateService } from '../../../services/survey-template.service';

@Component({
    selector: 'app-survey-create',
    standalone: true,
    imports: [CommonModule, FormsModule, SurveyTemplateSelectorComponent],
    templateUrl: './survey-create.component.html',
    styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {
    survey: Partial<Survey> = {
        title: '',
        description: '',
        questions: [],
        isActive: true
    };
    
    questionTypes: QuestionType[] = [];
    isSaving = false;
    showTemplateSelector = true;
    selectedTemplate: SurveyTemplate | null = null;

    constructor(
        private surveyService: SurveyService,
        private questionService: QuestionService,
        private templateService: SurveyTemplateService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.questionService.getQuestionTypes().subscribe({
            next: (types) => {
                this.questionTypes = types;
                
                // Query params'dan template kontrol et
                this.checkForPreSelectedTemplate();
            },
            error: (err) => {
                console.error('Soru tipleri yüklenemedi:', err);
                // Varsayılan soru ekle eğer template yükleme başarısız olursa
                this.addQuestion();
            }
        });
    }

    private checkForPreSelectedTemplate(): void {
        // Query params'ları kontrol et
        this.route.queryParams.subscribe(params => {
            const templateId = params['template'];
            const isDirect = params['direct'] === 'true';
            
            if (templateId && isDirect) {
                // Template'ı ID'ye göre yükle
                this.templateService.getTemplateById(templateId).subscribe({
                    next: (template) => {
                        if (template) {
                            this.selectedTemplate = template;
                            this.onTemplateSelected(template);
                            console.log('Template yüklendi:', template.name);
                        } else {
                            console.warn('Template bulunamadı:', templateId);
                            // Template bulunamadığında normal mod'a geç
                            this.showTemplateSelector = true;
                            this.addQuestion();
                        }
                    },
                    error: (err) => {
                        console.error('Template yüklenirken hata:', err);
                        alert('Template yüklenirken hata oluştu!');
                        // Hata durumunda normal mod'a geç
                        this.showTemplateSelector = true;
                        this.addQuestion();
                    }
                });
            } else {
                // Template params yoksa normal template selector göster veya boş soru ekle
                if (this.survey.questions && this.survey.questions.length === 0) {
                    this.addQuestion();
                }
            }
        });
    }

    saveSurvey(): void {
        if (!this.survey.title?.trim()) {
            alert('Anket başlığı zorunludur!');
            return;
        }

        // Soru doğrulamaları
        if (!this.survey.questions || this.survey.questions.length === 0) {
            alert('En az bir soru eklemelisiniz!');
            return;
        }

        for (let i = 0; i < this.survey.questions.length; i++) {
            const question = this.survey.questions[i];
            
            if (!question.questionTitle?.trim()) {
                alert(`${i + 1}. soru için başlık girmelisiniz!`);
                return;
            }
            
            // Seçenek gerektiren soru tipleri için kontrol
            if (this.requiresOptions(question.questionTypeId)) {
                if (!question.options || question.options.length < 2) {
                    alert(`${i + 1}. soru için en az iki seçenek eklemelisiniz!`);
                    return;
                }
                
                // Boş seçenek kontrolü
                const emptyOption = question.options.find(opt => !opt.optionText?.trim());
                if (emptyOption) {
                    alert(`${i + 1}. soru için tüm seçenekleri doldurmalısınız!`);
                    return;
                }
            }
        }

        this.isSaving = true;

        this.surveyService.createSurvey(this.survey as Omit<Survey, 'surveyId' | 'createdAt' | 'updatedAt'>).subscribe({
            next: (response: any) => {
                const surveyId = response.surveyId;
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
                options: (question.options || []).map((o, index) => ({
                    optionText: o.optionText,
                    optionValue: o.optionValue || o.optionText,
                    imageUrl: '',
                    sortOrder: index,
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

    requiresOptions(typeId: number | string): boolean {
        const numericTypeId = Number(typeId);
        // Seçenek gerektiren soru tipleri: 3 (Radio), 4 (Checkbox), 5 (Dropdown)
        return [3, 4, 5].includes(numericTypeId);
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
        if (!question.options || question.options.length <= 2) {
            alert('En az iki seçenek olmalıdır!');
            return;
        }
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
        if (confirm('Değişiklikler kaydedilmeden çıkmak istediğinize emin misiniz?')) {
            this.router.navigate(['/dashboard/surveys']);
        }
    }

    addQuestion(): void {
        const newQuestion: Question = {
            questionId: 0,
            questionTitle: '',
            questionDescription: '',
            surveyId: 0,
            questionTypeId: 1, // Varsayılan olarak kısa metin
            isRequired: false,
            conditionalLogic: '',
            validationRules: '',
            createdAt: new Date(),
            options: []
        };
        if (!this.survey.questions) {
            this.survey.questions = [];
        }
        this.survey.questions.push(newQuestion);
    }

    removeQuestion(index: number): void {
        if (this.survey.questions && this.survey.questions.length > 1) {
            this.survey.questions.splice(index, 1);
        } else {
            alert('En az bir soru olmalıdır!');
        }
    }

    trackByIndex(_i: number, _item: any): number {
        return _i;
    }

    onTemplateSelected(template: SurveyTemplate): void {
        this.selectedTemplate = template;
        this.templateService.createSurveyFromTemplate(template.id).subscribe({
            next: (survey) => {
                if (survey) {
                    this.survey = survey;
                    this.showTemplateSelector = false;
                    console.log('Template yüklendi:', template.name);
                    
                    // Query params'ları temizle
                    this.clearQueryParams();
                }
            },
            error: (err) => {
                console.error('Template yüklenirken hata:', err);
                alert('Template yüklenirken hata oluştu!');
            }
        });
    }

    private clearQueryParams(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
        });
    }

    onCreateBlank(): void {
        this.showTemplateSelector = false;
        this.addQuestion(); // Boş anket için varsayılan soru ekle
    }

    backToTemplates(): void {
        if (confirm('Değişiklikler kaybolacak. Template seçimine dönmek istediğinize emin misiniz?')) {
            this.showTemplateSelector = true;
            this.survey = {
                title: '',
                description: '',
                questions: [],
                isActive: true
            };
            this.selectedTemplate = null;
        }
    }
}