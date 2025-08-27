import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question, Survey } from '../models/survey/survey.model';

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  questions: Omit<Question, 'questionId' | 'surveyId' | 'createdAt' | 'updatedAt'>[];
}

@Injectable({
  providedIn: 'root'
})
export class SurveyTemplateService {

  private templates: SurveyTemplate[] = [
    // 📋 İNSAN KAYNAKLARI ANKET TEMPLATE'LARI
    {
      id: 'employee_satisfaction',
      name: 'Çalışan Memnuniyet Anketi',
      description: 'Çalışanların iş memnuniyetini ve şirket kültürünü değerlendirmek için kapsamlı anket.',
      category: 'İnsan Kaynakları',
      icon: '👥',
      questions: [
        {
          questionTitle: 'Mevcut iş pozisyonunuzdan ne kadar memnunsunuz?',
          questionDescription: 'Genel iş memnuniyetinizi değerlendirin.',
          questionTypeId: 3, // Tekil seçim
          isRequired: true,
          options: [
            { optionText: 'Çok memnunum', optionValue: '5', sortOrder: 1 },
            { optionText: 'Memnunum', optionValue: '4', sortOrder: 2 },
            { optionText: 'Kararsızım', optionValue: '3', sortOrder: 3 },
            { optionText: 'Memnun değilim', optionValue: '2', sortOrder: 4 },
            { optionText: 'Hiç memnun değilim', optionValue: '1', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Hangi konularda gelişim fırsatı istiyorsunuz?',
          questionDescription: 'Birden fazla seçenek işaretleyebilirsiniz.',
          questionTypeId: 4, // Çoklu seçim
          isRequired: false,
          options: [
            { optionText: 'Teknik beceriler', optionValue: 'technical', sortOrder: 1 },
            { optionText: 'Liderlik becerileri', optionValue: 'leadership', sortOrder: 2 },
            { optionText: 'İletişim becerileri', optionValue: 'communication', sortOrder: 3 },
            { optionText: 'Proje yönetimi', optionValue: 'project_management', sortOrder: 4 },
            { optionText: 'Yaratıcılık ve inovasyon', optionValue: 'creativity', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Şirket kültürü hakkında düşüncelerinizi paylaşır mısınız?',
          questionDescription: 'Açık ve dürüst geri bildirimleriniz bizim için değerlidir.',
          questionTypeId: 2, // Uzun metin
          isRequired: false
        },
        {
          questionTitle: 'Yöneticinizin performansını nasıl değerlendiriyorsunuz?',
          questionDescription: '1-10 arası puan veriniz (1: Çok kötü, 10: Mükemmel)',
          questionTypeId: 10, // Rating/Puanlama
          isRequired: true
        }
      ]
    },

    {
      id: 'recruitment_feedback',
      name: 'İşe Alım Süreç Değerlendirmesi',
      description: 'İşe alım sürecinin kalitesini değerlendirmek için aday geri bildirim anketi.',
      category: 'İnsan Kaynakları',
      icon: '🎯',
      questions: [
        {
          questionTitle: 'İşe alım sürecinin hangi aşamasındasınız?',
          questionTypeId: 5, // Dropdown
          isRequired: true,
          options: [
            { optionText: 'CV inceleme', optionValue: 'cv_review', sortOrder: 1 },
            { optionText: 'Telefon görüşmesi', optionValue: 'phone_interview', sortOrder: 2 },
            { optionText: 'Teknik mülakat', optionValue: 'technical_interview', sortOrder: 3 },
            { optionText: 'HR mülakatı', optionValue: 'hr_interview', sortOrder: 4 },
            { optionText: 'Final mülakatı', optionValue: 'final_interview', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Mülakat sürecinde yaşadığınız deneyimi nasıl değerlendiriyorsunuz?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Mükemmel', optionValue: '5', sortOrder: 1 },
            { optionText: 'İyi', optionValue: '4', sortOrder: 2 },
            { optionText: 'Orta', optionValue: '3', sortOrder: 3 },
            { optionText: 'Kötü', optionValue: '2', sortOrder: 4 },
            { optionText: 'Çok kötü', optionValue: '1', sortOrder: 5 }
          ]
        }
      ]
    },

    // 🛍️ MÜŞTERİ MEMNUNİYETİ TEMPLATE'LARI
    {
      id: 'customer_satisfaction',
      name: 'Müşteri Memnuniyet Anketi',
      description: 'Müşteri deneyimini ölçmek ve hizmet kalitesini değerlendirmek için.',
      category: 'Müşteri Hizmetleri',
      icon: '⭐',
      questions: [
        {
          questionTitle: 'Ürün/hizmetimizden genel memnuniyetinizi nasıl değerlendiriyorsunuz?',
          questionTypeId: 10, // Rating
          isRequired: true
        },
        {
          questionTitle: 'Bizi arkadaşlarınıza tavsiye etme olasılığınız nedir?',
          questionDescription: 'Net Promoter Score (NPS) - 0: Kesinlikle tavsiye etmem, 10: Kesinlikle tavsiye ederim',
          questionTypeId: 10,
          isRequired: true
        },
        {
          questionTitle: 'Hangi konularda gelişim görmek istiyorsunuz?',
          questionTypeId: 4, // Çoklu seçim
          isRequired: false,
          options: [
            { optionText: 'Ürün kalitesi', optionValue: 'product_quality', sortOrder: 1 },
            { optionText: 'Müşteri hizmetleri', optionValue: 'customer_service', sortOrder: 2 },
            { optionText: 'Teslimat hızı', optionValue: 'delivery_speed', sortOrder: 3 },
            { optionText: 'Fiyat politikası', optionValue: 'pricing', sortOrder: 4 },
            { optionText: 'Web sitesi kullanılabilirliği', optionValue: 'website_usability', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Ek yorumlarınız varsa paylaşabilir misiniz?',
          questionTypeId: 2, // Uzun metin
          isRequired: false
        }
      ]
    },

    // 🎓 EĞİTİM VE KURS DEĞERLENDİRME TEMPLATE'LARI
    {
      id: 'course_evaluation',
      name: 'Kurs Değerlendirme Anketi',
      description: 'Eğitim programlarının etkinliğini ölçmek ve geliştirmek için.',
      category: 'Eğitim',
      icon: '📚',
      questions: [
        {
          questionTitle: 'Kursa katılım amacınız neydi?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Mesleki gelişim', optionValue: 'professional', sortOrder: 1 },
            { optionText: 'Kişisel ilgi', optionValue: 'personal', sortOrder: 2 },
            { optionText: 'Zorunlu eğitim', optionValue: 'mandatory', sortOrder: 3 },
            { optionText: 'Kariyer değişikliği', optionValue: 'career_change', sortOrder: 4 }
          ]
        },
        {
          questionTitle: 'Kurs içeriğinin kalitesini nasıl değerlendiriyorsunuz?',
          questionTypeId: 10,
          isRequired: true
        },
        {
          questionTitle: 'Eğitmenin performansını değerlendiriniz',
          questionTypeId: 10,
          isRequired: true
        },
        {
          questionTitle: 'Öğrendiklerinizi iş hayatınızda uygulayabilecek misiniz?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Kesinlikle evet', optionValue: 'definitely_yes', sortOrder: 1 },
            { optionText: 'Muhtemelen evet', optionValue: 'probably_yes', sortOrder: 2 },
            { optionText: 'Kararsızım', optionValue: 'unsure', sortOrder: 3 },
            { optionText: 'Muhtemelen hayır', optionValue: 'probably_no', sortOrder: 4 },
            { optionText: 'Kesinlikle hayır', optionValue: 'definitely_no', sortOrder: 5 }
          ]
        }
      ]
    },

    // 🏥 SAĞLIK VE WELLNESS TEMPLATE'LARI
    {
      id: 'health_wellness',
      name: 'Sağlık ve Wellness Anketi',
      description: 'Çalışan sağlığı ve refah durumunu değerlendirmek için.',
      category: 'Sağlık',
      icon: '🏥',
      questions: [
        {
          questionTitle: 'Genel sağlık durumunuzu nasıl değerlendiriyorsunuz?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Mükemmel', optionValue: 'excellent', sortOrder: 1 },
            { optionText: 'Çok iyi', optionValue: 'very_good', sortOrder: 2 },
            { optionText: 'İyi', optionValue: 'good', sortOrder: 3 },
            { optionText: 'Orta', optionValue: 'fair', sortOrder: 4 },
            { optionText: 'Kötü', optionValue: 'poor', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Haftada kaç gün egzersiz yapıyorsunuz?',
          questionTypeId: 5,
          isRequired: true,
          options: [
            { optionText: 'Hiç', optionValue: '0', sortOrder: 1 },
            { optionText: '1-2 gün', optionValue: '1-2', sortOrder: 2 },
            { optionText: '3-4 gün', optionValue: '3-4', sortOrder: 3 },
            { optionText: '5-6 gün', optionValue: '5-6', sortOrder: 4 },
            { optionText: 'Her gün', optionValue: '7', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'İş yerinde hangi wellness programlarına ilgi duyarsınız?',
          questionTypeId: 4,
          isRequired: false,
          options: [
            { optionText: 'Yoga dersleri', optionValue: 'yoga', sortOrder: 1 },
            { optionText: 'Fitness salonu', optionValue: 'gym', sortOrder: 2 },
            { optionText: 'Sağlıklı beslenme seminerleri', optionValue: 'nutrition', sortOrder: 3 },
            { optionText: 'Stres yönetimi eğitimleri', optionValue: 'stress_management', sortOrder: 4 },
            { optionText: 'Mental sağlık desteği', optionValue: 'mental_health', sortOrder: 5 }
          ]
        }
      ]
    },

    // 🎪 ETKİNLİK DEĞERLENDİRME TEMPLATE'LARI
    {
      id: 'event_feedback',
      name: 'Etkinlik Değerlendirme Anketi',
      description: 'Konferans, workshop ve etkinliklerin başarısını ölçmek için.',
      category: 'Etkinlik',
      icon: '🎪',
      questions: [
        {
          questionTitle: 'Etkinliğe nasıl katıldınız?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Yüz yüze', optionValue: 'in_person', sortOrder: 1 },
            { optionText: 'Online', optionValue: 'online', sortOrder: 2 },
            { optionText: 'Hibrit (Hem yüz yüze hem online)', optionValue: 'hybrid', sortOrder: 3 }
          ]
        },
        {
          questionTitle: 'Etkinliğin genel organizasyonunu nasıl değerlendiriyorsunuz?',
          questionTypeId: 10,
          isRequired: true
        },
        {
          questionTitle: 'En beğendiğiniz sunum/oturum hangisiydi?',
          questionTypeId: 1, // Kısa metin
          isRequired: false
        },
        {
          questionTitle: 'Gelecekte hangi konularda etkinlik görmek istersiniz?',
          questionTypeId: 2, // Uzun metin
          isRequired: false
        },
        {
          questionTitle: 'Bu etkinliği başkalarına tavsiye eder misiniz?',
          questionTypeId: 9, // Evet/Hayır
          isRequired: true
        }
      ]
    },

    // 🛒 E-TİCARET VE ÜRÜN TEMPLATE'LARI
    {
      id: 'product_feedback',
      name: 'Ürün Geri Bildirim Anketi',
      description: 'Ürün geliştirme ve kullanıcı deneyimi için kapsamlı değerlendirme.',
      category: 'Ürün Geliştirme',
      icon: '🛒',
      questions: [
        {
          questionTitle: 'Ürünü ne sıklıkla kullanıyorsunuz?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Günlük', optionValue: 'daily', sortOrder: 1 },
            { optionText: 'Haftalık', optionValue: 'weekly', sortOrder: 2 },
            { optionText: 'Aylık', optionValue: 'monthly', sortOrder: 3 },
            { optionText: 'Nadiren', optionValue: 'rarely', sortOrder: 4 },
            { optionText: 'İlk kez kullanıyorum', optionValue: 'first_time', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Ürünün hangi özelliklerini en çok kullanıyorsunuz?',
          questionTypeId: 4,
          isRequired: false,
          options: [
            { optionText: 'Ana özellik', optionValue: 'main_feature', sortOrder: 1 },
            { optionText: 'Raporlama', optionValue: 'reporting', sortOrder: 2 },
            { optionText: 'Entegrasyonlar', optionValue: 'integrations', sortOrder: 3 },
            { optionText: 'Mobil uygulama', optionValue: 'mobile_app', sortOrder: 4 },
            { optionText: 'Destek sistemi', optionValue: 'support', sortOrder: 5 }
          ]
        },
        {
          questionTitle: 'Ürünün kullanım kolaylığını değerlendiriniz',
          questionTypeId: 10,
          isRequired: true
        },
        {
          questionTitle: 'Hangi yeni özellikler eklenmesini istersiniz?',
          questionTypeId: 2,
          isRequired: false
        }
      ]
    },

    // 🎨 MARKA VE İMAJ TEMPLATE'LARI
    {
      id: 'brand_perception',
      name: 'Marka Algısı Araştırması',
      description: 'Marka bilinirliği ve müşteri algısını ölçmek için.',
      category: 'Pazarlama',
      icon: '🎨',
      questions: [
        {
          questionTitle: 'Markamızı nereden duydunuz?',
          questionTypeId: 4,
          isRequired: true,
          options: [
            { optionText: 'Sosyal medya', optionValue: 'social_media', sortOrder: 1 },
            { optionText: 'Google arama', optionValue: 'google_search', sortOrder: 2 },
            { optionText: 'Arkadaş tavsiyesi', optionValue: 'word_of_mouth', sortOrder: 3 },
            { optionText: 'Televizyon reklamı', optionValue: 'tv_ad', sortOrder: 4 },
            { optionText: 'Dergi/gazete', optionValue: 'print_media', sortOrder: 5 },
            { optionText: 'Etkinlik/fuar', optionValue: 'event', sortOrder: 6 }
          ]
        },
        {
          questionTitle: 'Markamızı hangi kelimelerle tanımlarsınız?',
          questionTypeId: 4,
          isRequired: false,
          options: [
            { optionText: 'Güvenilir', optionValue: 'reliable', sortOrder: 1 },
            { optionText: 'İnovatif', optionValue: 'innovative', sortOrder: 2 },
            { optionText: 'Kaliteli', optionValue: 'quality', sortOrder: 3 },
            { optionText: 'Uygun fiyatlı', optionValue: 'affordable', sortOrder: 4 },
            { optionText: 'Modern', optionValue: 'modern', sortOrder: 5 },
            { optionText: 'Müşteri odaklı', optionValue: 'customer_focused', sortOrder: 6 }
          ]
        },
        {
          questionTitle: 'Rakip markalarla karşılaştırıldığında konumumuzu nasıl görüyorsunuz?',
          questionTypeId: 3,
          isRequired: true,
          options: [
            { optionText: 'Çok daha iyi', optionValue: 'much_better', sortOrder: 1 },
            { optionText: 'Daha iyi', optionValue: 'better', sortOrder: 2 },
            { optionText: 'Aynı seviyede', optionValue: 'same', sortOrder: 3 },
            { optionText: 'Daha kötü', optionValue: 'worse', sortOrder: 4 },
            { optionText: 'Çok daha kötü', optionValue: 'much_worse', sortOrder: 5 }
          ]
        }
      ]
    }
  ];

  constructor() { }

  // Tüm template'ları getir
  getAllTemplates(): Observable<SurveyTemplate[]> {
    return of(this.templates);
  }

  // Kategoriye göre template'ları getir
  getTemplatesByCategory(category: string): Observable<SurveyTemplate[]> {
    const filteredTemplates = this.templates.filter(template => 
      template.category.toLowerCase() === category.toLowerCase()
    );
    return of(filteredTemplates);
  }

  // Template ID'sine göre getir
  getTemplateById(id: string): Observable<SurveyTemplate | undefined> {
    const template = this.templates.find(t => t.id === id);
    return of(template);
  }

  // Kategorileri getir
  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.templates.map(t => t.category))];
    return of(categories);
  }

  // Template'dan anket oluştur
  createSurveyFromTemplate(templateId: string, customTitle?: string, customDescription?: string): Observable<Partial<Survey> | null> {
    const template = this.templates.find(t => t.id === templateId);
    
    if (!template) {
      return of(null);
    }

    const survey: Partial<Survey> = {
      title: customTitle || template.name,
      description: customDescription || template.description,
      questions: template.questions.map((q, index) => ({
        ...q,
        questionId: 0, // Backend tarafından atanacak
        surveyId: 0, // Backend tarafından atanacak
        createdAt: new Date(),
        options: q.options?.map((opt, optIndex) => ({
          ...opt,
          optionId: optIndex + 1,
          sortOrder: opt.sortOrder || optIndex + 1
        }))
      })),
      isActive: true
    };

    return of(survey);
  }

  // Popüler template'ları getir (en çok kullanılanlar)
  getPopularTemplates(): Observable<SurveyTemplate[]> {
    // İlk 4 template'ı popüler olarak döndürelim
    return of(this.templates.slice(0, 4));
  }

  // Template'ları arama
  searchTemplates(searchTerm: string): Observable<SurveyTemplate[]> {
    const filtered = this.templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered);
  }
}
