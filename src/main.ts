import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js'; // dist/zone kısmını kaldırın
import { App } from './app/app';
import { appConfig } from './app/app.config';


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
