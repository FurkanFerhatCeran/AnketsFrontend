import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  id?: number;
  username?: string;
  email: string;
  nameSurname: string;
  phone?: string;
  bio?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Frontend için backward compatibility
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileRequest {
  nameSurname: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
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
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  nameSurname: string;
  phone?: string;
  bio?: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  // Kullanıcı profil bilgilerini getir
  getUserProfile(): Observable<ProfileResponse> {
    return this.apiService.get<ProfileResponse>('/api/Users/profile');
  }

  // Profil güncelle
  updateProfile(profile: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.apiService.put<ProfileResponse>('/api/Users/profile', profile);
  }

  // Şifre değiştir
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.apiService.post<any>('/api/Users/change-password', passwordData);
  }

  // Avatar yükle
  uploadAvatar(file: File): Observable<{ avatarUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // FormData için özel HTTP request
    const token = localStorage.getItem('accessToken');
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    return new Observable(observer => {
      fetch(`${this.apiService['baseUrl']}/api/Users/upload-avatar`, {
        method: 'POST',
        headers: headers,
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        observer.next(data);
        observer.complete();
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  // Kullanıcı istatistikleri
  getUserStatistics(): Observable<UserStatistics> {
    return this.apiService.get<UserStatistics>('/api/Users/statistics');
  }
}

// Backward compatibility için
export type PasswordData = ChangePasswordRequest;