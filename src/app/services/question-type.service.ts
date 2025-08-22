// src/app/services/question-type.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionType } from '../models/question-type.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionTypeService {
  constructor(private api: ApiService) { }

  getQuestionTypes(): Observable<QuestionType[]> {
    return this.api.getQuestionTypes();
  }
}