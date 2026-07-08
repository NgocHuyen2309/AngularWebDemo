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
      email: 'test@example.com',
      date_of_birth: '1990-01-15'
    };

    service.createUser('test@example.com', '1990-01-15').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      date_of_birth: '1990-01-15'
    });
    req.flush(mockUser);
  });

  it('should get a user via GET', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      date_of_birth: '1990-01-15'
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
      email: 'updated@example.com',
      date_of_birth: '1990-01-15'
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
});
