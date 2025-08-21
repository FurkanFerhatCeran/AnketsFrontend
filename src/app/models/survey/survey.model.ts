// models/survey/survey.model.ts
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
  questionId: number;
  questionTitle: string;
  questionDescription?: string;
  surveyId: number;
  questionTypeId: number;
  isRequired: boolean;
  conditionalLogic?: string;
  validationRules?: any; // Backend'de ValidationRules olarak geçiyor
  createdAt: Date;
  updatedAt?: Date;
  options?: QuestionOption[];
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  createdBy?: number;
  responseCount?: number; // Yeni eklenen property
}
export interface SurveyResponse {
  id: number;
  surveyId: number;
  answers: { [questionId: number]: any };
  submittedAt: Date;
  respondentName?: string;
}

export interface SurveyResult {
  survey: Survey;
  responses: SurveyResponse[];
  totalResponses: number;
  questionStats: { [questionId: number]: any };
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
  questionStats: { [questionId: number]: any };
  responseRate?: number;
}