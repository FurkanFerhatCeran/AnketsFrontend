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
        this.handleLoginSuccess(response);
      },
      error: (err) => {
        this.handleLoginError(err);
      }
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.isLoading = false;
    this.router.navigate(['/dashboard']);
  }

  private handleLoginError(err: any): void {
    this.isLoading = false;
    
    if (err instanceof Error) {
      this.errorMessage = this.translateErrorMessage(err.message);
    } else {
      this.errorMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  private translateErrorMessage(message: string): string {
    const errorMap: {[key: string]: string} = {
      'Login failed': 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
      'Server unavailable - Please check your connection': 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.',
      'Unauthorized - Please login again': 'Yetkiniz yok. Lütfen tekrar giriş yapın.',
      'Forbidden - Insufficient permissions': 'Bu işlem için yetkiniz yok.'
    };

    return errorMap[message] || message;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}