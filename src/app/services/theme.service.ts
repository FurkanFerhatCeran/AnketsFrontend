// src/app/services/theme.service.ts

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadTheme();
    }
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    if (this.isBrowser) {
      try {
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      } catch {}
      this.applyTheme();
    }
  }

  private loadTheme(): void {
    if (!this.isBrowser) { return; }
    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem('theme');
    } catch {}
    const isDark = savedTheme === 'dark';
    this.isDarkTheme.next(isDark);
    this.applyTheme();
  }

  private applyTheme(): void {
    if (!this.isBrowser) { return; }
    if (this.isDarkTheme.value) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}