import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormlyModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  @Input() isModal = false;
  @Input() isEditMode = false;
  @Input() editUserId: number | null = null;
  @Output() userUpdated = new EventEmitter<User>();
  @Output() closeModalEvent = new EventEmitter<void>();

  successMessage = '';
  errorMessage = '';
  createdUser: User | null = null;
  loading = false;

  // Form model
  model = {
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: ''
  };

  // Backwards compatibility for tests that access properties directly
  get email(): string { return this.model.email; }
  set email(val: string) { this.model.email = val; }

  get dateOfBirth(): string { return this.model.date_of_birth; }
  set dateOfBirth(val: string) { this.model.date_of_birth = val; }

  get username(): string { return this.model.username; }
  set username(val: string) { this.model.username = val; }

  // Visibility toggle (Con mắt)
  showPassword = false;
  showConfirmPassword = false;

  // Password strength state
  strengthScore = 0; // 0 to 4
  strengthLabel = 'None';
  strengthColorClass = 'strength-none';

  checklist: PasswordChecklist = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkPasswordStrength('');
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

  loadUserDetails(id: number): void {
    this.loading = true;
    this.userService.getUser(id).subscribe({
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
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load user profile details.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordChange(val: string): void {
    this.model.password = val;
    this.checkPasswordStrength(val);
  }

  checkPasswordStrength(password: string): void {
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
    return /^[a-zA-Z0-9._%+-]+@(gmail\.com|enterprise\.com)$/i.test(email.trim());
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

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.createdUser = null;

    if (this.isEditMode) {
      if (!this.model.username || !this.model.email || !this.model.date_of_birth) {
        this.errorMessage = 'Please fill in Username, Email, and Date of Birth.';
        return;
      }
    } else {
      if (!this.model.username || !this.model.email || !this.model.date_of_birth || !this.model.password) {
        this.errorMessage = 'Please fill in all required fields including Username and Password.';
        return;
      }
    }

    if (!this.isValidEmail(this.model.email)) {
      this.errorMessage = 'Email address must strictly end with @gmail.com (e.g., yourname@gmail.com)';
      return;
    }

    if (!this.isValidAge(this.model.date_of_birth)) {
      this.errorMessage = 'User must be at least 16 years old';
      return;
    }

    if (this.model.password) {
      if (this.model.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long.';
        return;
      }
      if (this.model.password !== this.model.confirm_password) {
        this.errorMessage = 'Password and confirmation do not match.';
        return;
      }
    }

    if (this.isEditMode && this.editUserId) {
      const updateData: any = {
        username: this.model.username.trim(),
        email: this.model.email.trim(),
        date_of_birth: this.model.date_of_birth
      };
      if (this.model.password) {
        updateData.password = this.model.password;
      }
      this.loading = true;
      this.userService.updateUser(this.editUserId, updateData).subscribe({
        next: (updatedUser) => {
          this.loading = false;
          this.successMessage = 'Profile updated successfully!';
          const currentSession = this.authService.getCurrentUser();
          if (currentSession && Number(currentSession.id) === Number(updatedUser.id)) {
            const newAuthSession: any = {
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
            }, 1200);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || err.error?.message || 'Profile update failed. Please try again.';
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
      undefined,
      this.model.username.trim()
    ).subscribe({
      next: (user) => {
        this.loading = false;
        this.createdUser = user;
        this.successMessage = `User registered successfully! Username: ${user.username || user.email.split('@')[0]}`;
        this.model = { username: '', email: '', password: '', confirm_password: '', date_of_birth: '' };
        this.checkPasswordStrength('');
        this.userService.notifyUserAdded();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
