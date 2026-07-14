import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CatalogService, CatalogItem } from '../../services/catalog.service';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  items: CatalogItem[] = [];
  filteredItems: CatalogItem[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  sortBy = 'name';

  sortOptions: SortOption[] = [
    { label: 'Sort by Name (A-Z)', value: 'name' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Category', value: 'category' }
  ];

  constructor(private catalogService: CatalogService) { }

  ngOnInit() {
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

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFiltersAndSort();
  }

  sortItems(sortBy: string) {
    this.sortBy = sortBy;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
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
