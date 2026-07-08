import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogService, CatalogItem } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CatalogService
      ]
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch catalog items via GET', () => {
    const mockItems: CatalogItem[] = [
      {
        id: 1,
        name: 'Test Item',
        category: 'Electronics',
        description: 'A test item',
        price: 29.99,
        imageUrl: 'http://example.com/img.jpg'
      },
      {
        id: 2,
        name: 'Another Item',
        category: 'Books',
        description: 'Another test item',
        price: 9.99,
        imageUrl: 'http://example.com/img2.jpg'
      }
    ];

    service.getCatalog().subscribe(items => {
      expect(items.length).toBe(2);
      expect(items).toEqual(mockItems);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/catalog');
    expect(req.request.method).toBe('GET');
    req.flush(mockItems);
  });
});
