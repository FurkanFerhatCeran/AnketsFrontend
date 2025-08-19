import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js'; // dist/zone kısmını kaldırın
import { App } from './app/app';
import { appConfig } from './app/app.config';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
