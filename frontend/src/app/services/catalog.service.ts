import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CatalogItem {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly apiUrl = 'http://localhost:3000/api/catalog';

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(this.apiUrl);
  }
}
