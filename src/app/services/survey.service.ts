import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor() { }

  // Bu metot kullanıcının sahip olduğu anket sayısını simüle eder
  getSurveyCount(): Observable<number> {
    // Normalde burada backend'e HTTP isteği yapılır ve sayı çekilir.
    // Şimdilik sabit bir değer döndürelim
    const surveyCount = 5;
    return of(surveyCount);
  }
}
