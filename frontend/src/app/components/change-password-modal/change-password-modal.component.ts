import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../services/user.service';
import { Subject, takeUntil } from 'rxjs';

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
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, ButtonModule],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.scss'
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
  @Input() userId: number | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();

  form = new FormGroup({});
  model = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  fields: FormlyFieldConfig[] = [
    {
      key: 'current_password',
      type: 'input',
      props: {
        type: 'password',
        label: 'Current Password',
        placeholder: 'Enter your current password to verify identity',
        required: true,
      }
    },
    {
      key: 'new_password',
      type: 'input',
      props: {
        type: 'password',
        label: 'New Password',
        placeholder: 'Enter secure new password (min. 6 chars)',
        required: true,
        minLength: 6,
        change: (field, $event) => {
          if (field.formControl?.value) {
            this.checkPasswordStrength(field.formControl.value);
          } else {
            this.checkPasswordStrength('');
          }
        }
      },
      validators: {
        strength: {
          expression: (c: any) => {
            const val = c.value;
            if (!val) return true;
            return val.length >= 6 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*(),.?":{}|<>\\-_+=\/\[\]]/.test(val);
          },
          message: () => 'New password is not strong enough. Please meet all the security requirements.'
        },
        notSameAsCurrent: {
          expression: (c: any) => c.value !== this.model.current_password,
          message: () => 'New password cannot be the same as your current password.'
        }
      },
      expressionProperties: {
        'validators.notSameAsCurrent.expression': (model: any) => {
          return model.new_password !== model.current_password;
        }
      }
    },
    {
      key: 'confirm_password',
      type: 'input',
      props: {
        type: 'password',
        label: 'Confirm New Password',
        placeholder: 'Re-enter your new password',
        required: true,
      },
      validators: {
        fieldMatch: {
          expression: (c: any) => c.value === this.model.new_password,
          message: () => 'New password and confirmation do not match.'
        }
      },
      expressionProperties: {
        'validators.fieldMatch.expression': (model: any) => model.confirm_password === model.new_password
      }
    }
  ];

  loading = false;
  errorMessage = '';

  checklist: PasswordChecklist = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    // any initialization logic
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkPasswordStrength(password: string) {
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
    if (this.checklist.hasSpecial || (this.model.new_password && this.model.new_password.length >= 10)) score += 1;
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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';

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
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
