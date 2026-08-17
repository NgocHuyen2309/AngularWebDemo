import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  const runGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => TestBed.runInInjectionContext(() => adminGuard(route, state));

  it('should return true if user is logged in and is admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(true);
    const mockRoute = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], { url: [] });
    const mockState = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], { url: '/admin', root: mockRoute });
    const result = runGuard(mockRoute, mockState);
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should return false and redirect to home if user is not admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(false);
    const mockRoute = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], { url: [] });
    const mockState = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], { url: '/admin', root: mockRoute });
    const result = runGuard(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should return false and redirect to home if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.isAdmin.and.returnValue(false);
    const mockRoute = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], { url: [] });
    const mockState = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], { url: '/admin', root: mockRoute });
    const result = runGuard(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
