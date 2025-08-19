// src/app/services/survey.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- BU SATIRI EKLEYİN
import { Question, Survey, SurveyResponse, SurveyResult } from '../models/survey/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private surveys: Survey[] = [];
  private responses: SurveyResponse[] = [];
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  private responsesSubject = new BehaviorSubject<SurveyResponse[]>([]);

  constructor() {
    this.loadMockData();
  }
  
  getSurveyCount(): Observable<number> {
    return this.surveysSubject.asObservable().pipe(
      map(surveys => surveys.length)
    );
  }
  
  getResponsesCount(): Observable<number> {
    return this.responsesSubject.asObservable().pipe(
      map(responses => responses.length)
    );
  }
  
  getSurveys(): Observable<Survey[]> {
    return this.surveysSubject.asObservable();
  }
  
  getResponses(): Observable<SurveyResponse[]> {
    return this.responsesSubject.asObservable();
  }

  getSurveyById(id: string): Survey | undefined {
    return this.surveys.find(survey => survey.id === id);
  }

  createSurvey(survey: Omit<Survey, 'id' | 'createdAt'>): Survey {
    const newSurvey: Survey = {
      ...survey,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    this.surveys.push(newSurvey);
    this.surveysSubject.next([...this.surveys]);
    return newSurvey;
  }

  updateSurvey(id: string, updates: Partial<Survey>): boolean {
    const index = this.surveys.findIndex(s => s.id === id);
    if (index !== -1) {
      this.surveys[index] = { ...this.surveys[index], ...updates };
      this.surveysSubject.next([...this.surveys]);
      return true;
    }
    return false;
  }

  deleteSurvey(id: string): boolean {
    const index = this.surveys.findIndex(s => s.id === id);
    if (index !== -1) {
      this.surveys.splice(index, 1);
      this.responses = this.responses.filter(r => r.surveyId !== id);
      this.surveysSubject.next([...this.surveys]);
      this.responsesSubject.next([...this.responses]);
      return true;
    }
    return false;
  }

  submitResponse(response: Omit<SurveyResponse, 'id' | 'submittedAt'>): SurveyResponse {
    const newResponse: SurveyResponse = {
      ...response,
      id: this.generateId(),
      submittedAt: new Date()
    };

    this.responses.push(newResponse);
    this.responsesSubject.next([...this.responses]);
    return newResponse;
  }

  getSurveyResults(surveyId: string): SurveyResult | undefined {
    const survey = this.getSurveyById(surveyId);
    if (!survey) return undefined;

    const surveyResponses = this.responses.filter(r => r.surveyId === surveyId);
    const questionStats: { [questionId: string]: any } = {};

    survey.questions.forEach((question: Question) => {
      const answers = surveyResponses.map(r => r.answers[question.id]).filter(a => a != null);
      
      switch (question.type) {
        case 'radio':
        case 'select':
          questionStats[question.id] = this.calculateChoiceStats(answers, question.options || []);
          break;
        case 'checkbox':
          questionStats[question.id] = this.calculateCheckboxStats(answers, question.options || []);
          break;
        case 'rating':
          questionStats[question.id] = this.calculateRatingStats(answers);
          break;
        default:
          questionStats[question.id] = { responses: answers, count: answers.length };
      }
    });

    return {
      survey,
      responses: surveyResponses,
      totalResponses: surveyResponses.length,
      questionStats
    };
  }

  private calculateChoiceStats(answers: any[], options: string[]) {
    const stats: { [option: string]: number } = {};
    options.forEach(option => stats[option] = 0);
    
    answers.forEach(answer => {
      if (stats.hasOwnProperty(answer)) {
        stats[answer]++;
      }
    });

    return {
      distribution: stats,
      total: answers.length,
      percentages: Object.entries(stats).reduce((acc, [key, value]) => {
        acc[key] = answers.length > 0 ? (value / answers.length) * 100 : 0;
        return acc;
      }, {} as { [key: string]: number })
    };
  }

  private calculateCheckboxStats(answers: any[], options: string[]) {
    const stats: { [option: string]: number } = {};
    options.forEach(option => stats[option] = 0);
    
    answers.forEach(answer => {
      if (Array.isArray(answer)) {
        answer.forEach(choice => {
          if (stats.hasOwnProperty(choice)) {
            stats[choice]++;
          }
        });
      }
    });

    return {
      distribution: stats,
      total: answers.length,
      percentages: Object.entries(stats).reduce((acc, [key, value]) => {
        acc[key] = answers.length > 0 ? (value / answers.length) * 100 : 0;
        return acc;
      }, {} as { [key: string]: number })
    };
  }

  private calculateRatingStats(answers: number[]) {
    if (answers.length === 0) return { average: 0, distribution: {}, total: 0 };

    const distribution: { [rating: string]: number } = {};
    answers.forEach(rating => {
      distribution[rating.toString()] = (distribution[rating.toString()] || 0) + 1;
    });

    const average = answers.reduce((sum, rating) => sum + rating, 0) / answers.length;

    return {
      average: Math.round(average * 100) / 100,
      distribution,
      total: answers.length
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadMockData(): void {
    const mockSurvey: Survey = {
      id: 'demo-survey',
      title: 'Müşteri Memnuniyet Anketi',
      description: 'Hizmetlerimizi değerlendirin ve deneyiminizi paylaşın.',
      isActive: true,
      createdAt: new Date(),
      questions: [
        {
          id: 'q1',
          type: 'radio',
          title: 'Genel memnuniyet düzeyiniz nedir?',
          description: 'Hizmetlerimizden genel olarak ne kadar memnunsunuz?',
          required: true,
          options: ['Çok Memnun', 'Memnun', 'Kararsız', 'Memnun Değil', 'Hiç Memnun Değil']
        },
        {
          id: 'q2',
          type: 'rating',
          title: '1-5 arasında puanlayın',
          description: 'Hizmet kalitemizi 1-5 arasında puanlayın.',
          required: true,
          min: 1,
          max: 5
        },
        {
          id: 'q3',
          type: 'checkbox',
          title: 'Hangi özellikler önemli? (Birden fazla seçebilirsiniz)',
          required: false,
          options: ['Hızlı Teslimat', 'Uygun Fiyat', 'Kaliteli Ürün', 'İyi Müşteri Hizmeti', 'Kolay İade']
        },
        {
          id: 'q4',
          type: 'textarea',
          title: 'Ek yorumlarınız',
          description: 'Lütfen deneyiminiz hakkında detayları paylaşın.',
          required: false
        }
      ]
    };

    this.surveys.push(mockSurvey);
    this.surveysSubject.next([...this.surveys]);
  }
}