import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', [], { url: '/home' });
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } }
      ]
    })
    .compileComponents();

    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to dark theme when localStorage has no theme set', () => {
    // localStorage is clear from beforeEach — detectChanges already ran in beforeEach
    expect(component.isDarkMode).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply light theme when localStorage has theme set to light', () => {
    // Need a fresh component created AFTER setting localStorage
    localStorage.setItem('theme', 'light');
    document.documentElement.removeAttribute('data-theme');

    const freshFixture = TestBed.createComponent(NavbarComponent);
    freshFixture.detectChanges();

    const freshComponent = freshFixture.componentInstance;
    expect(freshComponent.isDarkMode).toBeFalse();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should return false for isLoginRoute when url is /home', () => {
    expect(component.isLoginRoute).toBeFalse();
  });

  it('should return true for isLoginRoute when url is /login', () => {
    Object.defineProperty(routerSpy, 'url', { get: () => '/login', configurable: true });
    expect(component.isLoginRoute).toBeTrue();
  });

  it('should expand navbar when toggleNavbar is called while collapsed', () => {
    expect(component.isCollapsed).toBeTrue();
    component.toggleNavbar();
    expect(component.isCollapsed).toBeFalse();
  });

  it('should collapse navbar when toggleNavbar is called while expanded', () => {
    component.isCollapsed = false;
    component.toggleNavbar();
    expect(component.isCollapsed).toBeTrue();
  });

  it('should open dropdown and prevent default event behavior when toggleDropdown is called', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    spyOn(event, 'stopPropagation');

    expect(component.dropdownOpen).toBeFalse();
    component.toggleDropdown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.dropdownOpen).toBeTrue();
  });

  it('should switch from dark to light theme when toggleTheme is called', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    component.toggleTheme();

    expect(component.isDarkMode).toBeFalse();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should switch from light to dark theme when toggleTheme is called again', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    component.toggleTheme(); // dark -> light

    component.toggleTheme(); // light -> dark

    expect(component.isDarkMode).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should emit editProfileEvent, close dropdown and collapse navbar when navbar is open', () => {
    spyOn(component.editProfileEvent, 'emit');
    const event = new Event('click');
    spyOn(event, 'preventDefault');

    component.dropdownOpen = true;
    component.isCollapsed = false;

    component.onEditProfile(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.isCollapsed).toBeTrue();
    expect(component.editProfileEvent.emit).toHaveBeenCalled();
  });

  it('should emit editProfileEvent and close dropdown without changing isCollapsed when already collapsed', () => {
    spyOn(component.editProfileEvent, 'emit');
    const event = new Event('click');
    spyOn(event, 'preventDefault');

    component.dropdownOpen = true;
    component.isCollapsed = true;

    component.onEditProfile(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.isCollapsed).toBeTrue();
    expect(component.editProfileEvent.emit).toHaveBeenCalled();
  });

  it('should emit changePasswordEvent, close dropdown and collapse navbar when navbar is open', () => {
    spyOn(component.changePasswordEvent, 'emit');
    const event = new Event('click');
    spyOn(event, 'preventDefault');

    component.dropdownOpen = true;
    component.isCollapsed = false;

    component.onChangePassword(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.isCollapsed).toBeTrue();
    expect(component.changePasswordEvent.emit).toHaveBeenCalled();
  });

  it('should emit changePasswordEvent and close dropdown without changing isCollapsed when already collapsed', () => {
    spyOn(component.changePasswordEvent, 'emit');
    const event = new Event('click');
    spyOn(event, 'preventDefault');

    component.dropdownOpen = true;
    component.isCollapsed = true;

    component.onChangePassword(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.isCollapsed).toBeTrue();
    expect(component.changePasswordEvent.emit).toHaveBeenCalled();
  });

  it('should emit logoutEvent and close dropdown when onLogout is called', () => {
    spyOn(component.logoutEvent, 'emit');
    const event = new Event('click');
    spyOn(event, 'preventDefault');

    component.dropdownOpen = true;

    component.onLogout(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.logoutEvent.emit).toHaveBeenCalled();
  });
});
