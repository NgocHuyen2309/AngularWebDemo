import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CatalogComponent } from './catalog.component';
import { CatalogItem } from '../../services/catalog.service';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let httpMock: HttpTestingController;

  const mockItems: CatalogItem[] = [
    {
      id: 1,
      name: 'Laptop',
      category: 'Electronics',
      description: 'A powerful laptop',
      price: 999.99,
      imageUrl: 'http://example.com/laptop.jpg'
    },
    {
      id: 2,
      name: 'T-Shirt',
      category: 'Clothing',
      description: 'A comfortable shirt',
      price: 19.99,
      imageUrl: 'http://example.com/shirt.jpg'
    },
    {
      id: 3,
      name: 'Novel',
      category: 'Books',
      description: 'A best-selling novel',
      price: 14.99,
      imageUrl: 'http://example.com/book.jpg'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush(mockItems);
    expect(component).toBeTruthy();
  });

  it('should load and render catalog items', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush(mockItems);
    fixture.detectChanges();

    expect(component.items.length).toBe(3);
    expect(component.filteredItems.length).toBe(3);

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.catalog__item');
    expect(cards.length).toBe(3);
  });

  it('should extract categories from items', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush(mockItems);
    fixture.detectChanges();

    expect(component.categories).toContain('All');
    expect(component.categories).toContain('Electronics');
    expect(component.categories).toContain('Clothing');
    expect(component.categories).toContain('Books');
  });

  it('should filter items by category', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush(mockItems);
    fixture.detectChanges();

    component.filterByCategory('Electronics');
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].name).toBe('Laptop');
  });

  it('should show all items when "All" filter is selected', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush(mockItems);
    fixture.detectChanges();

    component.filterByCategory('Electronics');
    expect(component.filteredItems.length).toBe(1);

    component.filterByCategory('All');
    expect(component.filteredItems.length).toBe(3);
  });

  it('should sort items by price ascending', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush(mockItems);
    fixture.detectChanges();

    component.sortItems('price-asc');
    expect(component.filteredItems[0].name).toBe('Novel');
    expect(component.filteredItems[2].name).toBe('Laptop');
  });
});
