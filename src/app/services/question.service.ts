// src/app/services/question.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionType } from '../models/question-type.model';
import { ApiService } from './api.service';
import {
	CreateQuestionRequest,
	UpdateQuestionRequest,
	QuestionResponse
} from '../models/survey/question.model';

@Injectable({
	providedIn: 'root'
})
export class QuestionService {
	constructor(private apiService: ApiService) {}

	createQuestion(question: CreateQuestionRequest): Observable<QuestionResponse> {
		return this.apiService.createQuestion(question);
	}

	updateQuestion(id: number, question: UpdateQuestionRequest): Observable<QuestionResponse> {
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