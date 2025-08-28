import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PasswordData, UpdateProfileRequest, UserProfile, UserService, UserStatistics } from '../../services/user.service';
import { ProfileResponse } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Backend'den gelen profil verisi
  profileData: ProfileResponse | null = null;

  // Form için kullanılan profil objesi
  userProfile: UserProfile = {
    nameSurname: '', // Eksik olan alan eklendi
    email: '',
    phone: '',
    bio: '',
    role: '',
    avatar: ''
  };

  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  userStats: UserStatistics = {
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    daysActive: 0,
    completionRate: 0
  };

  isLoading = false;
  showSuccessMessage = false;
  successMessage = '';
  showErrorMessage = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Kullanıcı profilini yükle
  loadUserProfile(): void {
    console.log('Backend\'den profil bilgileri yükleniyor...');
    this.isLoading = true;
    
    this.userService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: ProfileResponse) => {
          console.log('Backend\'den gelen profil verisi:', profile);
          
          this.userProfile = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            nameSurname: profile.nameSurname,
            phone: profile.phone || '',
            bio: profile.bio || '',
            role: this.translateRole(profile.role),
            avatar: profile.avatar || '',
            
            // Backward compatibility için firstName/lastName çıkar
            firstName: this.extractFirstName(profile.nameSurname),
            lastName: this.extractLastName(profile.nameSurname),
            
            // String olarak bırak (Date'e çevirme)
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
          };

          console.log('Component\'e set edilen profil:', this.userProfile);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Profil yüklenirken hata:', error);
          
          if (error.status === 401) {
            this.showError('Oturum açık değil. Lütfen tekrar giriş yapın.');
            localStorage.removeItem('accessToken');
          } else if (error.status === 404) {
            this.showError('Profil bilgileri bulunamadı.');
          } else {
            this.showError('Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.');
          }
          
          this.isLoading = false;
        }
      });
  }

  // Kullanıcı istatistiklerini yükle
  loadUserStatistics(): void {
    this.userService.getUserStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: UserStatistics) => {
          this.userStats = stats;
        },
        error: (error: any) => {
          console.error('İstatistikler yüklenirken hata:', error);
          // İstatistikler yüklenemese bile sayfa çalışmaya devam etsin
        }
      });
  }

  // Kullanıcı baş harflerini al
  getUserInitials(): string {
    const firstName = this.userProfile.firstName || '';
    const lastName = this.userProfile.lastName || '';
    
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else {
      return 'KU'; // Default
    }
  }

  // Kullanıcı tam adını al
  getUserDisplayName(): string {
    const firstName = this.userProfile.firstName || '';
    const lastName = this.userProfile.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return 'Kullanıcı Adı';
    }
  }

  // Kullanıcı rolünü al
  getUserRole(): string {
    return this.userProfile.role || 'Anket Yöneticisi';
  }

  // Profil güncelle
  updateProfile(): void {
    if (!this.userProfile.nameSurname?.trim()) {
      this.showError('Ad soyad alanı zorunludur.');
      return;
    }

    console.log('Profil güncelleniyor:', this.userProfile);
    this.isLoading = true;
    
    const updateData: UpdateProfileRequest = {
      nameSurname: this.userProfile.nameSurname.trim(),
      phone: this.userProfile.phone?.trim() || '',
      bio: this.userProfile.bio?.trim() || ''
    };

    console.log('Backend\'e gönderilen güncelleme verisi:', updateData);

    this.userService.updateProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProfileResponse) => {
          console.log('Profil güncelleme yanıtı:', response);
          
          this.userProfile = {
            ...this.userProfile,
            nameSurname: response.nameSurname,
            phone: response.phone || '',
            bio: response.bio || '',
            // String olarak bırak (Date'e çevirme)
            updatedAt: response.updatedAt
          };
          
          this.showSuccess('Profil başarıyla güncellendi!');
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Profil güncellenirken hata:', error);
          
          if (error.status === 400 && error.error?.errors) {
            // Validation errors
            const errors = error.error.errors;
            let errorMessage = 'Doğrulama hataları:\n';
            Object.keys(errors).forEach(key => {
              errorMessage += `${key}: ${errors[key].join(', ')}\n`;
            });
            this.showError(errorMessage);
          } else {
            this.showError('Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
          }
          
          this.isLoading = false;
        }
      });
  }

  // Şifre değiştir
  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.showError('Tüm şifre alanları zorunludur.');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showError('Yeni şifreler eşleşmiyor!');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.showError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    this.isLoading = true;
    
    this.userService.changePassword(this.passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.showSuccess('Şifre başarıyla değiştirildi!');
          this.isLoading = false;
          
          // Form temizle
          this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        },
        error: (error: any) => {
          console.error('Şifre değiştirilirken hata:', error);
          this.showError('Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
          this.isLoading = false;
        }
      });
  }

  // Form sıfırla
  resetForm(): void {
    this.loadUserProfile();
  }

  // Avatar değiştir
  changeAvatar(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          this.showError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
          return;
        }
        this.uploadAvatar(file);
      }
    };
    
    input.click();
  }

  // Avatar yükle
  uploadAvatar(file: File): void {
    this.isLoading = true;
    
    this.userService.uploadAvatar(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { avatarUrl: string }) => {
          this.userProfile.avatar = response.avatarUrl;
          this.showSuccess('Profil fotoğrafı güncellendi!');
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Avatar yüklenirken hata:', error);
          this.showError('Profil fotoğrafı yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
          this.isLoading = false;
        }
      });
  }

  // İstatistikler
  getTotalSurveys(): number {
    return this.userStats.totalSurveys;
  }

  getActiveSurveys(): number {
    return this.userStats.activeSurveys;
  }

  getTotalResponses(): number {
    return this.userStats.totalResponses;
  }

  getDaysActive(): number {
    return this.userStats.daysActive;
  }

  getCompletionRate(): number {
    return this.userStats.completionRate;
  }

  // Başarı mesajı göster
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    this.showErrorMessage = false;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }

  // Hata mesajı göster
  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorMessage = true;
    this.showSuccessMessage = false;
    
    setTimeout(() => {
      this.showErrorMessage = false;
    }, 5000);
  }

  // Role'u Türkçeye çevir
  private translateRole(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Yönetici';
      case 'SURVEY_MANAGER':
        return 'Anket Yöneticisi';
      case 'USER':
        return 'Kullanıcı';
      default:
        return role;
    }
  }

  // Adı soyadından adı çıkar
  private extractFirstName(nameSurname: string): string {
    const parts = nameSurname.split(' ');
    return parts[0] || '';
  }

  // Adı soyadından soyadı çıkar
  private extractLastName(nameSurname: string): string {
    const parts = nameSurname.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
}