import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  role?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  // Kullanıcı profil bilgilerini getir
  getUserProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('/api/Users/profile');
  }

  // Profil güncelle
  updateProfile(profile: UpdateProfileRequest): Observable<UserProfile> {
    return this.apiService.put<UserProfile>('/api/Users/profile', profile);
  }

  // Şifre değiştir
  changePassword(passwordData: PasswordData): Observable<any> {
    return this.apiService.post<any>('/api/Users/change-password', passwordData);
  }

  // Avatar yükle
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // FormData için özel HTTP options
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
      .then(response => response.json())
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

  // Kullanıcının anketlerini getir
  getUserSurveys(): Observable<any[]> {
    return this.apiService.get<any[]>('/api/Users/surveys');
  }

  // Kullanıcının anket yanıtlarını getir
  getUserResponses(): Observable<any[]> {
    return this.apiService.get<any[]>('/api/Users/responses');
  }

  // Kullanıcı aktivite geçmişi
  getUserActivityHistory(): Observable<any[]> {
    return this.apiService.get<any[]>('/api/Users/activity-history');
  }

  // Hesap silme
  deleteAccount(): Observable<any> {
    return this.apiService.delete<any>('/api/Users/account');
  }

  // Kullanıcı ayarları
  getUserSettings(): Observable<any> {
    return this.apiService.get<any>('/api/Users/settings');
  }

  // Kullanıcı ayarlarını güncelle
  updateUserSettings(settings: any): Observable<any> {
    return this.apiService.put<any>('/api/Users/settings', settings);
  }

  // Kullanıcı bildirimleri
  getUserNotifications(): Observable<any[]> {
    return this.apiService.get<any[]>('/api/Users/notifications');
  }

  // Bildirim okundu olarak işaretle
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.apiService.put<any>(`/api/Users/notifications/${notificationId}/read`, {});
  }

  // Tüm bildirimleri okundu olarak işaretle
  markAllNotificationsAsRead(): Observable<any> {
    return this.apiService.put<any>('/api/Users/notifications/read-all', {});
  }
}