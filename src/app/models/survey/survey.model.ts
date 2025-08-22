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
    surveyId: number; // Burayı "id" yerine "surveyId" yapıyoruz
    title: string; // Backend DTO'su ile eşleşiyor
    description: string; // Backend DTO'su ile eşleşiyor
    questions?: Question[];
    createdAt: Date;
    updatedAt?: Date;
    isActive: boolean;
    createdBy?: number;
    responseCount?: number;
    // Backend'de doğrudan bulunmadığı için frontend'de eklediğimiz bir özellik:
    questionCount?: number; 
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