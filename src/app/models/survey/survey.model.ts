// src/app/models/survey/survey.model.ts

export interface Question {
    id: string;
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'select';
    title: string;
    description?: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    createdAt: Date;
    isActive: boolean;
}

export interface SurveyResponse {
    id: string;
    surveyId: string;
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