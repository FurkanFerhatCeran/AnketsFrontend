// src/app/services/question-type.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface QuestionType {
  id: number;
  name: string;
  description: string;
  inputType: string;
  allowMultiple: boolean;
  requiredOptions: boolean;
  maxOptions: number | null;
  minOptions: number | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionTypeService {
  private apiUrl = 'api/questiontypes';

  constructor(private http: HttpClient) { }

  getQuestionTypes(): Observable<QuestionType[]> {
    return this.http.get<QuestionType[]>(this.apiUrl);
  }

  getQuestionTypeById(id: number): Observable<QuestionType> {
    return this.http.get<QuestionType>(`${this.apiUrl}/${id}`);
  }
}