// src/app/models/user/user.models.ts
export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  nameSurname: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roleId: number;
  role?: Role;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
}

export interface UpdateProfileRequest {
  nameSurname: string;
  email: string;
  avatarUrl?: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStatistics {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  daysActive: number;
  completionRate: number;
  averageRating?: number;
}