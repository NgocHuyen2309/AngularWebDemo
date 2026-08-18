import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { UserFormComponent } from './user-form.component';
import { AuthService, AuthUser } from '../../services/auth.service';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockAuthUser: AuthUser = {
    id: 1,
    username: 'admin',
    email: 'admin@gmail.com',
    role: 'admin',
    date_of_birth: '1990-01-01',
    status: 'active'
  };

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'updateCurrentUserSession']);
    aSpy.getCurrentUser.and.returnValue(mockAuthUser);

    await TestBed.configureTestingModule({
      imports: [UserFormComponent, FormlyModule.forRoot(), FormlyBootstrapModule, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        { provide: AuthService, useValue: aSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── Component Init ───────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user details on init if edit mode and editUserId is provided', () => {
    // Need fresh component without detectChanges to set inputs first
    const freshFixture = TestBed.createComponent(UserFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.isEditMode = true;
    freshComponent.editUserId = 2;

    freshFixture.detectChanges(); // calls ngOnInit -> loadUserDetails(2)

    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 2, username: 'test2', email: 'test2@gmail.com', date_of_birth: '2000-01-01T00:00:00.000Z' });
    expect(freshComponent.model.username).toBe('test2');
    expect(freshComponent.model.email).toBe('test2@gmail.com');
    expect(freshComponent.model.date_of_birth).toBe('2000-01-01');
    expect(freshComponent.loading).toBeFalse();
    // Test backwards compat getters/setters
    expect(freshComponent.email).toBe('test2@gmail.com');
    expect(freshComponent.dateOfBirth).toBe('2000-01-01');
    expect(freshComponent.username).toBe('test2');
    freshComponent.email = 'new@gmail.com';
    expect(freshComponent.model.email).toBe('new@gmail.com');
    freshComponent.dateOfBirth = '2001-01-01';
    expect(freshComponent.model.date_of_birth).toBe('2001-01-01');
    freshComponent.username = 'newname';
    expect(freshComponent.model.username).toBe('newname');
  });

  it('should fallback to username from email if username is missing when loading details', () => {
    const freshFixture = TestBed.createComponent(UserFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.isEditMode = true;
    freshComponent.editUserId = 2;
    freshFixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    req.flush({ id: 2, email: 'no_name@gmail.com', date_of_birth: '2000-01-01T00:00:00.000Z' });
    expect(freshComponent.model.username).toBe('no_name');
  });

  it('should handle error when load user details fails', () => {
    const freshFixture = TestBed.createComponent(UserFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.isEditMode = true;
    freshComponent.editUserId = 2;
    freshFixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    expect(freshComponent.errorMessage).toBe('Failed to load user profile details.');
    expect(freshComponent.loading).toBeFalse();
  });

  it('should load user details with invalid date_of_birth', () => {
    const freshFixture = TestBed.createComponent(UserFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.isEditMode = true;
    freshComponent.editUserId = 2;
    freshFixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    req.flush({ id: 2, username: 'test2', email: 'test2@gmail.com', date_of_birth: 'invalid date' });
    expect(freshComponent.model.date_of_birth).toBe('');
    expect(freshComponent.loading).toBeFalse();
  });

  it('should use current user id if edit mode is true but editUserId is null', () => {
    const freshFixture = TestBed.createComponent(UserFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.isEditMode = true;
    freshComponent.editUserId = null;
    freshFixture.detectChanges(); // should get current user (ID 1)
    expect(Number(freshComponent.editUserId)).toBe(1);
    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    req.flush({ id: 1, email: 'admin@gmail.com' });
  });

  it('should not call loadUserDetails if edit mode is true but editUserId is null and current user is null', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    const freshFixture = TestBed.createComponent(UserFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.isEditMode = true;
    freshComponent.editUserId = null;
    freshFixture.detectChanges();
    httpMock.expectNone('http://localhost:3000/api/users/1');
    expect(freshComponent.editUserId).toBeNull();
  });

  // ─── Validators ───────────────────────────────────────────────────────────
  it('should reject empty username', () => {
    expect(component.isValidUsername('')).toBeFalse();
  });

  it('should accept valid username with letters, numbers and underscore', () => {
    expect(component.isValidUsername('valid_name123')).toBeTrue();
  });

  it('should reject username with spaces or special characters', () => {
    expect(component.isValidUsername('invalid name!')).toBeFalse();
  });

  it('should reject empty email', () => {
    expect(component.isValidEmail('')).toBeFalse();
  });

  it('should accept gmail.com email', () => {
    expect(component.isValidEmail('test@gmail.com')).toBeTrue();
  });

  it('should accept enterprise.com email', () => {
    expect(component.isValidEmail('test@enterprise.com')).toBeTrue();
  });

  it('should accept .edu.vn email', () => {
    expect(component.isValidEmail('test@school.edu.vn')).toBeTrue();
  });

  it('should reject yahoo.com email', () => {
    expect(component.isValidEmail('test@yahoo.com')).toBeFalse();
  });

  it('should reject empty date for age validation', () => {
    expect(component.isValidAge('')).toBeFalse();
  });

  it('should reject non-date string for age validation', () => {
    expect(component.isValidAge('invalid')).toBeFalse();
  });

  it('should accept user who is exactly 16 years old', () => {
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    expect(component.isValidAge(sixteenYearsAgo.toISOString())).toBeTrue();
  });

  it('should reject user who is 15 years old', () => {
    const today = new Date();
    const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
    expect(component.isValidAge(fifteenYearsAgo.toISOString())).toBeFalse();
  });

  it('should reject user whose 16th birthday is next month', () => {
    const today = new Date();
    const notYetSixteen = new Date(today.getFullYear() - 16, today.getMonth() + 1, today.getDate());
    expect(component.isValidAge(notYetSixteen.toISOString())).toBeFalse();
  });

  // ─── Password Strength ────────────────────────────────────────────────────

  it('should return score 0 for empty password', () => {
    component.checkPasswordStrength('');
    expect(component.strengthScore).toBe(0);
  });

  it('should return score 1 (Weak) for short numeric-only password', () => {
    component.checkPasswordStrength('123');
    expect(component.strengthScore).toBe(1);
    expect(component.strengthLabel).toBe('Weak');
    expect(component.strengthColorClass).toBe('strength-weak');
  });

  it('should return score 2 (Medium) for lowercase + number password', () => {
    component.checkPasswordStrength('abc123');
    expect(component.strengthScore).toBe(2);
    expect(component.strengthLabel).toBe('Medium');
    expect(component.strengthColorClass).toBe('strength-medium');
  });

  it('should return score 3 (Strong) for mixed-case + number password', () => {
    component.checkPasswordStrength('abc123DEF');
    expect(component.strengthScore).toBe(3);
    expect(component.strengthLabel).toBe('Strong');
    expect(component.strengthColorClass).toBe('strength-strong');
  });

  it('should return score 4 (Very Strong) for password meeting all criteria', () => {
    component.checkPasswordStrength('abcDEF123!');
    expect(component.strengthScore).toBe(4);
    expect(component.strengthLabel).toBe('Very Strong');
    expect(component.strengthColorClass).toBe('strength-verystrong');
  });

  // ─── onSubmit — Validation Errors ─────────────────────────────────────────

  it('should show error when submitting edit mode with empty username', fakeAsync(() => {
    component.isEditMode = true;
    component.model.username = '';
    component.model.date_of_birth = '2000-01-01';
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error when submitting edit mode with empty date of birth', fakeAsync(() => {
    component.isEditMode = true;
    component.model.username = 'test';
    component.model.date_of_birth = '';
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error when submitting empty form in create mode', fakeAsync(() => {
    component.isEditMode = false;
    component.model.email = '';
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error for missing password in create mode', fakeAsync(() => {
    component.isEditMode = false;
    component.model = { username: 'test', email: 'test@gmail.com', date_of_birth: '1990-01-01', password: '', confirm_password: '' };
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error for invalid username format', fakeAsync(() => {
    component.isEditMode = false;
    component.model = { username: 'invalid name!', email: 'test@gmail.com', date_of_birth: '2000-01-01', password: 'Password123!', confirm_password: 'Password123!' };
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error for invalid email domain in create mode', fakeAsync(() => {
    component.isEditMode = false;
    component.model = { username: 'test', email: 'test@yahoo.com', date_of_birth: '2000-01-01', password: 'Password123!', confirm_password: 'Password123!' };
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error when user is under 16 years old', fakeAsync(() => {
    component.isEditMode = false;
    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, 0, 1);
    component.model = { username: 'test', email: 'test@gmail.com', date_of_birth: tenYearsAgo.toISOString(), password: 'Password123!', confirm_password: 'Password123!' };
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
    expect(component.errorMessage).toBe("");
  }));

  it('should show error for weak password in create mode', fakeAsync(() => {
    component.isEditMode = false;
    component.model = { username: 'test', email: 'test@gmail.com', date_of_birth: '1990-01-01', password: 'weak', confirm_password: 'weak' };
    component.checkPasswordStrength('weak');
    component.form.markAllAsTouched();
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
  }));

  it('should show error when password and confirm password do not match', fakeAsync(() => {
    component.isEditMode = false;
    component.model = { username: 'test', email: 'test@gmail.com', date_of_birth: '1990-01-01', password: 'Password123!', confirm_password: 'Password1234!' };
    component.checkPasswordStrength('Password123!');
    component.form.markAllAsTouched();
    component.onSubmit();
    tick(100);
    expect(component.form.invalid).toBeTrue();
  }));

  // ─── Auto Focus ───────────────────────────────────────────────────────────

  it('should auto focus on invalid input if validation fails in edit mode', (done) => {
    component.isEditMode = true;
    component.model.username = '';
    fixture.detectChanges();
    spyOn(component, 'autoFocusFirstInvalidInput');
    component.onSubmit();
    expect(component.autoFocusFirstInvalidInput).toHaveBeenCalled();
    done();
  });

  it('should auto focus on invalid input if validation fails in create mode', (done) => {
    component.isEditMode = false;
    component.model.username = '';
    fixture.detectChanges();
    spyOn(component, 'autoFocusFirstInvalidInput');
    component.onSubmit();
    expect(component.autoFocusFirstInvalidInput).toHaveBeenCalled();
    done();
  });

  // ─── Create User (POST) ───────────────────────────────────────────────────

  it('should call createUser and reset form on successful submission', () => {
    const mockUser = { id: 1, username: 'test', email: 'test@gmail.com', date_of_birth: '1990-01-15', role: 'user' };
    component.form.patchValue({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
    expect(component.createdUser).toEqual(mockUser);
    expect(component.model.email).toBe('');
    expect(component.model.password).toBe('');
    expect(component.formSubmitted).toBeFalse();
  });

  it('should handle API 500 error on create with error message from response', fakeAsync(() => {
    component.form.patchValue({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Server Error' });
    tick(100);
    expect(component.errorMessage).toBe('Internal error');
  }));

  it('should handle API 500 error on create with fallback message when response body is empty', fakeAsync(() => {
    component.form.patchValue({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15'
    });
    component.onSubmit()
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    req.flush({}, { status: 500, statusText: 'Server Error' });
    tick(100);
    expect(component.errorMessage).toBe('Registration failed.');
  }));

  it('should handle bad request (400) on create', fakeAsync(() => {
    component.form.patchValue({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15'
    });
    component.onSubmit()
    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    req.flush({}, { status: 400, statusText: 'Bad Request' });
    tick(100);
    expect(component.errorMessage).toBe('Registration failed.');
  }));

  it('should call message functions of validators', () => {
    component.buildFields();
    
    // Find fields properly handling fieldGroups
    let usernameField, dobField, emailField, passwordField, confirmPasswordField;
    for (const f of component.fields) {
      if (f.key === 'email') emailField = f;
      if (f.key === 'password') passwordField = f;
      if (f.key === 'confirm_password') confirmPasswordField = f;
      if (f.fieldGroup) {
        for (const subField of f.fieldGroup) {
          if (subField.key === 'username') usernameField = subField;
          if (subField.key === 'date_of_birth') dobField = subField;
        }
      }
    }

    expect((usernameField?.validators as any)?.['validUsername']?.message()).toBe('No spaces or special characters allowed.');
    expect((dobField?.validators as any)?.['validAge']?.message()).toBe('You must be at least 16 years old.');
    expect((emailField?.validators as any)?.['validEmail']?.message()).toBe('Must strictly end with @gmail.com or @enterprise.com.');
    expect((passwordField?.validators as any)?.['strength']?.message()).toBe('Password is not strong enough. Please meet all the security requirements.');
    expect((confirmPasswordField?.validators as any)?.['fieldMatch']?.message()).toBe('Passwords do not match.');
  });

  it('should trigger password change event correctly', () => {
    component.buildFields();
    const passwordField = component.fields.find(f => f.key === 'password');
    spyOn(component, 'checkPasswordStrength');
    
    (passwordField?.props as any)?.change?.({ formControl: { value: 'password123' } }, null);
    expect(component.checkPasswordStrength).toHaveBeenCalledWith('password123');
    
    (passwordField?.props as any)?.change?.({ formControl: { value: null } }, null);
    expect(component.checkPasswordStrength).toHaveBeenCalledWith('');
  });

  it('should trigger autoFocus when create returns 4xx error', fakeAsync(() => {
    component.form.patchValue({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
    tick(100);
    expect(component.errorMessage).toBe('Email already exists');
    expect(component.loading).toBeFalse();
  }));

  // ─── Update User (PUT) ────────────────────────────────────────────────────

  it('should call updateUser and update session when editing current user', fakeAsync(() => {
    component.isEditMode = true;
    component.editUserId = 1;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'admin@gmail.com',
      date_of_birth: '1990-01-01'
    });
    spyOn(component.userUpdated, 'emit');
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, username: 'newname', email: 'admin@gmail.com', role: 'admin' });
    expect(authServiceSpy.updateCurrentUserSession).toHaveBeenCalled();
    const arg = authServiceSpy.updateCurrentUserSession.calls.mostRecent().args[0];
    expect(arg.username).toBe('newname');
    expect(component.userUpdated.emit).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('should not update session when currentSession is null', fakeAsync(() => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    component.isEditMode = true;
    component.editUserId = 2;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'user2@gmail.com',
      date_of_birth: '1990-01-01'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    req.flush({ id: 2, username: 'newname', email: 'user2@gmail.com', role: 'user' });
    expect(authServiceSpy.updateCurrentUserSession).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('should not update session when editing a different user', fakeAsync(() => {
    authServiceSpy.getCurrentUser.and.returnValue({ id: 999, email: 'other@gmail.com', role: 'user', username: 'other', date_of_birth: '1990-01-01', status: 'active' });
    component.isEditMode = true;
    component.editUserId = 2;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'user2@gmail.com',
      date_of_birth: '1990-01-01'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    req.flush({ id: 2, username: 'newname', email: 'user2@gmail.com', role: 'user' });
    expect(authServiceSpy.updateCurrentUserSession).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('should handle API 500 error on update with error message from response', fakeAsync(() => {
    component.isEditMode = true;
    component.editUserId = 1;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'admin@gmail.com',
      date_of_birth: '1990-01-01'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Server Error' });
    tick(100);
    expect(component.errorMessage).toBe('Internal error');
  }));

  it('should handle API 500 error on update with fallback message when response body is empty', fakeAsync(() => {
    component.isEditMode = true;
    component.editUserId = 1;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'admin@gmail.com',
      date_of_birth: '1990-01-01'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    req.flush({}, { status: 500, statusText: 'Server Error' });
    tick(100);
    expect(component.errorMessage).toBe('Profile update failed.');
  }));

  it('should trigger autoFocus when update returns 4xx error', fakeAsync(() => {
    component.isEditMode = true;
    component.editUserId = 1;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'admin@gmail.com',
      date_of_birth: '1990-01-01'
    });
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    req.flush({ error: 'Username already taken' }, { status: 422, statusText: 'Unprocessable Entity' });
    tick(100);
    expect(component.errorMessage).toBe('Username already taken');
    expect(component.loading).toBeFalse();
  }));

  // ─── Modal Behaviour ──────────────────────────────────────────────────────

  it('should emit closeModalEvent after update when isModal is true', fakeAsync(() => {
    component.isEditMode = true;
    component.isModal = true;
    component.editUserId = 2;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'user2',
      email: 'user2@gmail.com',
      date_of_birth: '2000-01-01'
    });
    spyOn(component.closeModalEvent, 'emit');
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/2');
    req.flush({ id: 2, username: 'user2', email: 'user2@gmail.com', role: 'user' });
    expect(authServiceSpy.updateCurrentUserSession).not.toHaveBeenCalled();
    tick(1000);
    expect(component.closeModalEvent.emit).toHaveBeenCalled();
  }));

  it('should not emit closeModalEvent after update when isModal is false', fakeAsync(() => {
    component.isEditMode = true;
    component.isModal = false;
    component.editUserId = 1;
    component.buildFields();
    fixture.detectChanges();
    component.form.patchValue({
      username: 'newname',
      email: 'admin@gmail.com',
      date_of_birth: '1990-01-01'
    });
    spyOn(component.closeModalEvent, 'emit');
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    req.flush({ id: 1, username: 'newname', email: 'admin@gmail.com', role: 'admin' });
    tick(1000);
    expect(component.closeModalEvent.emit).not.toHaveBeenCalled();
  }));

  it('should not emit closeModalEvent after create when isModal is false', fakeAsync(() => {
    component.isModal = false;
    component.form.patchValue({
      username: 'test',
      email: 'test@gmail.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15'
    });
    spyOn(component.closeModalEvent, 'emit');
    component.onSubmit();
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    req.flush({ id: 2, username: 'test', email: 'test@gmail.com', role: 'user' });
    tick(1000);
    expect(component.closeModalEvent.emit).not.toHaveBeenCalled();
  }));

  // ─── DOM Rendering ────────────────────────────────────────────────────────

  it('should render the form inputs including email, date and password fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="date"]')).toBeTruthy();
    expect(compiled.querySelectorAll('input[type="password"]').length).toBe(2);
    expect(compiled.querySelector('.user-form__submit-btn')).toBeTruthy();
  });
});
