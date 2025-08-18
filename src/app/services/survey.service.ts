// src/app/core/services/survey.service.ts
// Anketlerle ilgili mock verileri sağlayan servis
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(private apiService: ApiService) { }

  // 🔥 Gerçek API kullanarak anket sayısını al
  getSurveyCount(): Observable<number> {
    return this.apiService.getSurveys().pipe(
      map(response => {
        // Response yapısına göre anket sayısını döndür
        if (Array.isArray(response)) {
          return response.length;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data.length;
        } else if (response?.surveys && Array.isArray(response.surveys)) {
          return response.surveys.length;
        }
        return 0;
      })
    );
  }

  // 🔥 Tüm anketleri getir
  getAllSurveys(): Observable<any> {
    return this.apiService.getSurveys();
  }

  // 🔥 Anket detayını getir
  getSurveyById(id: number): Observable<any> {
    return this.apiService.getSurveyById(id);
  }

  // 🔥 Yeni anket oluştur
  createSurvey(surveyData: any): Observable<any> {
    return this.apiService.createSurvey(surveyData);
  }

  // 🔥 Anket güncelle
  updateSurvey(id: number, surveyData: any): Observable<any> {
    return this.apiService.updateSurvey(id, surveyData);
  }

  // 🔥 Anket sil
  deleteSurvey(id: number): Observable<any> {
    return this.apiService.deleteSurvey(id);
  }

  // 🔥 Anket kategorilerini getir
  getSurveyCategories(): Observable<any> {
    return this.apiService.getSurveyCategories();
  }

  // 🔥 Yeni kategori oluştur
  createSurveyCategory(categoryData: any): Observable<any> {
    return this.apiService.createSurveyCategory(categoryData);
  }

  // 🔥 Kategori güncelle
  updateSurveyCategory(id: number, categoryData: any): Observable<any> {
    return this.apiService.updateSurveyCategory(id, categoryData);
  }

  // 🔥 Kategori sil
  deleteSurveyCategory(id: number): Observable<any> {
    return this.apiService.deleteSurveyCategory(id);
  }

  // 🔥 Excel'den kategori import et
  importCategoriesFromExcel(file: File): Observable<any> {
    return this.apiService.importSurveyCategoriesFromExcel(file);
  }
}
