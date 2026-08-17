import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { AuthService, AuthUser } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: AuthUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    date_of_birth: '1990-01-01',
    role: 'admin',
    status: 'active'
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with no user if localStorage is empty', () => {
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
    expect(service.isSuperAdmin()).toBeFalse();
    expect(service.getRole()).toBeNull();
  });

  it('should load user from localStorage if present', () => {
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    // Re-instantiate service manually to trigger constructor logic
    const httpClient = TestBed.inject(HttpClient);
    const newService = new AuthService(httpClient);

    expect(newService.getCurrentUser()).toEqual(mockUser);
    expect(newService.isAuthenticated()).toBeTrue();
    expect(newService.isAdmin()).toBeTrue();
    expect(newService.isSuperAdmin()).toBeFalse();
    expect(newService.getRole()).toBe('admin');
  });

  it('should clear invalid localStorage data safely', () => {
    localStorage.setItem('currentUser', '{ invalid_json');
    const httpClient = TestBed.inject(HttpClient);
    const newService = new AuthService(httpClient);

    expect(newService.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('should emit profileModalRequested$ when requestProfileModal is called', (done) => {
    service.profileModalRequested$.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });
    service.requestProfileModal();
  });

  describe('login', () => {
    it('should send POST request, store user in localStorage, and update currentUserSubject', () => {
      service.login('admin@example.com', 'password123').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(service.getCurrentUser()).toEqual(mockUser);
        expect(JSON.parse(localStorage.getItem('currentUser')!)).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ identifier: 'admin@example.com', password: 'password123' });
      req.flush(mockUser);
    });
  });

  describe('logout', () => {
    it('should remove user from localStorage and clear currentUserSubject', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('adminOriginalUser', JSON.stringify(mockUser));
      const httpClient = TestBed.inject(HttpClient);
      const testService = new AuthService(httpClient);

      testService.logout();

      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('adminOriginalUser')).toBeNull();
      expect(testService.getCurrentUser()).toBeNull();
      expect(testService.isAuthenticated()).toBeFalse();
    });
  });

  describe('updateCurrentUserSession', () => {
    it('should merge updated properties into current user and update localStorage', () => {
      // Setup initial state
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const httpClient = TestBed.inject(HttpClient);
      const testService = new AuthService(httpClient);

      const updateData: AuthUser = {
        id: 1,
        username: 'admin_updated',
        email: 'admin_updated@example.com',
        date_of_birth: '1990-01-01',
        role: 'admin',
        status: 'active'
      };

      testService.updateCurrentUserSession(updateData);

      const currentUser = testService.getCurrentUser();
      expect(currentUser?.username).toBe('admin_updated');
      expect(currentUser?.email).toBe('admin_updated@example.com');
      
      const storedUser = JSON.parse(localStorage.getItem('currentUser')!);
      expect(storedUser.username).toBe('admin_updated');
    });

    it('should generate a username from email if username is missing', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const httpClient = TestBed.inject(HttpClient);
      const testService = new AuthService(httpClient);

      const updateData = {
        id: 1,
        email: 'newemail@example.com',
        username: '',
        date_of_birth: '',
        role: 'admin' as const,
        status: 'active' as const
      };

      testService.updateCurrentUserSession(updateData);
      const currentUser = testService.getCurrentUser();
      expect(currentUser?.username).toBe('newemail');
    });

    it('should generate a username from "user" if both username and email are missing', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const httpClient = TestBed.inject(HttpClient);
      const testService = new AuthService(httpClient);

      const updateData: AuthUser = {
        id: 1,
        username: '',
        email: '',
        date_of_birth: '',
        role: 'admin',
        status: 'active'
      };

      testService.updateCurrentUserSession(updateData);
      const currentUser = testService.getCurrentUser();
      expect(currentUser?.username).toBe('user');
    });

    it('should not update session if user IDs and emails do not match', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const httpClient = TestBed.inject(HttpClient);
      const testService = new AuthService(httpClient);

      const updateData: AuthUser = {
        id: 2,
        username: 'someone',
        email: 'someone@example.com',
        date_of_birth: '1990-01-01',
        role: 'user',
        status: 'active'
      };

      testService.updateCurrentUserSession(updateData);
      expect(testService.getCurrentUser()?.id).toBe(1); // Still the original user
    });
  });
});
