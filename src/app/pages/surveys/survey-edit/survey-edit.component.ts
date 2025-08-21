// src/app/pages/surveys/survey-edit/survey-edit.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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
		this.loadSurvey();
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

	loadSurvey(): void {
		const surveyId = this.route.snapshot.params['id'];
		
		this.apiService.getSurveyById(surveyId).subscribe({
			next: (survey) => {
				this.survey = survey;
				this.isLoading = false;
			},
			error: (error) => {
				console.error('Anket yüklenirken hata:', error);
				this.isLoading = false;
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
				{ optionText: '', optionValue: '', sortOrder: 0 },
				{ optionText: '', optionValue: '', sortOrder: 1 }
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
			sortOrder: question.options.length
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
			questionTypeId: 1,
			isRequired: false,
			options: []
		};
		this.survey.questions.push(newQuestion);
	}

	removeQuestion(index: number): void {
		const q = this.survey.questions[index];
		if (q?.questionId && q.questionId > 0) {
			this.questionService.deleteQuestion(q.questionId).subscribe({
				next: () => {
					this.survey.questions.splice(index, 1);
				},
				error: (err) => {
					console.error('Soru silinirken hata:', err);
				}
			});
		} else {
			this.survey.questions.splice(index, 1);
		}
	}

	saveSurvey(): void {
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
					sortOrder: i
				}))
			};
			return question.questionId && question.questionId > 0
				? this.questionService.updateQuestion(question.questionId, payload)
				: this.questionService.createQuestion(payload);
		});

		if (requests.length === 0) {
			this.isSaving = false;
			this.router.navigate(['/surveys']);
			return;
		}

		forkJoin(requests).subscribe({
			next: () => {
				this.isSaving = false;
				this.router.navigate(['/surveys']);
			},
			error: (error) => {
				console.error('Sorular güncellenirken/oluşturulurken hata:', error);
				this.isSaving = false;
			}
		});
	}

	cancel(): void {
		this.router.navigate(['/surveys']);
	}

	trackByIndex(_i: number, _item: any): number {
		return _i;
	}
}