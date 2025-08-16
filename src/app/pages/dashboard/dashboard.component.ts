import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // OnInit ekledik
import { Router, RouterModule } from '@angular/router';
import { LogoutRequest } from '../../models/auth/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit { // OnInit implemente ettik
  currentUser: any; // Başlangıçta tanımla, değeri ngOnInit'de ata

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserData(); // ✅ Artık güvenle kullanabiliriz
  }

  logout(): void {
    const refreshToken = this.authService.getRefreshToken(); 
    if (!refreshToken) {
      this.authService.clearAuthData();
      this.router.navigate(['/login']);
      return;
    }

    const logoutRequest: LogoutRequest = {
      refreshToken: refreshToken,
      logoutFromAllDevices: false
    };

    this.authService.logout(logoutRequest).subscribe({
      next: (response) => {
        console.log('Logout successful:', response.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  // Not: AuthService'de zaten getRefreshToken() var, bu fonksiyonu silebilirsin
  // private getRefreshToken(): string | null {
  //   return this.authService.getRefreshToken(); // AuthService'deki metodu kullan
  // }
}