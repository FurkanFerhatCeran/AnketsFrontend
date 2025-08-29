import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-surveys',
  standalone: true,
  imports: [CommonModule],
  template: `<h3>Tüm Anketler</h3>
  <ul>
    <li *ngFor="let s of surveys">#{{s.surveyId}} - {{s.title}}</li>
  </ul>`,
})
export class AdminSurveysComponent implements OnInit {
  surveys: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.api.get('/api/Admin/surveys').subscribe((res: any) => {
      this.surveys = res?.data || res || [];
    });
  }
}


