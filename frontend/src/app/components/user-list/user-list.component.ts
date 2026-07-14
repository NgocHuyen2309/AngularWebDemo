import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  error = '';
  sub?: Subscription;

  // Formly Editing modal / state
  editingUser: User | null = null;
  editForm = new FormGroup({});
  editModel: any = { username: '', email: '', date_of_birth: '' };
  editFields: FormlyFieldConfig[] = [
    {
      key: 'username',
      type: 'input',
      props: {
        label: 'Username',
        required: true,
        placeholder: 'Update username'
      }
    },
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email Address',
        required: true,
        placeholder: 'Update email address'
      },
      validators: {
        validation: ['emailDomain']
      }
    },
    {
      key: 'date_of_birth',
      type: 'input',
      props: {
        label: 'Date of Birth (Age >= 16)',
        type: 'date',
        required: true
      },
      validators: {
        validation: ['ageGate']
      }
    }
  ];
  updating = false;
  editError = '';

  // Confirmation state
  confirmModalOpen = false;
  confirmActionType: 'update' | 'delete' | null = null;
  confirmTargetId: number | null = null;
  confirmTitle = '';
  confirmMessage = '';

  // Backwards compatibility for tests and old references
  get editingId(): number | null {
    return this.editingUser ? this.editingUser.id : null;
  }
  get editEmail(): string {
    return this.editModel.email;
  }
  set editEmail(val: string) {
    this.editModel.email = val;
  }
  get editDob(): string {
    return this.editModel.date_of_birth;
  }
  set editDob(val: string) {
    this.editModel.date_of_birth = val;
  }
  startEdit(user: User): void {
    this.openEditModal(user);
  }
  cancelEdit(): void {
    this.closeEditModal();
  }

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.sub = this.userService.userAdded$.subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getUsers().subscribe({
      next: (data) => {
        const currentUser = this.authService.getCurrentUser();
        if (this.authService.isAdmin() || !currentUser) {
          this.users = data;
        } else {
          this.users = data.filter(u => u.id === currentUser.id || u.email === currentUser.email);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user account list.';
        this.loading = false;
      }
    });
  }

  openEditModal(user: User) {
    this.editingUser = user;
    let formattedDob = '';
    if (user.date_of_birth) {
      const d = new Date(user.date_of_birth);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        formattedDob = `${year}-${month}-${day}`;
      } else {
        formattedDob = user.date_of_birth.substring(0, 10);
      }
    }
    this.editModel = {
      username: user.username || user.email.split('@')[0],
      email: user.email,
      date_of_birth: formattedDob
    };
    this.editError = '';
  }

  closeEditModal() {
    this.editingUser = null;
    this.editModel = { username: '', email: '', date_of_birth: '' };
    this.editForm.reset();
    this.editError = '';
  }

  requestUpdateConfirmation() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    if (!this.editingUser) return;

    this.confirmActionType = 'update';
    this.confirmTargetId = this.editingUser.id;
    this.confirmTitle = 'Confirm Account Update';
    this.confirmMessage = `Are you sure you want to save changes for account #${this.editingUser.id} (${this.editModel.email})?`;
    this.confirmModalOpen = true;
  }

  requestDeleteConfirmation(user: User) {
    this.confirmActionType = 'delete';
    this.confirmTargetId = user.id;
    this.confirmTitle = 'Confirm Account Deletion';
    this.confirmMessage = `Are you sure you want to permanently delete user #${user.id} (${user.email})? This action cannot be undone.`;
    this.confirmModalOpen = true;
  }

  closeConfirmModal() {
    this.confirmModalOpen = false;
    this.confirmActionType = null;
    this.confirmTargetId = null;
  }

  executeConfirmedAction() {
    if (this.confirmActionType === 'update' && this.confirmTargetId && this.editingUser) {
      this.performSaveEdit(this.confirmTargetId);
    } else if (this.confirmActionType === 'delete' && this.confirmTargetId) {
      this.performDeleteUser(this.confirmTargetId);
    }
    this.closeConfirmModal();
  }

  private performSaveEdit(id: number) {
    this.updating = true;
    this.editError = '';

    this.userService.updateUser(id, {
      username: this.editModel.username ? this.editModel.username.trim() : undefined,
      email: this.editModel.email,
      date_of_birth: this.editModel.date_of_birth
    }).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.updating = false;
        this.closeEditModal();
        this.userService.notifyUserAdded();

        // Update current session if the edited user is the logged-in user
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && Number(currentUser.id) === Number(id)) {
          this.authService.updateCurrentUserSession({
            ...currentUser,
            ...updatedUser,
            username: updatedUser.username || (updatedUser.email ? updatedUser.email.split('@')[0] : 'user'),
            email: updatedUser.email,
            date_of_birth: updatedUser.date_of_birth || currentUser.date_of_birth,
            role: (updatedUser.role as 'admin' | 'user') || currentUser.role
          });
        }
      },
      error: (err) => {
        this.updating = false;
        this.editError = err.error?.error || err.error?.message || 'Failed to update user.';
      }
    });
  }

  private performDeleteUser(id: number) {
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
