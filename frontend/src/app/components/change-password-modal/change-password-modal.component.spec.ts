import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { ChangePasswordModalComponent } from './change-password-modal.component';

describe('ChangePasswordModalComponent', () => {
  let component: ChangePasswordModalComponent;
  let fixture: ComponentFixture<ChangePasswordModalComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordModalComponent);
    component = fixture.componentInstance;
    component.userId = 1;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate missing current password', () => {
    component.model.current_password = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('Please enter your current password.');
  });

  it('should validate short new password', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = '123';
    component.onSubmit();
    expect(component.errorMessage).toBe('New password must be at least 6 characters long.');
  });

  it('should validate mismatched confirmation', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = 'NewPassword123!';
    component.model.confirm_password = 'DiffPassword123!';
    component.onSubmit();
    expect(component.errorMessage).toBe('New password and confirmation do not match.');
  });

  it('should validate new password same as current password', () => {
    component.model.current_password = 'SamePassword123!';
    component.model.new_password = 'SamePassword123!';
    component.model.confirm_password = 'SamePassword123!';
    component.onSubmit();
    expect(component.errorMessage).toBe('New password cannot be the same as your current password.');
  });

  it('should submit successfully when all checks pass', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = 'NewPassword123!';
    component.model.confirm_password = 'NewPassword123!';
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users/1/password');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      current_password: 'OldPassword123!',
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!'
    });
    req.flush({ message: 'Password updated successfully' });
    expect(component.loading).toBeFalse();
  });
});
