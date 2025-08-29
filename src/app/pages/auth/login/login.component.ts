import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest, LoginResponse } from '../../../models/auth/auth.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const loginDto: LoginRequest = this.loginForm.value;
    
    this.authService.login(loginDto).subscribe({
      next: (response: LoginResponse) => {
        console.log('✅ Giriş başarılı:', response);
        this.handleLoginSuccess(response);
      },
      error: (err) => {
        console.error('❌ Giriş hatası:', err);
        this.handleLoginError(err);
      }
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.isLoading = false;
    
    console.log('🔐 Token kaydediliyor:', response.token);
    console.log('👤 Kullanıcı bilgileri:', response.user);
    
    // AuthService zaten otomatik olarak token ve user verilerini kaydedecek
    // Ekstra kontrol için manuel kaydetme
    if (response.token && response.user) {
      localStorage.setItem('accessToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    // Success animation
    this.showSuccessAnimation();
    
    // Role-based yönlendirme
    setTimeout(() => {
      const role = response.user?.roleName?.toLowerCase();
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }, 800);
  }

  private handleLoginError(err: any): void {
    this.isLoading = false;
    
    console.error('🚫 Hata detayları:', err);
    
    // API'den gelen hata mesajını kullan
    if (err instanceof Error) {
      this.errorMessage = this.translateErrorMessage(err.message);
    } else if (err?.error?.message) {
      // HTTP error response'dan mesaj al
      this.errorMessage = this.translateErrorMessage(err.error.message);
    } else if (err?.error) {
      // Error objesi içindeki mesaj
      this.errorMessage = this.translateErrorMessage(err.error);
    } else if (typeof err === 'string') {
      this.errorMessage = this.translateErrorMessage(err);
    } else {
      this.errorMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }

    // Form shake animation
    this.shakeForm();
  }

  private translateErrorMessage(message: string): string {
    const errorMap: {[key: string]: string} = {
      // Backend'den gelen olası hata mesajları
      'Invalid credentials': 'Geçersiz giriş bilgileri. Email veya şifre hatalı.',
      'User not found': 'Kullanıcı bulunamadı. Email adresinizi kontrol edin.',
      'Incorrect password': 'Hatalı şifre. Lütfen şifrenizi kontrol edin.',
      'Account is locked': 'Hesabınız kilitlenmiş. Yöneticinizle iletişime geçin.',
      'Account is not active': 'Hesabınız aktif değil. Lütfen email onayınızı yapın.',
      'Too many login attempts': 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.',
      'Email not verified': 'Email adresiniz doğrulanmamış. Lütfen email onayınızı yapın.',
      
      // Genel hata mesajları
      'Login failed': 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
      'Geçersiz email veya şifre': 'Email veya şifre hatalı. Lütfen tekrar deneyin.',
      'Geçersiz giriş bilgileri.': 'Email veya şifre hatalı. Lütfen tekrar deneyin.',
      'Server unavailable - Please check your connection': 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.',
      'Network error': 'Ağ bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      'Unauthorized - Please login again': 'Yetkiniz yok. Lütfen tekrar giriş yapın.',
      'Forbidden - Insufficient permissions': 'Bu işlem için yetkiniz yok.',
      
      // HTTP durum kodları
      '400': 'Hatalı istek. Lütfen bilgilerinizi kontrol edin.',
      '401': 'Geçersiz giriş bilgileri.',
      '403': 'Bu işlem için yetkiniz yok.',
      '404': 'İstenen kaynak bulunamadı.',
      '500': 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      '503': 'Servis geçici olarak kullanılamıyor.'
    };

    return errorMap[message] || message || 'Bilinmeyen hata oluştu.';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    console.log('🔄 Şifre sıfırlama işlemi başlatılıyor...');
    
    // Şifre sıfırlama sayfasına yönlendir
    this.router.navigate(['/auth/forgot-password']);
  }

  socialLogin(provider: string): void {
    console.log(`🔗 ${provider} ile giriş yapılıyor...`);
    alert(`${provider} ile giriş özelliği yakında eklenecek.`);
  }

  private showSuccessAnimation(): void {
    const button = document.querySelector('.login-button') as HTMLElement;
    if (button) {
      button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      button.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          <span>Giriş Başarılı!</span>
        </div>
      `;
    }
  }

  private shakeForm(): void {
    const container = document.querySelector('.login-container') as HTMLElement;
    if (container) {
      container.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        container.style.animation = '';
      }, 500);
    }
  }
}