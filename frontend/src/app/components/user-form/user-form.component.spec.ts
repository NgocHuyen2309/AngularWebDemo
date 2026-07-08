import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
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
        provideHttpClientTesting()
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
    component.email = '';
    component.dateOfBirth = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill in all fields.');
  });

  it('should call createUser and show success on valid submission', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      date_of_birth: '1990-01-15'
    };

    component.email = 'test@example.com';
    component.dateOfBirth = '1990-01-15';
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      date_of_birth: '1990-01-15'
    });
    req.flush(mockUser);

    expect(component.successMessage).toContain('User registered successfully');
    expect(component.createdUser).toEqual(mockUser);
    expect(component.email).toBe('');
    expect(component.dateOfBirth).toBe('');
  });

  it('should show error message on API failure', () => {
    component.email = 'test@example.com';
    component.dateOfBirth = '1990-01-15';
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    req.flush(
      { message: 'Email already exists' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(component.errorMessage).toBe('Email already exists');
  });

  it('should render the form with email and date inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('input[type="email"]');
    const dateInput = compiled.querySelector('input[type="date"]');
    const submitBtn = compiled.querySelector('.user-form__submit-btn');

    expect(emailInput).toBeTruthy();
    expect(dateInput).toBeTruthy();
    expect(submitBtn).toBeTruthy();
  });
});
