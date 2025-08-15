import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest, LoginResponse } from '../../../models/auth/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false; // Yeni eklenen loading durumu

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const loginDto: LoginRequest = this.loginForm.value;
      
      this.authService.login(loginDto).subscribe({
        next: (response: LoginResponse) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 0) {
            this.errorMessage = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
          } else if (err.error instanceof ErrorEvent) {
            this.errorMessage = 'Bir hata oluştu: ' + err.error.message;
          } else {
            if (typeof err.error === 'string' && err.error.startsWith('<!DOCTYPE')) {
              this.errorMessage = 'API yanıtı JSON yerine HTML döndürüyor. Backend ayarlarını kontrol edin.';
            } else {
              this.errorMessage = err.error?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
            }
          }
        }
      });
    }
  }
}