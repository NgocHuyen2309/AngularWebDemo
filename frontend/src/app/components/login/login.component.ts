import { Component, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule, ButtonModule, UserFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  destroy$ = new Subject<void>();
  activeTab: 'login' | 'register' = 'login';
  errorMessage = '';
  loading = false;

  loginForm = new FormGroup({});
  loginModel = {
    identifier: '',
    password: ''
  };

  loginFields: FormlyFieldConfig[] = [
    {
      key: 'identifier',
      type: 'input',
      props: {
        label: 'Username or Email',
        placeholder: 'Enter username or email (e.g. admin@enterprise.com)',
        required: true,
      }
    },
    {
      key: 'password',
      type: 'input',
      props: {
        type: 'password',
        label: 'Password',
        placeholder: 'Enter your secure password',
        required: true,
      }
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (!this.loginModel.identifier || !this.loginModel.password) {
      this.errorMessage = 'Please enter both username/email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginModel.identifier, this.loginModel.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
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

  onRegistrationSuccess() {
    this.activeTab = 'login';
  }
}
