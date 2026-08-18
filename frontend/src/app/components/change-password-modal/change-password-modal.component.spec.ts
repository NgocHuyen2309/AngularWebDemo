import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { ChangePasswordModalComponent } from './change-password-modal.component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

describe('ChangePasswordModalComponent', () => {
  let component: ChangePasswordModalComponent;
  let fixture: ComponentFixture<ChangePasswordModalComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordModalComponent, FormlyModule.forRoot(), FormlyBootstrapModule, ReactiveFormsModule],
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
    component.form.markAllAsTouched();
    component.onSubmit();
    expect(component.errorMessage).toBe('');
  });

  it('should validate missing new password', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = '';
    component.form.markAllAsTouched();
    component.onSubmit();
    expect(component.errorMessage).toBe('');
  });

  it('should clear error message on new password change', () => {
    component.errorMessage = 'Some error';
    component.model.new_password = '123';
    expect(component.errorMessage).toBe('Some error'); // Not cleared by setting model anymore
  });

  it('should validate short new password', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = '123';
    component.checkPasswordStrength('123');
    component.form.markAllAsTouched();
    component.onSubmit();
    expect(component.errorMessage).toBe('');
  });

  it('should validate mismatched confirmation', () => {
    component.model.current_password = 'OldPassword123!';
    component.model.new_password = 'NewPassword123!';
    component.checkPasswordStrength('NewPassword123!');
    component.model.confirm_password = 'DiffPassword123!';
    component.form.markAllAsTouched();
    component.onSubmit();
    expect(component.errorMessage).toBe('');
  });

  it('should validate new password same as current password', () => {
    component.model.current_password = 'SamePassword123!';
    component.model.new_password = 'SamePassword123!';
    component.checkPasswordStrength('SamePassword123!');
    component.model.confirm_password = 'SamePassword123!';
    component.form.markAllAsTouched();
    component.onSubmit();
    expect(component.errorMessage).toBe('');
  });

  it('should return error if userId is null on submit', () => {
    component.userId = null;
    component.form.patchValue({
      current_password: 'OldPassword123!',
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!'
    });
    component.checkPasswordStrength('NewPassword123!');
    component.form.markAllAsTouched();
    component.onSubmit();
    
    expect(component.errorMessage).toBe('User session not found. Please log in again.');
  });

  it('should submit successfully when all checks pass', () => {
    component.form.patchValue({
      current_password: 'OldPassword123!',
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!'
    });
    component.checkPasswordStrength('NewPassword123!');
    
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
    component.form.patchValue({
      current_password: 'WrongPassword123!',
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!'
    });
    component.checkPasswordStrength('NewPassword123!');
    
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/users/1/password');
    req.flush({ error: 'Incorrect current password' }, { status: 400, statusText: 'Bad Request' });
    
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Incorrect current password');
  });

  it('should return empty strengthLabel for empty password', () => {
    component.model.new_password = '';
    component.checkPasswordStrength('');
    expect(component.strengthLabel).toBe('');
  });

  it('should return Weak label and text-danger class for score 1', () => {
    component.model.new_password = '123';
    component.checkPasswordStrength('123');
    expect(component.strengthScore).toBe(1);
    expect(component.strengthLabel).toBe('Weak');
    expect(component.strengthColorClass).toBe('text-danger');
  });

  it('should return Good label and text-warning class for score 3', () => {
    component.model.new_password = 'Abcdef';
    component.checkPasswordStrength('Abcdef');
    expect(component.strengthScore).toBe(3);
    expect(component.strengthLabel).toBe('Good');
    expect(component.strengthColorClass).toBe('text-warning');
  });

  it('should return Strong label and text-success class for score 5', () => {
    component.model.new_password = 'Abcdef1!';
    component.checkPasswordStrength('Abcdef1!');
    expect(component.strengthScore).toBe(5);
    expect(component.strengthLabel).toBe('Strong');
    expect(component.strengthColorClass).toBe('text-success');
  });

  it('should call message functions of validators', () => {
    const newPasswordField = component.fields.find(f => f.key === 'new_password');
    expect((newPasswordField?.validators as any)?.['strength']?.message()).toBe('New password is not strong enough. Please meet all the security requirements.');
    expect((newPasswordField?.validators as any)?.['notSameAsCurrent']?.message()).toBe('New password cannot be the same as your current password.');

    const confirmPasswordField = component.fields.find(f => f.key === 'confirm_password');
    expect((confirmPasswordField?.validators as any)?.['fieldMatch']?.message()).toBe('New password and confirmation do not match.');
  });

  it('should trigger password change event correctly', () => {
    const newPasswordField = component.fields.find(f => f.key === 'new_password');
    spyOn(component, 'checkPasswordStrength');
    
    (newPasswordField?.props as any)?.change?.({ formControl: { value: 'password123' } }, null);
    expect(component.checkPasswordStrength).toHaveBeenCalledWith('password123');
    
    (newPasswordField?.props as any)?.change?.({ formControl: { value: null } }, null);
    expect(component.checkPasswordStrength).toHaveBeenCalledWith('');
  });
});
