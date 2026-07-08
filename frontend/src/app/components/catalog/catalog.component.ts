import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService, CatalogItem } from '../../services/catalog.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.less'
})
export class CatalogComponent implements OnInit {
  items: CatalogItem[] = [];
  filteredItems: CatalogItem[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  sortBy = 'name';

  constructor(private catalogService: CatalogService) {}

  ngOnInit(): void {
    this.catalogService.getCatalog().subscribe({
      next: (data) => {
        this.items = data;
        this.categories = ['All', ...new Set(data.map(item => item.category))];
        this.applyFiltersAndSort();
      },
      error: (err) => {
        console.error('Failed to load catalog:', err);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFiltersAndSort();
  }

  sortItems(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let result = this.selectedCategory === 'All'
      ? [...this.items]
      : this.items.filter(item => item.category === this.selectedCategory);

    switch (this.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    this.filteredItems = result;
  }
}
