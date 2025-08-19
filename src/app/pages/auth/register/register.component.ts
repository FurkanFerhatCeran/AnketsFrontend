// src/app/pages/auth/register/register.component.ts

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterRequest, RegisterResponse } from '../../../models/auth/auth.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nameSurname: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.shakeForm();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerDto: RegisterRequest = this.registerForm.value;

    // 🔥 Gerçek API Çağrısı
    this.authService.register(registerDto).subscribe({
      next: (response: RegisterResponse) => {
        console.log('✅ Kayıt başarılı:', response);
        this.handleRegisterSuccess(response);
      },
      error: (err: any) => {
        console.error('❌ Kayıt hatası:', err);
        this.handleRegisterError(err);
      }
    });
  }

  private handleRegisterSuccess(response: RegisterResponse): void {
    this.isLoading = false;
    this.showSuccessAnimation();

    setTimeout(() => {
      // Yönlendirme, kayıt sonrası genellikle giriş sayfasına yönlendirilir
      this.router.navigate(['/login']);
    }, 800);
  }

  private handleRegisterError(err: any): void {
    this.isLoading = false;
    console.error('🚫 Hata detayları:', err);

    if (err instanceof Error) {
      this.errorMessage = this.translateErrorMessage(err.message);
    } else if (err?.error?.message) {
      this.errorMessage = this.translateErrorMessage(err.error.message);
    } else if (typeof err === 'string') {
      this.errorMessage = this.translateErrorMessage(err);
    } else {
      this.errorMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }

    this.shakeForm();
  }

  private translateErrorMessage(message: string): string {
    const errorMap: {[key: string]: string} = {
      // Backend'den gelen olası hata mesajları
      'Email already in use': 'Bu email adresi zaten kullanılıyor. Lütfen farklı bir email adresi deneyin.',
      'Username already taken': 'Bu kullanıcı adı zaten alınmış. Lütfen farklı bir kullanıcı adı deneyin.',
      'Registration failed': 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.',
      'Network error': 'Ağ bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      
      // HTTP durum kodları
      '400': 'Hatalı istek. Lütfen bilgilerinizi kontrol edin.',
      '409': 'Bu email adresi veya kullanıcı adı zaten kullanılıyor.',
      '500': 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
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

  socialRegister(provider: string): void {
    console.log(`🔗 ${provider} ile kayıt yapılıyor...`);
    // TODO: Social register implementasyonu
    // this.authService.socialRegister(provider).subscribe(...);
    alert(`${provider} ile kayıt özelliği yakında eklenecek.`);
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
          <span>Kayıt Başarılı!</span>
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