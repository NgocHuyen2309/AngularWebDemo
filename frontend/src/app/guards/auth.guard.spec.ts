import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  const runGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => authGuard(route, state));

  it('should return true if user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const mockRoute = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], { url: [] });
    const mockState = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], { url: '/protected', root: mockRoute });
    const result = runGuard(mockRoute, mockState);
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login with returnUrl if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const mockRoute = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], { url: [] });
    const mockState = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], { url: '/protected', root: mockRoute });
    const result = runGuard(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/protected' } });
  });
});
