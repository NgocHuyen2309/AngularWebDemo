import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface User {
  id: number;
  username?: string;
  email: string;
  date_of_birth: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api/users';
  userAdded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  notifyUserAdded(): void {
    this.userAdded$.next();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(email: string, password: string, confirmPassword: string, dateOfBirth: string, role?: string, username?: string): Observable<User> {
    return this.http.post<User>(this.apiUrl, {
      username,
      email,
      password,
      confirm_password: confirmPassword,
      date_of_birth: dateOfBirth,
      role
    });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
