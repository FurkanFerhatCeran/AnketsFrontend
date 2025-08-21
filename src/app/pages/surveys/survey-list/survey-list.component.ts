// src/app/pages/surveys/survey-list/survey-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Survey } from '../../../models/survey/survey.model';
import { SurveyService } from '../../../services/survey.service';

@Component({
	selector: 'app-survey-list',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './survey-list.component.html',
	styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
	surveys: Survey[] = [];
	isLoading = true;
	showDeleteModal = false;
	surveyToDelete: Survey | null = null;
	showSuccessMessage = false;
	successMessage = '';
	activeDropdown: number | null = null;

	constructor(
		private surveyService: SurveyService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadSurveys();
	}

	loadSurveys(): void {
		this.surveyService.getSurveys().subscribe({
			next: (surveys) => {
				this.surveys = surveys;
				this.isLoading = false;
			},
			error: (error) => {
				console.error('Error loading surveys:', error);
				this.isLoading = false;
			}
		});
	}

	getActiveCount(): number {
		return this.surveys.filter(s => s.isActive).length;
	}

	getTotalResponses(): number {
		return this.surveys.reduce((total, survey) => total + (survey.responseCount || 0), 0);
	}

	getResponseCount(surveyId: number): number {
		const survey = this.surveys.find(s => s.id === surveyId);
		return survey ? survey.responseCount || 0 : 0;
	}

	getCompletionRate(surveyId: number): number {
		return Math.min(100, Math.floor((this.getResponseCount(surveyId) / 10) * 100));
	}

	formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('tr-TR');
	}

	navigateToCreate(): void {
		this.router.navigate(['/dashboard/surveys/create']);
	}

	navigateToEdit(surveyId: number): void {
		this.router.navigate(['/dashboard/surveys/edit', surveyId]);
	}

	navigateToView(surveyId: number): void {
		this.router.navigate(['/dashboard/surveys/take', surveyId]);
	}

	navigateToResults(surveyId: number): void {
		this.router.navigate(['/dashboard/surveys/results', surveyId]);
	}

	toggleDropdown(surveyId: number): void {
		this.activeDropdown = this.activeDropdown === surveyId ? null : surveyId;
	}

	confirmDelete(survey: Survey): void {
		this.surveyToDelete = survey;
		this.showDeleteModal = true;
		this.activeDropdown = null;
	}

	cancelDelete(): void {
		this.showDeleteModal = false;
		this.surveyToDelete = null;
	}

	executeDelete(): void {
		if (this.surveyToDelete) {
			this.surveyService.deleteSurvey(this.surveyToDelete.id).subscribe({
				next: () => {
					this.surveys = this.surveys.filter(s => s.id !== this.surveyToDelete!.id);
					this.showDeleteModal = false;
					this.surveyToDelete = null;
					this.showSuccess('Anket başarıyla silindi.');
				},
				error: (error) => {
					console.error('Error deleting survey:', error);
					this.showDeleteModal = false;
				}
			});
		}
	}

	toggleSurveyStatus(survey: Survey): void {
		const updatedSurvey = { ...survey, isActive: !survey.isActive };
		this.surveyService.updateSurvey(survey.id, updatedSurvey).subscribe({
			next: () => {
				survey.isActive = !survey.isActive;
				this.showSuccess(`Anket ${survey.isActive ? 'aktif' : 'pasif'} hale getirildi.`);
				this.activeDropdown = null;
			},
			error: (error) => {
				console.error('Error updating survey status:', error);
			}
		});
	}

	duplicateSurvey(survey: Survey): void {
		const newSurvey = {
			...survey,
			title: `${survey.title} (Kopya)`,
			id: 0
		};
		
		this.surveyService.createSurvey(newSurvey).subscribe({
			next: () => {
				this.loadSurveys();
				this.showSuccess('Anket başarıyla kopyalandı.');
				this.activeDropdown = null;
			},
			error: (error) => {
				console.error('Error duplicating survey:', error);
			}
		});
	}

	shareSurvey(survey: Survey): void {
		const shareUrl = `${window.location.origin}/survey/${survey.id}`;
		navigator.clipboard.writeText(shareUrl).then(() => {
			this.showSuccess('Paylaşım linki panoya kopyalandı.');
			this.activeDropdown = null;
		});
	}

	exportSurvey(survey: Survey): void {
		const csvContent = this.convertToCSV(survey);
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${survey.title.replace(/\s+/g, '_')}.csv`;
		link.click();
		window.URL.revokeObjectURL(url);
		this.activeDropdown = null;
	}

	private convertToCSV(survey: Survey): string {
		const headers = ['Soru', 'Yanıt Sayısı'];
		const rows = survey.questions.map(q => [q.questionTitle, '0']);
		return [headers, ...rows].map(row => row.join(',')).join('\n');
	}

	private showSuccess(message: string): void {
		this.successMessage = message;
		this.showSuccessMessage = true;
		setTimeout(() => {
			this.showSuccessMessage = false;
		}, 3000);
	}

	trackBySurvey(index: number, survey: Survey): number {
		return survey.id;
	}
}