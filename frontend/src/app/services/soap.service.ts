import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoapService {
  private readonly apiUrl = 'http://localhost:3000/api/soap/info';

  constructor(private http: HttpClient) {}

  getProjectInfo(): Observable<string> {
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <GetProjectInfo xmlns="http://example.com/project"/>
  </soap:Body>
</soap:Envelope>`;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8'
    });

    return this.http.post(this.apiUrl, soapEnvelope, {
      headers,
      responseType: 'text'
    });
  }
}
