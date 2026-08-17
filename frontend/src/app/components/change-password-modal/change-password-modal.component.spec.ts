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

  it('should toggle current password visibility', () => {
    expect(component.showCurrentPassword).toBeFalse();
    component.toggleCurrentPasswordVisibility();
    expect(component.showCurrentPassword).toBeTrue();
  });

  it('should toggle new password visibility', () => {
    expect(component.showNewPassword).toBeFalse();
    component.toggleNewPasswordVisibility();
    expect(component.showNewPassword).toBeTrue();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTrue();
  });

  it('should validate missing current password', () => {
    component.model.current_password = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('Please enter your current password.');
  });

  it('should validate missing new password', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('New password is required.');
  });

  it('should clear error message on new password change', () => {
    component.errorMessage = 'Some error';
    component.onNewPasswordChange('123');
    expect(component.errorMessage).toBe('');
  });

  it('should validate short new password', () => {
    component.model.current_password = 'OldPassword123!';
    component.onNewPasswordChange('123');
    component.onSubmit();
    expect(component.errorMessage).toBe('New password is not strong enough. Please meet all the security requirements.');
  });

  it('should validate mismatched confirmation', () => {
    component.model.current_password = 'OldPassword123!';
    component.onNewPasswordChange('NewPassword123!');
    component.model.confirm_password = 'DiffPassword123!';
    component.onSubmit();
    expect(component.errorMessage).toBe('New password and confirmation do not match.');
  });

  it('should validate new password same as current password', () => {
    component.model.current_password = 'SamePassword123!';
    component.onNewPasswordChange('SamePassword123!');
    component.model.confirm_password = 'SamePassword123!';
    component.onSubmit();
    expect(component.errorMessage).toBe('New password cannot be the same as your current password.');
  });

  it('should return error if userId is null on submit', () => {
    component.userId = null;
    component.model.current_password = 'OldPassword123!';
    component.onNewPasswordChange('NewPassword123!');
    component.model.confirm_password = 'NewPassword123!';
    component.onSubmit();
    
    expect(component.errorMessage).toBe('User session not found. Please log in again.');
  });

  it('should submit successfully when all checks pass', () => {
    component.model.current_password = 'OldPassword123!';
    component.onNewPasswordChange('NewPassword123!');
    component.model.confirm_password = 'NewPassword123!';
    
    spyOn(component.closeModalEvent, 'emit');
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
    expect(component.closeModalEvent.emit).toHaveBeenCalled();
  });

  it('should handle API error when update fails', () => {
    component.model.current_password = 'WrongPassword123!';
    component.onNewPasswordChange('NewPassword123!');
    component.model.confirm_password = 'NewPassword123!';
    
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users/1/password');
    req.flush({ error: 'Incorrect current password' }, { status: 400, statusText: 'Bad Request' });
    
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Incorrect current password');
  });

  it('should return empty strengthLabel for empty password', () => {
    component.onNewPasswordChange('');
    expect(component.strengthLabel).toBe('');
  });

  it('should return Weak label and text-danger class for score 1', () => {
    component.onNewPasswordChange('123');
    expect(component.strengthScore).toBe(1);
    expect(component.strengthLabel).toBe('Weak');
    expect(component.strengthColorClass).toBe('text-danger');
  });

  it('should return Good label and text-warning class for score 3', () => {
    component.onNewPasswordChange('Abcdef');
    expect(component.strengthScore).toBe(3);
    expect(component.strengthLabel).toBe('Good');
    expect(component.strengthColorClass).toBe('text-warning');
  });

  it('should return Strong label and text-success class for score 5', () => {
    component.onNewPasswordChange('Abcdef1!');
    expect(component.strengthScore).toBe(5);
    expect(component.strengthLabel).toBe('Strong');
    expect(component.strengthColorClass).toBe('text-success');
  });
});
