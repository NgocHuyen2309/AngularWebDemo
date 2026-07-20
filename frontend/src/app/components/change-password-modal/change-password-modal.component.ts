import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';

export interface PasswordChecklist {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.scss'
})
export class ChangePasswordModalComponent {
  @Input() userId: number | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();

  model = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  loading = false;
  errorMessage = '';
  formSubmitted = false;

  checklist: PasswordChecklist = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) {}

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onNewPasswordChange(val: string): void {
    this.model.new_password = val;
    this.checkPasswordStrength(val);
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.checklist = { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false };
      return;
    }
    this.checklist.minLength = password.length >= 6;
    this.checklist.hasUpper = /[A-Z]/.test(password);
    this.checklist.hasLower = /[a-z]/.test(password);
    this.checklist.hasNumber = /[0-9]/.test(password);
    this.checklist.hasSpecial = /[!@#$%^&*(),.?":{}|<>\\-_+=\/\[\]]/.test(password);
  }

  get strengthScore(): number {
    let score = 0;
    if (this.checklist.minLength) score += 2;
    if (this.checklist.hasUpper && this.checklist.hasLower) score += 1;
    if (this.checklist.hasNumber) score += 1;
    if (this.checklist.hasSpecial || this.model.new_password.length >= 10) score += 1;
    return score;
  }

  get strengthLabel(): string {
    if (!this.model.new_password) return '';
    const score = this.strengthScore;
    if (score < 2) return 'Weak';
    if (score < 4) return 'Good';
    return 'Strong';
  }

  get strengthColorClass(): string {
    const score = this.strengthScore;
    if (score < 2) return 'text-danger';
    if (score < 4) return 'text-warning';
    return 'text-success';
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (!this.model.current_password) {
      this.errorMessage = 'Please enter your current password.';
      return;
    }

    if (!this.model.new_password) {
      this.errorMessage = 'New password is required.';
      return;
    }

    if (!this.checklist.minLength || !this.checklist.hasUpper || !this.checklist.hasLower || !this.checklist.hasNumber || !this.checklist.hasSpecial) {
      this.errorMessage = 'New password is not strong enough. Please meet all the security requirements.';
      return;
    }

    if (this.model.new_password !== this.model.confirm_password) {
      this.errorMessage = 'New password and confirmation do not match.';
      return;
    }

    if (this.model.new_password === this.model.current_password) {
      this.errorMessage = 'New password cannot be the same as your current password.';
      return;
    }

    if (!this.userId) {
      this.errorMessage = 'User session not found. Please log in again.';
      return;
    }

    this.loading = true;
    this.userService.updateUserPassword(
      this.userId,
      this.model.current_password,
      this.model.new_password,
      this.model.confirm_password
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Password Changed',
          detail: res.message || 'Your password has been updated successfully!'
        });
        this.closeModalEvent.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Could not update password. Please verify your current password.';
      }
    });
  }
}
