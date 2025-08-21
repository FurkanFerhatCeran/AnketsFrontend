// src/app/models/question-type.model.ts
export interface QuestionType {
	id: number;
	name: string;
	description: string;
	inputType: string;
	allowMultiple: boolean;
	requiredOptions: boolean;
	maxOptions?: number | null;
	minOptions?: number | null;
	isActive: boolean;
}