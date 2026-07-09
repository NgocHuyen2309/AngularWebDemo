import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.less'
})
export class UserFormComponent {
  email = '';
  dateOfBirth = '';
  successMessage = '';
  errorMessage = '';
  createdUser: User | null = null;

  constructor(private userService: UserService) {}

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.createdUser = null;

    if (!this.email || !this.dateOfBirth) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.userService.createUser(this.email, this.dateOfBirth).subscribe({
      next: (user) => {
        this.createdUser = user;
        this.successMessage = `User registered successfully! ID: ${user.id}`;
        this.email = '';
        this.dateOfBirth = '';
        this.userService.notifyUserAdded();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
