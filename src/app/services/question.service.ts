// src/app/services/question.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionType } from '../models/question-type.model';
import { ApiService } from './api.service';

export interface QuestionOption {
	optionId?: number;
	optionText: string;
	optionValue: string;
	imageUrl?: string;
	sortOrder?: number;
	isOtherOption?: boolean;
	conditionalLogic?: string;
	createdAt?: Date;
}

export interface Question {
	questionId?: number;
	questionTitle: string;
	questionDescription?: string;
	surveyId: number;
	questionTypeId: number;
	isRequired: boolean;
	conditionalLogic?: string;
	validationRules?: any;
	createdAt?: Date;
	updatedAt?: Date;
	options?: QuestionOption[];
}

export interface QuestionResponse {
	questionId: number;
	questionTitle: string;
	questionDescription: string;
	surveyId: number;
	questionTypeId: number;
	isRequired: boolean;
	conditionalLogic: string;
	validationRules: any;
	createdAt: Date;
	updatedAt: Date;
	options: QuestionOption[];
}

@Injectable({
	providedIn: 'root'
})
export class QuestionService {
	constructor(private apiService: ApiService) {}

	createQuestion(question: Question): Observable<QuestionResponse> {
		return this.apiService.createQuestion(question);
	}

	updateQuestion(id: number, question: Question): Observable<QuestionResponse> {
		return this.apiService.updateQuestion(id, question);
	}

	deleteQuestion(id: number): Observable<void> {
		return this.apiService.deleteQuestion(id);
	}

	getQuestionById(id: number): Observable<QuestionResponse> {
		return this.apiService.getQuestionById(id);
	}

	getQuestionsBySurvey(surveyId: number): Observable<QuestionResponse[]> {
		return this.apiService.getQuestionsBySurvey(surveyId);
	}

	getQuestionTypes(): Observable<QuestionType[]> {
		return this.apiService.getQuestionTypes();
	}
}