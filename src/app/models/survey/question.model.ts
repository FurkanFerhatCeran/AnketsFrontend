// Question Models

export interface QuestionOption {
	optionId?: number;
	optionText: string;
	optionValue: string;
	imageUrl?: string;
	sortOrder?: number;
	isOtherOption?: boolean;
	conditionalLogic?: string;
	createdAt?: string | Date;
}

export interface CreateQuestionRequest {
	questionTitle: string;
	questionDescription?: string;
	surveyId: number;
	questionTypeId: number;
	isRequired: boolean;
	conditionalLogic?: string;
	validationRules?: string;
	options?: QuestionOption[];
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {}

export interface QuestionResponse {
	questionId: number;
	questionTitle: string;
	questionDescription?: string;
	surveyId: number;
	questionTypeId: number;
	isRequired: boolean;
	conditionalLogic?: string;
	validationRules?: string;
	createdAt: string;
	updatedAt: string;
	options: QuestionOption[];
}