// src/app/models/survey/survey.model.ts

export interface Question {
    id: string; // number → string'e değiştir
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'select';
    title: string;
    description?: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
}

export interface Survey {
    id: string; // number → string'e değiştir
    title: string;
    description: string;
    questions: Question[];
    createdAt: Date;
    isActive: boolean;
}

export interface SurveyResponse {
    id: string; // number → string'e değiştir
    surveyId: string; // number → string'e değiştir
    answers: { [questionId: string]: any };
    submittedAt: Date;
    respondentName?: string;
}

export interface SurveyResult {
    survey: Survey;
    responses: SurveyResponse[];
    totalResponses: number;
    questionStats: { [questionId: string]: any };
}

// Backend Response DTOs
export interface CreateSurveyResponse {
    id: number;
    title: string;
    message?: string;
}

export interface SurveyStatsResponse {
    survey: Survey;
    totalResponses: number;
    questionStats: { [questionId: string]: any };
    responseRate?: number;
}