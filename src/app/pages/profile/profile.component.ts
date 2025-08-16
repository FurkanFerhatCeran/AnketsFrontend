import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-container">
      <h2>Profil Bilgilerim</h2>
      <!-- Profil içeriği buraya gelecek -->
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
    }
  `]
})
export class ProfileComponent {}