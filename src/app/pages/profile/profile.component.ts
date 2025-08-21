import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PasswordData, UpdateProfileRequest, UserProfile, UserService, UserStatistics } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
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
    this.isLoading = true;
    
    this.userService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile) => {
          this.userProfile = profile;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Profil yüklenirken hata:', error);
          this.showError('Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.');
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
    if (!this.userProfile.firstName || !this.userProfile.lastName) {
      this.showError('Ad ve soyad alanları zorunludur.');
      return;
    }

    this.isLoading = true;
    
    const updateData: UpdateProfileRequest = {
      firstName: this.userProfile.firstName,
      lastName: this.userProfile.lastName,
      phone: this.userProfile.phone,
      bio: this.userProfile.bio
    };

    this.userService.updateProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserProfile) => {
          this.userProfile = { ...this.userProfile, ...response };
          this.showSuccess('Profil başarıyla güncellendi!');
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Profil güncellenirken hata:', error);
          this.showError('Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
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

  // Hesap silme modal'ını göster
  showDeleteAccountModal(): void {
    if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir!')) {
      this.deleteAccount();
    }
  }

  // Hesabı sil
  deleteAccount(): void {
    this.isLoading = true;
    
    this.userService.deleteAccount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.showSuccess('Hesabınız başarıyla silindi. Çıkış yapılıyor...');
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        },
        error: (error: any) => {
          console.error('Hesap silinirken hata:', error);
          this.showError('Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.');
          this.isLoading = false;
        }
      });
  }
}