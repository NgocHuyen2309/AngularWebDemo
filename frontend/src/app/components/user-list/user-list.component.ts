import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.less'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  error = '';
  private sub?: Subscription;

  // Editing state
  editingId: number | null = null;
  editEmail = '';
  editDob = '';
  updating = false;
  editError = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.sub = this.userService.userAdded$.subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user account list.';
        this.loading = false;
      }
    });
  }

  startEdit(user: User): void {
    this.editingId = user.id;
    this.editEmail = user.email;
    if (user.date_of_birth) {
      const d = new Date(user.date_of_birth);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        this.editDob = `${year}-${month}-${day}`;
      } else {
        this.editDob = user.date_of_birth.substring(0, 10);
      }
    } else {
      this.editDob = '';
    }
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editEmail = '';
    this.editDob = '';
    this.editError = '';
  }

  saveEdit(id: number): void {
    if (!this.editEmail || !this.editDob) {
      this.editError = 'Please fill in both Email and Date of Birth.';
      return;
    }

    this.updating = true;
    this.editError = '';

    this.userService.updateUser(id, {
      email: this.editEmail,
      date_of_birth: this.editDob
    }).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.updating = false;
        this.cancelEdit();
        this.userService.notifyUserAdded();
      },
      error: (err) => {
        this.updating = false;
        this.editError = err.error?.error || 'Failed to update user.';
      }
    });
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
      },
      error: () => {
        this.loadUsers();
      }
    });
  }
}
