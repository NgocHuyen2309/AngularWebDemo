import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { AuthService, AuthUser } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    UserFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Crown & Velvet';
  currentUser: AuthUser | null = null;
  userRole: string | null = null;
  isLoggedIn = false;
  showProfileModal = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = user !== null;
      this.userRole = user ? user.role : null;
    });
    this.authService.profileModalRequested$.subscribe(() => {
      this.showProfileModal = true;
    });
  }

  handleLogout() {
    this.showProfileModal = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onProfileUpdated(updatedUser: any) {
    if (this.currentUser && Number(this.currentUser.id) === Number(updatedUser.id)) {
      const merged: any = {
        ...this.currentUser,
        ...updatedUser,
        username: updatedUser.username || (updatedUser.email ? updatedUser.email.split('@')[0] : 'user'),
        email: updatedUser.email,
        date_of_birth: updatedUser.date_of_birth
      };
      this.currentUser = merged;
      this.authService.updateCurrentUserSession(merged);
    }
  }
}
