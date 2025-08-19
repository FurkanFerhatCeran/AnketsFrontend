// src/app/pages/auth/forgot-password/forgot-password.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      this.shakeForm();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;
    
    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        console.log('✅ Şifre sıfırlama talebi gönderildi:', response);
        this.handleSuccess(response);
      },
      error: (err: any) => {
        console.error('❌ Şifre sıfırlama hatası:', err);
        this.handleError(err);
      }
    });
  }
  
  private handleSuccess(response: any): void {
    this.isLoading = false;
    this.successMessage = 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.';
    this.forgotPasswordForm.reset();
  }

  private handleError(err: any): void {
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
      'Email not found': 'Bu email adresi ile kayıtlı bir hesap bulunamadı.',
      'Forgot password failed': 'Şifre sıfırlama işlemi başarısız. Lütfen tekrar deneyin.',
      'Network error': 'Ağ bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      '404': 'Bu email adresi ile kayıtlı bir hesap bulunamadı.',
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
