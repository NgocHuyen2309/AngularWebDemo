import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User { 
  id: number;
  username: string;
  email: string;
  date_of_birth: string;
  role: 'user' | 'admin' | 'super_admin' | string;
  status?: 'active' | 'locked';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  userAdded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  notifyUserAdded(): void {
    this.userAdded$.next();
  }

  private getAuthHeaders(): { [header: string]: string } {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.id) {
          return { 'X-Requester-Id': user.id.toString() };
        }
      } catch (e) {
        // ignore
      }
    }
    return {};
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  createUser(email: string, password: string, confirmPassword: string, dateOfBirth: string, role?: string, username?: string): Observable<User> {
    return this.http.post<User>(this.apiUrl, {
      username,
      email,
      password,
      confirm_password: confirmPassword,
      date_of_birth: dateOfBirth,
      role
    }, { headers: this.getAuthHeaders() });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/role`, { role }, { headers: this.getAuthHeaders() });
  }

  updateUserStatus(id: number, status: 'active' | 'locked'): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  updateUserPassword(id: number, currentPassword: string, newPassword: string, confirmPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/password`, {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    }, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
