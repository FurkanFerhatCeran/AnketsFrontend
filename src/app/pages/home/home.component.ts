import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userName: string = 'Kullanıcı';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Kullanıcı adını al
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      if (currentUser.nameSurname) {
        this.userName = currentUser.nameSurname;
      } else if (currentUser.username) {
        this.userName = currentUser.username;
      } else if (currentUser.email) {
        // Email'den isim çıkar
        this.userName = this.extractNameFromEmail(currentUser.email);
      }
    }
  }

  selectTemplate(templateType: string): void {
    this.router.navigate(['/dashboard/surveys/create'], { 
      state: { template: templateType } 
    });
  }

  private extractNameFromEmail(email: string): string {
    try {
      const localPart = email.split('@')[0];
      let name = localPart
        .replace(/[._-]/g, ' ')
        .replace(/\d+/g, '')
        .trim();
      
      name = name.split(' ')
        .map(word => this.capitalizeString(word))
        .filter(word => word.length > 0)
        .join(' ');
      
      return name || 'Kullanıcı';
    } catch (error) {
      return 'Kullanıcı';
    }
  }

  private capitalizeString(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}