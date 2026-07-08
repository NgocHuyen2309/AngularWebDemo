import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoapService } from '../../services/soap.service';

@Component({
  selector: 'app-soap-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soap-info.component.html',
  styleUrl: './soap-info.component.less'
})
export class SoapInfoComponent {
  soapResponse = '';
  loading = false;
  error = '';

  constructor(private soapService: SoapService) {}

  fetchSoapInfo(): void {
    this.loading = true;
    this.error = '';
    this.soapResponse = '';

    this.soapService.getProjectInfo().subscribe({
      next: (response) => {
        this.soapResponse = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch SOAP info. Please try again.';
        this.loading = false;
      }
    });
  }
}
