// src/app/pages/surveys/survey-take/survey-take.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType } from '../../../models/question-type.model';
import { ApiService } from '../../../services/api.service';

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

	constructor(
		private apiService: ApiService,
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
			},
			error: (error) => {
				console.error('Anket yüklenirken hata:', error);
			}
		});
	}

	hasRequiredQuestions(): boolean {
		return this.survey.questions.some((q: any) => q.isRequired);
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

	selectRating(questionId: number, rating: number): void {
		this.answers[questionId] = rating;
	}

	onFileChange(questionId: number, event: any): void {
		const file = event.target.files[0];
		if (file) {
			this.answers[questionId] = file;
		}
	}

	onSubmit(): void {
		this.errors = [];
		
		this.survey.questions.forEach((question: any) => {
			if (question.isRequired && !this.answers[question.questionId]) {
				this.errors.push(question.questionId);
			}
		});

		if (this.errors.length > 0) {
		 return;
		}

		this.submitting = true;
		
		const responseData = {
			surveyId: this.survey.id,
			respondentName: this.respondentName,
			answers: Object.keys(this.answers).map(questionId => ({
				questionId: parseInt(questionId),
				answer: this.answers[parseInt(questionId)]
			}))
		};

		this.apiService.submitSurveyResponse(responseData).subscribe({
			next: () => {
				this.submitting = false;
				this.router.navigate(['/survey-thank-you']);
			},
			error: (error) => {
				console.error('Yanıt gönderilirken hata:', error);
				this.submitting = false;
			}
		});
	}

	onBack(): void {
		this.router.navigate(['/surveys']);
	}
}