import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, Subject } from 'rxjs';

export interface AuthUser {
  id: number;
  username?: string;
  email: string;
  date_of_birth: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  public profileModalRequested$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  requestProfileModal() {
    this.profileModalRequested$.next();
  }

  private loadUserFromStorage(): AuthUser | null {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.role === 'admin';
  }

  getRole(): 'admin' | 'user' | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  updateCurrentUserSession(updatedUser: AuthUser) {
    if (this.currentUserSubject.value && Number(this.currentUserSubject.value.id) === Number(updatedUser.id)) {
      const merged: AuthUser = {
        ...this.currentUserSubject.value,
        ...updatedUser,
        username: updatedUser.username || (updatedUser.email ? updatedUser.email.split('@')[0] : 'user')
      };
      localStorage.setItem('currentUser', JSON.stringify(merged));
      this.currentUserSubject.next(merged);
    }
  }
}
