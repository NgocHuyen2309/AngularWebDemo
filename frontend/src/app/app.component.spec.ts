import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService, AuthUser } from './services/auth.service';
import { BehaviorSubject, Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let mockCurrentUser$: BehaviorSubject<AuthUser | null>;
  let mockProfileModalRequested$: Subject<void>;

  beforeEach(async () => {
    mockCurrentUser$ = new BehaviorSubject<AuthUser | null>(null);
    mockProfileModalRequested$ = new Subject();

    const authSpy = jasmine.createSpyObj('AuthService', ['logout', 'updateCurrentUserSession']);
    authSpy.currentUser$ = mockCurrentUser$.asObservable();
    authSpy.profileModalRequested$ = mockProfileModalRequested$.asObservable();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the title 'Crown & Velvet'`, () => {
    expect(component.title).toEqual('Crown & Velvet');
  });

  it('should render the navbar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  it('should render the router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should update user state on init when user is logged in', () => {
    const mockUser: AuthUser = { id: 1, email: 'test@gmail.com', role: 'admin', username: 'test', date_of_birth: '2000-01-01', status: 'active' };
    mockCurrentUser$.next(mockUser);
    expect(component.currentUser).toEqual(mockUser);
    expect(component.isLoggedIn).toBeTrue();
    expect(component.userRole).toBe('admin');
  });

  it('should open profile modal when requested by auth service', () => {
    spyOn(component, 'setProfileModalState');
    mockProfileModalRequested$.next();
    expect(component.setProfileModalState).toHaveBeenCalledWith(true);
  });

  it('should lock document body scroll when profile modal opens', () => {
    component.setProfileModalState(true);
    expect(component.showProfileModal).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should unlock document body scroll when profile modal closes and change password modal is closed', () => {
    component.showChangePasswordModal = false;
    document.body.style.overflow = 'hidden';
    component.setProfileModalState(false);
    expect(component.showProfileModal).toBeFalse();
    expect(document.body.style.overflow).toBe('');
  });

  it('should not unlock body scroll when profile modal closes if change password modal is open', () => {
    component.showChangePasswordModal = true;
    document.body.style.overflow = 'hidden';
    component.setProfileModalState(false);
    expect(component.showProfileModal).toBeFalse();
    expect(document.body.style.overflow).toBe('hidden'); // should remain hidden
  });

  it('should lock document body scroll when change password modal opens', () => {
    component.setChangePasswordModalState(true);
    expect(component.showChangePasswordModal).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should unlock document body scroll when change password modal closes and profile modal is closed', () => {
    component.showProfileModal = false;
    document.body.style.overflow = 'hidden';
    component.setChangePasswordModalState(false);
    expect(component.showChangePasswordModal).toBeFalse();
    expect(document.body.style.overflow).toBe('');
  });

  it('should not unlock body scroll when change password modal closes if profile modal is open', () => {
    component.showProfileModal = true;
    document.body.style.overflow = 'hidden';
    component.setChangePasswordModalState(false);
    expect(component.showChangePasswordModal).toBeFalse();
    expect(document.body.style.overflow).toBe('hidden'); // should remain hidden
  });

  it('should handle logout, close modals and navigate to login', () => {
    spyOn(component, 'setProfileModalState');
    spyOn(component, 'setChangePasswordModalState');
    component.handleLogout();
    expect(component.setProfileModalState).toHaveBeenCalledWith(false);
    expect(component.setChangePasswordModalState).toHaveBeenCalledWith(false);
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should update session when profile is updated for current user', () => {
    component.currentUser = { id: 1, username: 'old', email: 'old@gmail.com', role: 'user', date_of_birth: '2000-01-01', status: 'active' };
    const updatedUser: AuthUser = { id: 1, username: 'newname', email: 'new@gmail.com', role: 'admin', date_of_birth: '2000-01-01', status: 'active' };
    component.onProfileUpdated(updatedUser);
    expect(authServiceSpy.updateCurrentUserSession).toHaveBeenCalled();
    const arg = authServiceSpy.updateCurrentUserSession.calls.mostRecent().args[0];
    expect(arg.username).toBe('newname');
    expect(arg.email).toBe('new@gmail.com');
    expect(arg.role).toBe('admin');
  });

  it('should fallback username to email prefix if username is missing on profile update', () => {
    component.currentUser = { id: 1, username: 'old', email: 'old@gmail.com', role: 'user', date_of_birth: '2000-01-01', status: 'active' };
    const updatedUser: AuthUser = { id: 1, username: '', email: 'new@gmail.com', role: 'user', date_of_birth: '2000-01-01', status: 'active' };
    component.onProfileUpdated(updatedUser);
    const arg = authServiceSpy.updateCurrentUserSession.calls.mostRecent().args[0];
    expect(arg.username).toBe('new');
  });

  it('should not update session if profile updated is for a different user', () => {
    component.currentUser = { id: 1, username: 'old', email: 'old@gmail.com', role: 'user', date_of_birth: '2000-01-01', status: 'active' };
    const updatedUser: AuthUser = { id: 2, username: 'newname', email: 'new@gmail.com', role: 'user', date_of_birth: '2000-01-01', status: 'active' };
    component.onProfileUpdated(updatedUser);
    expect(authServiceSpy.updateCurrentUserSession).not.toHaveBeenCalled();
  });
});
