import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormlyModule, ButtonModule, UserFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  errorMessage = '';
  loading = false;

  loginModel = {
    identifier: '',
    password: ''
  };

  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLoginSubmit(): void {
    if (!this.loginModel.identifier || !this.loginModel.password) {
      this.errorMessage = 'Please enter both username/email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginModel.identifier, this.loginModel.password).subscribe({
      next: (user) => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Login failed. Invalid email or password.';
      }
    });
  }

  onRegistrationSuccess(): void {
    this.activeTab = 'login';
  }
}
