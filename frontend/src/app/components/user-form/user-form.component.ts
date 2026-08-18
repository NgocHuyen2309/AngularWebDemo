import { Component, OnInit, Input, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { UserService, User } from '../../services/user.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

export interface PasswordChecklist {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, ButtonModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit, OnDestroy {
  @Input() isModal = false;
  @Input() isEditMode = false;
  @Input() editUserId: number | null = null;
  @Output() userUpdated = new EventEmitter<User>();
  @Output() closeModalEvent = new EventEmitter<void>();

  errorMessage = '';
  createdUser: User | null = null;
  loading = false;
  formSubmitted = false;

  form = new FormGroup({});
  model = {
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: ''
  };
  fields: FormlyFieldConfig[] = [];

  // Backwards compatibility for tests that access properties directly
  get email(): string { return this.model.email; }
  set email(val: string) { this.model.email = val; }

  get dateOfBirth(): string { return this.model.date_of_birth; }
  set dateOfBirth(val: string) { this.model.date_of_birth = val; }

  get username(): string { return this.model.username; }
  set username(val: string) { this.model.username = val; }

  strengthScore = 0;
  strengthLabel = 'None';
  strengthColorClass = 'strength-none';

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
    private authService: AuthService,
    private messageService: MessageService,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
    this.initUserForm();
  }

  initUserForm() {
    this.checkPasswordStrength('');
    this.buildFields();

    if (this.isEditMode && this.editUserId) {
      this.loadUserDetails(this.editUserId);
    } else if (this.isEditMode && !this.editUserId) {
      const current = this.authService.getCurrentUser();
      if (current) {
        this.editUserId = current.id;
        this.loadUserDetails(current.id);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildFields() {
    this.fields = [
      {
        fieldGroupClassName: this.isEditMode ? '' : 'row',
        fieldGroup: [
          {
            className: this.isEditMode ? '' : 'col-md-6',
            key: 'username',
            type: 'input',
            props: {
              label: 'Username',
              placeholder: 'e.g. alex_crown',
              required: true,
            },
            validators: {
              validUsername: {
                expression: (c: any) => this.isValidUsername(c.value),
                message: () => 'No spaces or special characters allowed.'
              }
            }
          },
          {
            className: this.isEditMode ? '' : 'col-md-6',
            key: 'date_of_birth',
            type: 'input',
            props: {
              type: 'date',
              label: 'Date of Birth',
              required: true,
            },
            validators: {
              validAge: {
                expression: (c: any) => this.isValidAge(c.value),
                message: () => 'You must be at least 16 years old.'
              }
            }
          }
        ]
      },
      {
        key: 'email',
        type: 'input',
        props: {
          type: 'email',
          label: 'Email Address',
          placeholder: 'Enter email (e.g. yourname@gmail.com)',
          required: !this.isEditMode,
          disabled: this.isEditMode,
        },
        validators: {
          validEmail: {
            expression: (c: any) => this.isEditMode ? true : this.isValidEmail(c.value),
            message: () => 'Must strictly end with @gmail.com or @enterprise.com.'
          }
        }
      },
      {
        key: 'password',
        type: 'input',
        hideExpression: () => this.isEditMode,
        props: {
          type: 'password',
          label: 'Password',
          placeholder: 'Create secure password (min. 6 chars)',
          required: !this.isEditMode,
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
              if (this.isEditMode || !val) return true;
              return val.length >= 6 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*(),.?":{}|<>\-_+=\/\\[\]]/.test(val);
            },
            message: () => 'Password is not strong enough. Please meet all the security requirements.'
          }
        }
      },
      {
        key: 'confirm_password',
        type: 'input',
        hideExpression: () => this.isEditMode,
        props: {
          type: 'password',
          label: 'Confirm Password',
          placeholder: 'Confirm your password',
          required: !this.isEditMode,
        },
        validators: {
          fieldMatch: {
            expression: (c: any) => this.isEditMode ? true : c.value === this.model.password,
            message: () => 'Passwords do not match.'
          }
        },
        expressionProperties: {
          'validators.fieldMatch.expression': (model: any) => this.isEditMode ? true : model.confirm_password === model.password
        }
      }
    ];
  }

  loadUserDetails(id: number) {
    this.loading = true;
    this.userService.getUser(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.loading = false;
          let formattedDob = '';
          if (user.date_of_birth) {
            const d = new Date(user.date_of_birth);
            if (!isNaN(d.getTime())) {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              formattedDob = `${year}-${month}-${day}`;
            }
          }
          this.model = {
            username: user.username || user.email.split('@')[0],
            email: user.email,
            password: '',
            confirm_password: '',
            date_of_birth: formattedDob
          };
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to load user profile details.';
        }
      });
  }

  isValidUsername(username: string): boolean {
    if (!username) return false;
    return /^[a-zA-Z0-9_]+$/.test(username);
  }

  checkPasswordStrength(password: string) {
    if (!password) {
      this.strengthScore = 0;
      this.strengthLabel = 'None';
      this.strengthColorClass = 'strength-none';
      this.checklist = { minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false };
      return;
    }

    this.checklist.minLength = password.length >= 6;
    this.checklist.hasUpper = /[A-Z]/.test(password);
    this.checklist.hasLower = /[a-z]/.test(password);
    this.checklist.hasNumber = /[0-9]/.test(password);
    this.checklist.hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=\/\\[\]]/.test(password);

    let score = 0;
    if (this.checklist.minLength) score += 1;
    if (this.checklist.hasUpper && this.checklist.hasLower) score += 1;
    if (this.checklist.hasNumber) score += 1;
    if (this.checklist.hasSpecial || password.length >= 10) score += 1;

    this.strengthScore = score;
    switch (score) {
      case 1:
        this.strengthLabel = 'Weak';
        this.strengthColorClass = 'strength-weak';
        break;
      case 2:
        this.strengthLabel = 'Medium';
        this.strengthColorClass = 'strength-medium';
        break;
      case 3:
        this.strengthLabel = 'Strong';
        this.strengthColorClass = 'strength-strong';
        break;
      case 4:
        this.strengthLabel = 'Very Strong';
        this.strengthColorClass = 'strength-verystrong';
        break;
      default:
        this.strengthLabel = 'Weak';
        this.strengthColorClass = 'strength-weak';
    }
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    return /^[a-zA-Z0-9._%+-]+@(gmail\.com|enterprise\.com|.*\.vn|.*\.edu|.*\.edu\.vn)$/i.test(email.trim());
  }

  isValidAge(dob: string): boolean {
    if (!dob) return false;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age >= 16;
  }

  autoFocusFirstInvalidInput() {
    setTimeout(() => {
      const invalidInput = this.elRef.nativeElement.querySelector('.ng-invalid:not(form), input.is-invalid');
      if (invalidInput) {
        invalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        invalidInput.focus();
      }
    }, 50);
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.autoFocusFirstInvalidInput();
      return;
    }

    this.errorMessage = '';
    this.createdUser = null;

    if (this.isEditMode && this.editUserId) {
      const updateData: Partial<User> = {
        username: this.model.username.trim(),
        email: this.model.email.trim(),
        date_of_birth: this.model.date_of_birth
      };
      this.loading = true;
      this.userService.updateUser(this.editUserId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUser) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Profile updated successfully!'
            });
            const currentSession = this.authService.getCurrentUser();
            if (currentSession && Number(currentSession.id) === Number(updatedUser.id)) {
              const newAuthSession: AuthUser = {
                ...currentSession,
                ...updatedUser,
                username: updatedUser.username || (updatedUser.email ? updatedUser.email.split('@')[0] : 'user'),
                email: updatedUser.email,
                date_of_birth: updatedUser.date_of_birth,
                role: (updatedUser.role as 'admin' | 'user') || currentSession.role
              };
              this.authService.updateCurrentUserSession(newAuthSession);
            }
            this.userUpdated.emit(updatedUser);
            this.userService.notifyUserAdded();
            if (this.isModal) {
              setTimeout(() => {
                this.closeModalEvent.emit();
              }, 1000);
            }
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err.error?.error || err.error?.message || 'Profile update failed.';
            if (err.status >= 500) {
              this.messageService.add({
                severity: 'error',
                summary: 'Server Error',
                detail: 'A global server error occurred while updating profile.'
              });
            } else {
              this.autoFocusFirstInvalidInput();
            }
          }
        });
      return;
    }

    this.loading = true;
    this.userService.createUser(
      this.model.email,
      this.model.password,
      this.model.confirm_password,
      this.model.date_of_birth,
      this.model.username.trim()
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.loading = false;
          this.createdUser = user;
          this.messageService.add({
            severity: 'success',
            summary: 'Account Created',
            detail: `User registered successfully! Username: ${user.username || user.email.split('@')[0]}`
          });
          this.model = { username: '', email: '', password: '', confirm_password: '', date_of_birth: '' };
          this.form.reset();
          this.formSubmitted = false;
          this.checkPasswordStrength('');
          this.userService.notifyUserAdded();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || err.error?.message || 'Registration failed.';
          if (err.status >= 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Server Error',
              detail: 'A global server error occurred during registration.'
            });
          } else {
            this.autoFocusFirstInvalidInput();
          }
        }
      });
  }
}
