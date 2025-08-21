// src/app/pages/surveys/survey-create/survey-create.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
	survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'> = {
		title: '',
		description: '',
		questions: [],
		isActive: true
	};

	questionTypes: QuestionType[] = [];

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
		if (!this.survey.title.trim()) {
			alert('Anket başlığı zorunludur!');
			return;
		}

		const createBtn = document.querySelector('.btn-primary') as HTMLButtonElement;
		if (createBtn) {
			createBtn.disabled = true;
			createBtn.textContent = 'Kaydediliyor...';
		}

		this.surveyService.createSurvey(this.survey).subscribe({
			next: (response: any) => {
				if (response.id && this.survey.questions.length > 0) {
					this.saveQuestions(response.id);
				} else {
					this.router.navigate(['/dashboard/surveys']);
				}
			},
			error: (error) => {
				console.error('Error creating survey:', error);
				alert('Anket kaydedilirken hata oluştu!');
				if (createBtn) {
					createBtn.disabled = false;
					createBtn.textContent = 'Anketi Kaydet';
				}
			}
		});
	}

	private saveQuestions(surveyId: number): void {
		let completed = 0;
		const totalQuestions = this.survey.questions.length;

		this.survey.questions.forEach((question) => {
			const questionToSave: any = {
				questionTitle: question.questionTitle,
				questionDescription: question.questionDescription || '',
				surveyId: surveyId,
				questionTypeId: Number(question.questionTypeId),
				isRequired: question.isRequired,
				conditionalLogic: question.conditionalLogic || '',
				validationRules: question.validationRules || null,
				options: (question.options || []).map((o, i) => ({
					optionText: o.optionText,
					optionValue: o.optionValue ?? o.optionText,
					sortOrder: i
				}))
			};

			this.questionService.createQuestion(questionToSave).subscribe({
				next: () => {
					completed++;
					if (completed === totalQuestions) {
						this.router.navigate(['/dashboard/surveys']);
					}
				},
				error: (error) => {
					console.error('Error saving question:', error);
					completed++;
					if (completed === totalQuestions) {
						this.router.navigate(['/dashboard/surveys']);
					}
				}
			});
		});
	}

	requiresOptions(typeId: number | string): boolean {
		const t = this.questionTypes.find(t => t.id === Number(typeId));
		return !!t?.requiredOptions;
	}

	onTypeChange(question: Question): void {
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

	addOption(question: Question): void {
		if (!question.options) question.options = [];
		question.options.push({
			optionText: '',
			optionValue: '',
			sortOrder: question.options.length
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
			surveyId: 0,
			questionTypeId: 1,
			isRequired: false,
			createdAt: new Date(),
			options: []
		};
		this.survey.questions.push(newQuestion);
	}

	removeQuestion(index: number): void {
		this.survey.questions.splice(index, 1);
	}

	trackByIndex(_i: number, _item: any): number {
		return _i;
	}
}