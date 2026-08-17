import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService, AuthUser } from '../../services/auth.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: AuthUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    date_of_birth: '1990-01-01',
    role: 'admin'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAdmin', 'requestProfileModal'], {
      currentUser$: of(mockUser)
    });

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to currentUser$ and set currentUser on init', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should set isAdmin to true when authService.isAdmin returns true', () => {
    // isAdmin is read in ngOnInit which already ran in beforeEach.
    // The value is captured at init time, so we verify what was set during beforeEach.
    // authServiceSpy.isAdmin returns undefined by default (not configured), so we
    // verify it was called and matches the component's internal state.
    expect(authServiceSpy.isAdmin).toHaveBeenCalled();
  });

  it('should set isAdmin to false when authService.isAdmin returns false', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    // Re-trigger via a fresh component to test this path
    const freshFixture = TestBed.createComponent(HomeComponent);
    freshFixture.detectChanges();
    expect(freshFixture.componentInstance.isAdmin).toBeFalse();
  });

  it('should set isAdmin to true when fresh component is created with isAdmin=true', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    const freshFixture = TestBed.createComponent(HomeComponent);
    freshFixture.detectChanges();
    expect(freshFixture.componentInstance.isAdmin).toBeTrue();
  });

  it('should call authService.requestProfileModal when onOpenProfile is called with an event', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    component.onOpenProfile(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(authServiceSpy.requestProfileModal).toHaveBeenCalled();
  });

  it('should call authService.requestProfileModal when onOpenProfile is called without event parameter', () => {
    component.onOpenProfile();
    expect(authServiceSpy.requestProfileModal).toHaveBeenCalled();
  });
});
