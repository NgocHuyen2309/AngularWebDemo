import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { routes } from './app.routes';

export function emailDomainValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|enterprise\.com|.*\.vn|.*\.edu|.*\.edu\.vn)$/i;
  return emailRegex.test(control.value.trim()) ? null : { emailDomain: true };
}

export function ageValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const dob = new Date(control.value);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 16 ? null : { ageGate: true };
}

export function emailDomainValidationMessage(error: any, field: any) {
  return 'Email address must strictly end with @gmail.com (e.g., yourname@gmail.com)';
}

export function ageValidationMessage(error: any, field: any) {
  return 'User must be at least 16 years old to register';
}

export function requiredValidationMessage(error: any, field: any) {
  return 'This field is required';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-theme="dark"]'
        }
      }
    }),
    importProvidersFrom(
      FormlyModule.forRoot({
        validators: [
          { name: 'emailDomain', validation: emailDomainValidator },
          { name: 'ageGate', validation: ageValidator }
        ],
        validationMessages: [
          { name: 'required', message: requiredValidationMessage },
          { name: 'emailDomain', message: emailDomainValidationMessage },
          { name: 'ageGate', message: ageValidationMessage }
        ]
      }),
      FormlyBootstrapModule
    )
  ]
};
