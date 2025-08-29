import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">Admin</div>
      <nav class="menu">
        <a routerLink="surveys" routerLinkActive="active" class="menu-item">
          <span class="icon">📋</span>
          <span class="label">Tüm Anketler</span>
        </a>
        <a routerLink="logs" routerLinkActive="active" class="menu-item">
          <span class="icon">🧾</span>
          <span class="label">Loglar</span>
        </a>
      </nav>
    </aside>

    <main class="content">
      <header class="header">
        <h2>Admin Paneli</h2>
        <p class="subtitle">Sadece yöneticilerin erişebildiği yönetim alanı</p>
      </header>
      <section class="page">
        <router-outlet></router-outlet>
      </section>
    </main>
  </div>
  `,
  styles: [`
    .admin-layout{display:flex;min-height:calc(100vh - 64px);background:#f5f7fb;color:#2d3748}
    .sidebar{width:240px;background:linear-gradient(180deg,#3b82f6 0%,#6d28d9 100%);color:#fff;padding:20px 14px}
    .brand{font-weight:700;font-size:20px;margin-bottom:18px}
    .menu{display:flex;flex-direction:column;gap:8px}
    .menu-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;color:#fff;text-decoration:none;opacity:.9}
    .menu-item:hover{background:rgba(255,255,255,.15);opacity:1}
    .menu-item.active{background:rgba(255,255,255,.25)}
    .icon{width:18px}
    .content{flex:1;padding:24px}
    .header{margin-bottom:16px}
    .subtitle{margin:4px 0 0 0;color:#6b7280;font-size:14px}
    .page{background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(28,35,90,.08);padding:20px}
    @media (max-width: 900px){.sidebar{width:200px}}
  `]
})
export class AdminComponent {}


