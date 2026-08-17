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
    fixture.detectChanges(); //Kích hoạt lifecycle ban đầu, gọi this.catalogService.getCatalog().subscribe(...) để tạo ra một HTTP Request gọi API lấy dữ liệu
    const req = httpMock.expectOne('http://localhost:3000/api/catalog'); //Request đã được gửi đi nhưng chưa có kết quả trả về.
    req.flush(mockItems); //Giả lập server trả về dữ liệu mockItems, từ mảng rỗng sang mảng 3 phần tử sẽ KHÔNG tự động cập nhật ra giao diện (DOM).
    fixture.detectChanges(); //LẦN 2: Cập nhật giao diện (DOM) với dữ liệu mới
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle API error gracefully', () => {
    // Test requires fresh fixture that hasn't flushed yet
    // Re-create to simulate error path
    const errorFixture = TestBed.createComponent(CatalogComponent);
    const errorComponent = errorFixture.componentInstance;
    errorFixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    req.flush({ message: 'Error message from API' }, { status: 500, statusText: 'Server Error' });
    expect(errorComponent.errorMessage).toBe('Error message from API');
  });

  it('should load and render 3 catalog items', () => {
    expect(component.items.length).toBe(3);
    expect(component.filteredItems.length).toBe(3);
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.catalog__item');
    expect(cards.length).toBe(3);
  });

  it('should extract all categories including "All" from items', () => {
    expect(component.categories).toContain('All');
    expect(component.categories).toContain('Electronics');
    expect(component.categories).toContain('Clothing');
    expect(component.categories).toContain('Books');
  });

  it('should filter to only Electronics items when Electronics category is selected', () => {
    component.filterByCategory('Electronics');
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].name).toBe('Laptop');
  });

  it('should show all items when "All" filter is selected after filtering', () => {
    component.filterByCategory('Electronics');
    expect(component.filteredItems.length).toBe(1);
    component.filterByCategory('All');
    expect(component.filteredItems.length).toBe(3);
  });

  it('should sort items by price ascending (cheapest first)', () => {
    component.sortItems('price-asc');
    expect(component.filteredItems[0].name).toBe('Novel');
    expect(component.filteredItems[2].name).toBe('Laptop');
  });

  it('should sort items by price descending (most expensive first)', () => {
    component.sortItems('price-desc');
    expect(component.filteredItems[0].name).toBe('Laptop');
    expect(component.filteredItems[2].name).toBe('Novel');
  });

  it('should sort items alphabetically by name', () => {
    component.sortItems('name');
    expect(component.filteredItems[0].name).toBe('Laptop');
    expect(component.filteredItems[1].name).toBe('Novel');
    expect(component.filteredItems[2].name).toBe('T-Shirt');
  });

  it('should sort items alphabetically by category', () => {
    component.sortItems('category');
    expect(component.filteredItems[0].category).toBe('Books');
    expect(component.filteredItems[1].category).toBe('Clothing');
    expect(component.filteredItems[2].category).toBe('Electronics');
  });
});
