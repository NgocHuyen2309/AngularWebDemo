import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService, User } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserService
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a user via POST', () => {
    const mockUser: User = {
      id: 1,
      username: 'test',
      email: 'test@example.com',
      date_of_birth: '1990-01-15',
      role: 'user'
    };

    service.createUser('test@example.com', 'SecurePass123!', 'SecurePass123!', '1990-01-15').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: undefined,
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      date_of_birth: '1990-01-15',
      role: undefined
    });
    req.flush(mockUser);
  });

  it('should get a user via GET', () => {
    const mockUser: User = {
      id: 1,
      username: 'test',
      email: 'test@example.com',
      date_of_birth: '1990-01-15',
      role: 'user'
    };

    service.getUser(1).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update a user via PUT', () => {
    const mockUser: User = {
      id: 1,
      username: 'updated',
      email: 'updated@example.com',
      date_of_birth: '1990-01-15',
      role: 'user'
    };

    service.updateUser(1, { email: 'updated@example.com' }).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockUser);
  });

  it('should delete a user via DELETE', () => {
    service.deleteUser(1).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });

  it('should get all users via GET', () => {
    const mockUsers: User[] = [
      { id: 1, username: 'test1', email: 'test1@example.com', date_of_birth: '1990-01-15', role: 'user' }
    ];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should update user role via PUT', () => {
    const mockUser: User = { id: 1, username: 'test1', email: 'test@example.com', date_of_birth: '1990-01-15', role: 'admin' };

    service.updateUserRole(1, 'admin').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/1/role');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ role: 'admin' });
    req.flush(mockUser);
  });

  it('should update user status via PUT', () => {
    const mockUser: User = { id: 1, username: 'test1', email: 'test@example.com', date_of_birth: '1990-01-15', role: 'user', status: 'locked' };

    service.updateUserStatus(1, 'locked').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/1/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'locked' });
    req.flush(mockUser);
  });

  it('should update user password via PUT', () => {
    service.updateUserPassword(1, 'oldpass', 'newpass', 'newpass').subscribe(res => {
      expect(res.message).toBe('Password updated');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/1/password');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ current_password: 'oldpass', new_password: 'newpass', confirm_password: 'newpass' });
    req.flush({ message: 'Password updated' });
  });

  it('should handle getAuthHeaders when localStorage has invalid JSON', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid json {');
    
    service.getUsers().subscribe();
    
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.has('X-Requester-Id')).toBeFalse();
    req.flush([]);
  });

  it('should handle getAuthHeaders when localStorage has valid JSON but no id', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ email: 'test@example.com' }));
    
    service.getUsers().subscribe();
    
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.has('X-Requester-Id')).toBeFalse();
    req.flush([]);
  });

  it('should handle getAuthHeaders when localStorage has valid JSON with id', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ id: 99, email: 'test@example.com' }));
    
    service.getUsers().subscribe();
    
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.get('X-Requester-Id')).toBe('99');
    req.flush([]);
  });
});
