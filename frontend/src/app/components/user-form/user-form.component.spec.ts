import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when submitting empty form', () => {
    component.model.email = '';
    component.model.date_of_birth = '';
    component.model.password = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill in all required fields.');
  });

  it('should show error when password confirmation mismatch', () => {
    component.model.username = 'test';
    component.model.email = 'test@gmail.com';
    component.model.date_of_birth = '1990-01-15';
    component.model.password = 'SecurePass123!';
    component.model.confirm_password = 'DifferentPass123!';
    component.onSubmit();
    expect(component.errorMessage).toBe('Password and confirmation do not match.');
  });

  it('should calculate password strength accurately', () => {
    component.checkPasswordStrength('');
    expect(component.strengthScore).toBe(0);

    component.checkPasswordStrength('123');
    expect(component.strengthScore).toBe(1);

    component.checkPasswordStrength('abcDEF123!');
    expect(component.strengthScore).toBe(4);
    expect(component.strengthLabel).toBe('Very Strong');
  });

  it('should call createUser and show success on valid submission', () => {
    const mockUser = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      date_of_birth: '1990-01-15',
      role: 'user'
    };

    component.model.username = 'test';
    component.model.email = 'test@gmail.com';
    component.model.password = 'SecurePass123!';
    component.model.confirm_password = 'SecurePass123!';
    component.model.date_of_birth = '1990-01-15';
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15',
      role: undefined
    });
    req.flush(mockUser);

    expect(component.model.email).toBe('');
    expect(component.model.password).toBe('');
  });

  it('should show error message on API failure', () => {
    component.model.username = 'test';
    component.model.email = 'test@gmail.com';
    component.model.password = 'SecurePass123!';
    component.model.confirm_password = 'SecurePass123!';
    component.model.date_of_birth = '1990-01-15';
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    req.flush(
      { message: 'Email already exists' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(component.errorMessage).toBe('Email already exists');
  });

  it('should render the form inputs including password', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('input[type="email"]');
    const dateInput = compiled.querySelector('input[type="date"]');
    const passwordInputs = compiled.querySelectorAll('input[type="password"]');
    const submitBtn = compiled.querySelector('.user-form__submit-btn');

    expect(emailInput).toBeTruthy();
    expect(dateInput).toBeTruthy();
    expect(passwordInputs.length).toBe(2); // password & confirm password
    expect(submitBtn).toBeTruthy();
  });
});
