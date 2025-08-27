import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SurveyTemplate, SurveyTemplateService } from '../../../services/survey-template.service';

@Component({
  selector: 'app-survey-template-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-template-selector.component.html',
  styleUrls: ['./survey-template-selector.component.scss']
})
export class SurveyTemplateSelectorComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<SurveyTemplate>();
  @Output() createBlank = new EventEmitter<void>();

  templates: SurveyTemplate[] = [];
  filteredTemplates: SurveyTemplate[] = [];
  categories: string[] = [];
  selectedCategory: string = 'Tümü';
  searchTerm: string = '';
  isLoading = false;

  constructor(private templateService: SurveyTemplateService) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadCategories();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.templateService.getAllTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.filteredTemplates = templates;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.templateService.getCategories().subscribe({
      next: (categories) => {
        this.categories = ['Tümü', ...categories];
      }
    });
  }

  onCategoryChange(): void {
    this.filterTemplates();
  }

  onSearchChange(): void {
    this.filterTemplates();
  }

  private filterTemplates(): void {
    let filtered = this.templates;

    // Kategori filtresi
    if (this.selectedCategory !== 'Tümü') {
      filtered = filtered.filter(t => t.category === this.selectedCategory);
    }

    // Arama filtresi
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredTemplates = filtered;
  }

  selectTemplate(template: SurveyTemplate): void {
    this.templateSelected.emit(template);
  }

  createBlankSurvey(): void {
    this.createBlank.emit();
  }
}
