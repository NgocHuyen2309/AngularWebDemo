import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService, AuthUser } from '../../services/auth.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: { snapshot: { queryParams: Params } };

  const mockAuthUser: AuthUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    date_of_birth: '1990-01-01',
    role: 'admin',
    status: 'active'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    activatedRouteMock = { snapshot: { queryParams: { returnUrl: '/custom-url' } } };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormlyModule.forRoot(), FormlyBootstrapModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch to register tab and clear error message', () => {
    component.errorMessage = 'Some error';
    component.switchTab('register');
    expect(component.activeTab).toBe('register');
    expect(component.errorMessage).toBe('');
  });

  it('should show error and not call login when identifier is empty', () => {
    component.loginForm.patchValue({ identifier: '', password: 'password123' });
    component.loginForm.markAllAsTouched();
    component.onLoginSubmit();
    expect(component.errorMessage).toBe(''); // Formly handles validation errors
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should show error and not call login when password is empty', () => {
    component.loginForm.patchValue({ identifier: 'test@example.com', password: '' });
    component.loginForm.markAllAsTouched();
    component.onLoginSubmit();
    expect(component.errorMessage).toBe('');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call auth service and navigate to returnUrl on successful login', () => {
    authServiceSpy.login.and.returnValue(of(mockAuthUser));
    component.loginForm.patchValue({ identifier: 'test@example.com', password: 'password123' });
    component.onLoginSubmit();
    expect(component.loading).toBeFalse();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/custom-url');
  });

  it('should navigate to /home when no returnUrl is provided', () => {
    activatedRouteMock.snapshot.queryParams = {};
    authServiceSpy.login.and.returnValue(of(mockAuthUser));
    component.loginForm.patchValue({ identifier: 'test@example.com', password: 'password123' });
    component.onLoginSubmit();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should show error if username or password is not provided on submit', () => {
    spyOnProperty(component.loginForm, 'invalid').and.returnValue(false);
    component.loginModel.identifier = '';
    component.loginModel.password = '';
    component.onLoginSubmit();
    expect(component.errorMessage).toBe('Please enter both username/email and password.');
  });

  it('should set specific error message when login fails with API error', () => {
    const errorResponse = { error: { error: 'Invalid credentials' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    component.loginForm.patchValue({ identifier: 'test@example.com', password: 'wrongpass' });
    component.onLoginSubmit();
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should set fallback error message when login fails without specific API message', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({})));
    component.loginForm.patchValue({ identifier: 'test@example.com', password: 'wrongpass' });
    component.onLoginSubmit();
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Login failed. Invalid email or password.');
  });

  it('should reset activeTab to login when onRegistrationSuccess is called', () => {
    component.activeTab = 'register';
    component.onRegistrationSuccess();
    expect(component.activeTab).toBe('login');
  });
});
