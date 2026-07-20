import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/catalog`;

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(this.apiUrl);
  }
}
