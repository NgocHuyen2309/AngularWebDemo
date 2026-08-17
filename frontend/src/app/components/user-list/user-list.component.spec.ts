import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { UserListComponent } from './user-list.component';
import { UserService, User } from '../../services/user.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { of, throwError, Subject } from 'rxjs';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let mockUserAdded$: Subject<void>;
  let mockUsers: User[];

  beforeEach(async () => {
    mockUsers = [
      { id: 1, username: 'admin', email: 'admin@gmail.com', role: 'super_admin', status: 'active', date_of_birth: '1990-01-01' },
      { id: 2, username: 'user1', email: 'user1@gmail.com', role: 'user', status: 'active', date_of_birth: '2000-01-01' },
      { id: 3, username: 'user2', email: 'user2@gmail.com', role: 'user', status: 'locked', date_of_birth: '2005-01-01' }
    ];

    mockUserAdded$ = new Subject<void>();
    const uSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers', 'updateUserStatus', 'updateUserRole', 'updateUser', 'deleteUser', 'notifyUserAdded']);
    uSpy.userAdded$ = mockUserAdded$;
    uSpy.getUsers.and.returnValue(of(mockUsers));

    const aSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAdmin', 'isSuperAdmin', 'getCurrentUser', 'updateCurrentUserSession']);
    aSpy.getCurrentUser.and.returnValue(mockUsers[0] as AuthUser);
    aSpy.isAdmin.and.returnValue(true);
    aSpy.isSuperAdmin.and.returnValue(true);
    const mSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: uSpy },
        { provide: AuthService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    fixture.detectChanges();
  });

  // ─── Component Init ───────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init for admin', () => {
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(3);
  });

  it('should load users and filter to own record for non-admin user', () => {
    // Need a fresh component with non-admin config
    authServiceSpy.isAdmin.and.returnValue(false);
    authServiceSpy.getCurrentUser.and.returnValue(mockUsers[1] as AuthUser);
    const freshFixture = TestBed.createComponent(UserListComponent);
    freshFixture.detectChanges();
    const freshComponent = freshFixture.componentInstance;
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
    expect(freshComponent.users.length).toBe(1);
    expect(freshComponent.users[0].id).toBe(2);
  });

  it('should load and show all users when currentUser is null and user is not admin', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    authServiceSpy.isAdmin.and.returnValue(false);
    const freshFixture = TestBed.createComponent(UserListComponent);
    freshFixture.detectChanges();
    const freshComponent = freshFixture.componentInstance;
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
    expect(freshComponent.users.length).toBe(3);
  });

  it('should update current user session when role has changed remotely', () => {
    // Setup: current user is user[1] with role 'user' but server returns 'admin'
    const dataWithUpdatedRole = mockUsers.map((u, i) =>
      i === 1 ? { ...u, role: 'admin' } : u
    ) as User[];
    authServiceSpy.getCurrentUser.and.returnValue({ ...mockUsers[1], role: 'user' } as AuthUser);
    userServiceSpy.getUsers.and.returnValue(of(dataWithUpdatedRole));
    const freshFixture = TestBed.createComponent(UserListComponent);
    freshFixture.detectChanges();
    expect(authServiceSpy.updateCurrentUserSession).toHaveBeenCalledWith(dataWithUpdatedRole[1] as AuthUser);
  });

  it('should handle error when loading users fails', () => {
    userServiceSpy.getUsers.and.returnValue(throwError(() => new Error('API Error')));
    const freshFixture = TestBed.createComponent(UserListComponent);
    freshFixture.detectChanges();
    const freshComponent = freshFixture.componentInstance;
    expect(freshComponent.error).toBe('Failed to load user account list.');
    expect(freshComponent.loading).toBeFalse();
  });

  it('should reload users when userAdded$ emits', () => {
    expect(userServiceSpy.getUsers.calls.count()).toBe(1);
    mockUserAdded$.next();
    expect(userServiceSpy.getUsers.calls.count()).toBe(2);
  });

  // ─── Inline Edit (startEdit / cancelEdit) ─────────────────────────────────

  it('should populate edit fields when startEdit is called', () => {
    const mockUser: User = { id: 1, username: 'test', email: 'test@gmail.com', date_of_birth: '2000-01-01T00:00:00.000Z', role: 'user', status: 'active' };
    component.startEdit(mockUser);
    expect(component.editingId).toBe(1);
    expect(component.editEmail).toBe('test@gmail.com');
    expect(component.editDob).toBe('2000-01-01');
  });

  it('should clear edit fields when cancelEdit is called', () => {
    component.cancelEdit();
    expect(component.editingId).toBeNull();
    expect(component.editEmail).toBe('');
    expect(component.editDob).toBe('');
  });

  it('should update editModel.email when editEmail setter is used', () => {
    component.editEmail = 'new@gmail.com';
    expect(component.editModel.email).toBe('new@gmail.com');
  });

  it('should update editModel.date_of_birth when editDob setter is used', () => {
    component.editDob = '2005-01-01';
    expect(component.editModel.date_of_birth).toBe('2005-01-01');
  });

  // ─── Global Filter ────────────────────────────────────────────────────────

  it('should call filterGlobal on the table when onGlobalFilter is called', () => {
    component.dt = jasmine.createSpyObj('Table', ['filterGlobal']);
    const mockEvent = { target: { value: 'search term' } } as unknown as Event;
    component.onGlobalFilter(mockEvent);
    expect(component.dt!.filterGlobal).toHaveBeenCalledWith('search term', 'contains');
  });

  it('should not throw when onGlobalFilter is called but dt is undefined', () => {
    component.dt = undefined;
    const mockEvent = { target: { value: 'search term' } } as unknown as Event;
    expect(() => component.onGlobalFilter(mockEvent)).not.toThrow();
  });

  // ─── Toggle Lock ──────────────────────────────────────────────────────────

  it('should lock an active user successfully', () => {
    const updatedUser = { ...mockUsers[1], status: 'locked' } as User;
    userServiceSpy.updateUserStatus.and.returnValue(of(updatedUser));
    component.toggleLockUser(mockUsers[1]);
    expect(userServiceSpy.updateUserStatus).toHaveBeenCalledWith(2, 'locked');
    expect(component.users[1].status).toBe('locked');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success', summary: 'Account Locked' }));
  });

  it('should unlock a locked user successfully', () => {
    const updatedUserActive = { ...mockUsers[2], status: 'active' } as User;
    userServiceSpy.updateUserStatus.and.returnValue(of(updatedUserActive));
    component.toggleLockUser(mockUsers[2]);
    expect(userServiceSpy.updateUserStatus).toHaveBeenCalledWith(3, 'active');
    expect(component.users[2].status).toBe('active');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success', summary: 'Account Activated' }));
  });

  it('should show specific error message when toggle lock fails with API error', () => {
    userServiceSpy.updateUserStatus.and.returnValue(throwError(() => ({ error: { error: 'Update Failed' } })));
    component.toggleLockUser(mockUsers[1]);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Update Failed' }));
  });

  it('should show fallback error message when toggle lock fails without specific message', () => {
    userServiceSpy.updateUserStatus.and.returnValue(throwError(() => ({ error: {} })));
    component.toggleLockUser(mockUsers[1]);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Could not update account status.' }));
  });

  it('should not call updateUserStatus when non-admin tries to toggle lock', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    component.toggleLockUser(mockUsers[1]);
    expect(userServiceSpy.updateUserStatus).not.toHaveBeenCalled();
  });

  // ─── Change Role ──────────────────────────────────────────────────────────

  it('should change user role successfully', () => {
    const updatedUser = { ...mockUsers[1], role: 'admin' } as User;
    userServiceSpy.updateUserRole.and.returnValue(of(updatedUser));
    component.changeUserRole(mockUsers[1], 'admin');
    expect(userServiceSpy.updateUserRole).toHaveBeenCalledWith(2, 'admin');
    expect(component.users[1].role).toBe('admin');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success', summary: 'Role Changed' }));
  });

  it('should show specific error message when role change fails with API error', () => {
    userServiceSpy.updateUserRole.and.returnValue(throwError(() => ({ error: { error: 'Role Change Failed' } })));
    component.changeUserRole(mockUsers[1], 'admin');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Role Change Failed' }));
  });

  it('should show fallback error message when role change fails without specific message', () => {
    userServiceSpy.updateUserRole.and.returnValue(throwError(() => ({ error: {} })));
    component.changeUserRole(mockUsers[1], 'admin');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Could not change account role.' }));
  });

  it('should not call updateUserRole when non-superadmin tries to change role', () => {
    authServiceSpy.isSuperAdmin.and.returnValue(false);
    component.changeUserRole(mockUsers[1], 'admin');
    expect(userServiceSpy.updateUserRole).not.toHaveBeenCalled();
  });

  // ─── Open Edit Modal ──────────────────────────────────────────────────────

  it('should slice first 10 characters for invalid date_of_birth in openEditModal', () => {
    const user = { ...mockUsers[1], date_of_birth: 'invalid-date-string' } as User;
    component.openEditModal(user);
    expect(component.editModel.date_of_birth).toBe('invalid-da');
  });

  it('should use email prefix as username when username is missing in openEditModal', () => {
    const user = { id: 1, email: 'no_name@gmail.com', date_of_birth: '2000-01-01', status: 'active', role: 'user' } as User;
    component.openEditModal(user);
    expect(component.editModel.username).toBe('no_name');
  });

  it('should set empty date_of_birth in editModel when user date_of_birth is empty', () => {
    const user = { id: 1, email: 'test@gmail.com', date_of_birth: '', status: 'active', role: 'user' } as User;
    component.openEditModal(user);
    expect(component.editModel.date_of_birth).toBe('');
  });

  // ─── Confirm Modal ────────────────────────────────────────────────────────

  it('should mark form as touched and not open confirm modal when form is invalid', () => {
    component.editForm = jasmine.createSpyObj('FormGroup', ['markAllAsTouched']);
    Object.defineProperty(component.editForm, 'invalid', { value: true });
    component.requestUpdateConfirmation();
    expect(component.editForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.confirmModalOpen).toBeFalse();
  });

  it('should open confirm modal with update action when form is valid', () => {
    component.editingUser = mockUsers[1] as AuthUser;
    component.editModel = { username: 'user1_edit', email: 'user1@gmail.com', date_of_birth: '2000-01-01' };
    Object.defineProperty(component.editForm, 'invalid', { value: false });
    component.requestUpdateConfirmation();
    expect(component.confirmModalOpen).toBeTrue();
    expect(component.confirmActionType).toBe('update');
    expect(component.confirmTargetId).toBe(2);
  });

  it('should not open confirm modal when editingUser is null', () => {
    component.editingUser = null;
    component.requestUpdateConfirmation();
    expect(component.confirmModalOpen).toBeFalse();
  });

  it('should open confirm modal with delete action when requestDeleteConfirmation is called', () => {
    component.requestDeleteConfirmation(mockUsers[1] as AuthUser);
    expect(component.confirmModalOpen).toBeTrue();
    expect(component.confirmActionType).toBe('delete');
    expect(component.confirmTargetId).toBe(2);
  });

  it('should call performSaveEdit and close modal on confirmed update action', () => {
    component.editingUser = mockUsers[1] as AuthUser;
    component.confirmTargetId = 2;
    component.confirmActionType = 'update';
    spyOn(component, 'performSaveEdit');
    component.executeConfirmedAction();
    expect(component.performSaveEdit).toHaveBeenCalledWith(2);
    expect(component.confirmModalOpen).toBeFalse();
  });

  it('should call performDeleteUser and close modal on confirmed delete action', () => {
    component.confirmTargetId = 2;
    component.confirmActionType = 'delete';
    spyOn(component, 'performDeleteUser');
    component.executeConfirmedAction();
    expect(component.performDeleteUser).toHaveBeenCalledWith(2);
    expect(component.confirmModalOpen).toBeFalse();
  });

  it('should close modal without any action when confirmTargetId is null', () => {
    component.confirmTargetId = null;
    component.confirmActionType = null;
    spyOn(component, 'performSaveEdit');
    spyOn(component, 'performDeleteUser');
    component.executeConfirmedAction();
    expect(component.performSaveEdit).not.toHaveBeenCalled();
    expect(component.performDeleteUser).not.toHaveBeenCalled();
    expect(component.confirmModalOpen).toBeFalse();
  });

  // ─── performSaveEdit ──────────────────────────────────────────────────────

  it('should save edit, update user list and update session when editing current user', () => {
    component.editingUser = mockUsers[0] as AuthUser;
    component.editModel = { username: 'admin_edit', email: 'admin@gmail.com', date_of_birth: '1990-01-01' };
    const updatedUser = { ...mockUsers[0], username: 'admin_edit' } as User;
    userServiceSpy.updateUser.and.returnValue(of(updatedUser));
    component.performSaveEdit(1);
    expect(userServiceSpy.updateUser).toHaveBeenCalled();
    expect(component.users[0].username).toBe('admin_edit');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(userServiceSpy.notifyUserAdded).toHaveBeenCalled();
    expect(authServiceSpy.updateCurrentUserSession).toHaveBeenCalled();
  });

  it('should use email prefix as username in session update when updated username is empty', () => {
    component.editingUser = mockUsers[0] as AuthUser;
    component.editModel = { username: '', email: 'admin@gmail.com', date_of_birth: '1990-01-01' };
    const updatedUser = { ...mockUsers[0], username: '' } as User;
    userServiceSpy.updateUser.and.returnValue(of(updatedUser));
    component.performSaveEdit(1);
    const args = authServiceSpy.updateCurrentUserSession.calls.mostRecent().args[0];
    expect(args.username).toBe('admin');
  });

  it('should fallback to editingUser fields in session update when API response is missing date_of_birth and role', () => {
    component.editingUser = mockUsers[0] as AuthUser;
    component.editModel = { username: 'admin_edit', email: 'admin@gmail.com', date_of_birth: '1990-01-01' };
    const updatedUser = { id: 1, email: 'admin@gmail.com', username: '' } as User;
    userServiceSpy.updateUser.and.returnValue(of(updatedUser));
    component.performSaveEdit(1);
    const args = authServiceSpy.updateCurrentUserSession.calls.mostRecent().args[0];
    expect(args.date_of_birth).toBe('1990-01-01');
    expect(args.role).toBe('super_admin');
  });

  it('should use default username "user" in session update when both username and email are empty', () => {
    component.editingUser = mockUsers[0] as AuthUser;
    component.editModel = { username: 'admin_edit', email: 'admin@gmail.com', date_of_birth: '1990-01-01' };
    const updatedUser = { id: 1, email: '' } as User;
    userServiceSpy.updateUser.and.returnValue(of(updatedUser));
    component.performSaveEdit(1);
    const args = authServiceSpy.updateCurrentUserSession.calls.mostRecent().args[0];
    expect(args.username).toBe('user');
  });

  it('should show specific error message when performSaveEdit fails with API error', () => {
    component.editingUser = mockUsers[1] as AuthUser;
    component.editModel = { username: 'user1_edit', email: 'user1@gmail.com', date_of_birth: '2000-01-01' };
    userServiceSpy.updateUser.and.returnValue(throwError(() => ({ error: { error: 'Update Failed API' } })));
    component.performSaveEdit(2);
    expect(component.updating).toBeFalse();
    expect(component.editError).toBe('Update Failed API');
  });

  it('should show fallback error message when performSaveEdit fails without specific message', () => {
    component.editingUser = mockUsers[1] as AuthUser;
    component.editModel = { username: 'user1_edit', email: 'user1@gmail.com', date_of_birth: '2000-01-01' };
    userServiceSpy.updateUser.and.returnValue(throwError(() => ({ error: {} })));
    component.performSaveEdit(2);
    expect(component.editError).toBe('Failed to update user.');
  });

  // ─── performDeleteUser ────────────────────────────────────────────────────

  it('should delete user and reload list on success', fakeAsync(() => {
    userServiceSpy.deleteUser.and.returnValue(of(undefined));
    userServiceSpy.getUsers.and.returnValue(of(mockUsers.filter(u => u.id !== 2)));
    component.performDeleteUser(2);
    tick();
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(2);
    expect(component.users.length).toBe(2);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success', summary: 'Deleted' }));
    expect(userServiceSpy.getUsers.calls.count()).toBe(2);
  }));

  it('should show specific error message when delete fails with API error', fakeAsync(() => {
    userServiceSpy.deleteUser.and.returnValue(throwError(() => ({ error: { error: 'Delete Failed API' } })));
    component.performDeleteUser(2);
    tick();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Delete Failed API' }));
    expect(userServiceSpy.getUsers.calls.count()).toBe(2);
  }));

  it('should show fallback error message when delete fails without specific message', fakeAsync(() => {
    userServiceSpy.deleteUser.and.returnValue(throwError(() => ({ error: {} })));
    component.performDeleteUser(2);
    tick();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Could not delete user account.' }));
  }));
});
