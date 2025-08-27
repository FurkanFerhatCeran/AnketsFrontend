import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { API_ENDPOINTS, ApiService } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';

/**
 * Kullanıcı ayarlarını yöneten bileşen.
 * Tema değiştirme, e-posta bildirimlerini yönetme ve hesabı devre dışı bırakma gibi işlevleri içerir.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  // API'den gelen ayarların tipini tanımlıyoruz
  // Bu, "response" is of type "unknown" hatasını çözer.
  emailNotifications: boolean = true;
  successMessage: string | null = null;
  isDarkTheme: boolean = false;
  
  // Hesabı devre dışı bırakma onayı için bir değişken
  showDeactivationModal: boolean = false;
  deactivationSuccessMessage: string | null = null;

  private themeSubscription!: Subscription;

  constructor(
    private themeService: ThemeService,
    private apiService: ApiService
  ) {}

  /**
   * Bileşen başlatıldığında çağrılır.
   * Tema aboneliğini ve API'den ayarları getirme işlemini başlatır.
   */
  ngOnInit(): void {
    // Tema değişikliklerini dinle
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });

    // API'den ayarları getir
    this.getSettingsFromApi();
  }

  /**
   * Bileşen yok edildiğinde çağrılır.
   * Bellek sızıntılarını önlemek için aboneliği sonlandırır.
   */
  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Karanlık ve aydınlık tema arasında geçiş yapar.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  /**
   * API'den mevcut kullanıcı ayarlarını getirir.
   */
  getSettingsFromApi(): void {
    // API yanıtının tipini belirterek tür güvenliğini sağlıyoruz.
    // Bu, "response.emailNotifications" erişimini mümkün kılar.
    interface SettingsResponseDto {
        language: string;
        emailNotifications: boolean;
    }
    
    this.apiService.get<SettingsResponseDto>(API_ENDPOINTS.USER_SETTINGS.GET).subscribe({
      next: (response) => {
        // Gelen yanıtı bileşen değişkenlerine atayın
        this.emailNotifications = response.emailNotifications;
      },
      error: (error) => {
        console.error('Ayarlar getirilirken bir hata oluştu', error);
      }
    });
  }

  /**
   * API'ye ayarları kaydeder.
   */
  saveSettings(): void {
    const settings = {
      emailNotifications: this.emailNotifications
    };

    this.apiService.put(API_ENDPOINTS.USER_SETTINGS.UPDATE, settings).subscribe({
      next: (response) => {
        console.log('Ayarlar başarıyla güncellendi', response);
        this.showSuccessMessage('Ayarlarınız başarıyla kaydedildi.');
      },
      error: (error) => {
        console.error('Ayarlar kaydedilirken bir hata oluştu', error);
        // Hata durumunda kullanıcıya bildirim gösterilebilir
      }
    });
  }

  /**
   * Hesabı devre dışı bırakma modalını gösterir.
   */
  showDeactivateModal(): void {
    this.showDeactivationModal = true;
  }

  /**
   * Hesabı devre dışı bırakma işlemini onaylar ve API'ye istek gönderir.
   */
  confirmDeactivation(): void {
    this.apiService.delete(API_ENDPOINTS.USER_SETTINGS.DEACTIVATE).subscribe({
      next: (response) => {
        console.log('Hesap devre dışı bırakıldı', response);
        this.deactivationSuccessMessage = 'Hesabınız başarıyla devre dışı bırakıldı.';
        this.showDeactivationModal = false; // Modalı kapat
        setTimeout(() => {
          this.deactivationSuccessMessage = null;
        }, 3000);
        // Çıkış yapma veya ana sayfaya yönlendirme gibi işlemler eklenebilir
      },
      error: (error) => {
        console.error('Hesap devre dışı bırakılırken bir hata oluştu', error);
        // Hata durumunda bildirim göster
      }
    });
  }

  /**
   * Hesabı devre dışı bırakma modalını iptal eder.
   */
  cancelDeactivation(): void {
    this.showDeactivationModal = false;
  }

  /**
   * Başarı mesajını kullanıcıya gösterir.
   * @param message Gösterilecek mesaj.
   */
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}
