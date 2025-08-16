import { CommonModule } from '@angular/common'; // Gerekli modül
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Gerekli modül

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class NotFoundComponent { }
