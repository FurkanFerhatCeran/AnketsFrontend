import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  template: `<h3>Sistem Logları</h3>
  <pre style="white-space: pre-wrap">{{ logs | json }}</pre>`,
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.api.get('/api/Admin/logs').subscribe((res: any) => {
      this.logs = res?.data || res || [];
    });
  }
}


