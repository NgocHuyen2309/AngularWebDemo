import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt?: Table;
  users: User[] = [];
  loading = false;
  error = '';
  sub?: Subscription;

  editingUser: User | null = null;
  editForm = new FormGroup({});
  editModel: Partial<User> = { username: '', email: '', date_of_birth: '' };
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

  confirmModalOpen = false;
  confirmActionType: 'update' | 'delete' | null = null;
  confirmTargetId: number | null = null;
  confirmTitle = '';
  confirmMessage = '';

  get editingId(): number | null {
    return this.editingUser ? this.editingUser.id : null;
  }
  get editEmail(): string {
    return this.editModel.email || '';
  }
  set editEmail(val: string) {
    this.editModel.email = val;
  }
  get editDob(): string {
    return this.editModel.date_of_birth || '';
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
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
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

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.dt) {
      this.dt.filterGlobal(value, 'contains');
    }
  }

  toggleLockUser(user: User): void {
    if (!this.isAdmin()) return;
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          this.users[idx].status = updated.status;
        }
        this.messageService.add({
          severity: 'success',
          summary: newStatus === 'locked' ? 'Account Locked' : 'Account Activated',
          detail: `User #${user.id} (${user.username}) is now ${newStatus}.`
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Status Change Failed',
          detail: err.error?.error || 'Could not update account status.'
        });
      }
    });
  }

  changeUserRole(user: User, newRole: string): void {
    if (!this.isSuperAdmin()) return;
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          this.users[idx].role = updated.role;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Role Changed',
          detail: `User #${user.id} role updated to ${newRole.replace('_', ' ').toUpperCase()}.`
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Role Update Failed',
          detail: err.error?.error || 'Could not change account role.'
        });
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getUsers().subscribe({
      next: (data) => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          const foundSelf = data.find(u => Number(u.id) === Number(currentUser.id) || u.email === currentUser.email);
          if (foundSelf && foundSelf.role !== currentUser.role) {
            this.authService.updateCurrentUserSession(foundSelf);
          }
        }
        if (this.authService.isAdmin() || !currentUser) {
          this.users = data;
        } else {
          this.users = data.filter(u => Number(u.id) === Number(currentUser.id) || u.email === currentUser.email);
        }
        this.loading = false;
      },
      error: () => {
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User profile updated successfully!'
        });
        this.userService.notifyUserAdded();

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
        this.editError = err.error?.error || 'Failed to update user.';
      }
    });
  }

  private performDeleteUser(id: number) {
    this.userService.deleteUser(id)
      .pipe(finalize(() => this.loadUsers()))
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'User account permanently deleted.'
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: err.error?.error || 'Could not delete user account.'
          });
        }
      });
  }
}
