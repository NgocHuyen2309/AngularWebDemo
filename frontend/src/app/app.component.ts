import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ChangePasswordModalComponent } from './components/change-password-modal/change-password-modal.component';
import { AuthService, AuthUser } from './services/auth.service';
import { User } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    NavbarComponent,
    UserFormComponent,
    ChangePasswordModalComponent
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Crown & Velvet';
  currentUser: AuthUser | null = null;
  userRole: string | null = null;
  isLoggedIn = false;
  showProfileModal = false;
  showChangePasswordModal = false;

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
      this.setProfileModalState(true);
    });
  }

  setProfileModalState(show: boolean) {
    this.showProfileModal = show;
    if (show) {
      document.body.style.overflow = 'hidden';
    } else if (!this.showChangePasswordModal) {
      document.body.style.overflow = '';
    }
  }

  setChangePasswordModalState(show: boolean) {
    this.showChangePasswordModal = show;
    if (show) {
      document.body.style.overflow = 'hidden';
    } else if (!this.showProfileModal) {
      document.body.style.overflow = '';
    }
  }

  handleLogout() {
    this.setProfileModalState(false);
    this.setChangePasswordModalState(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onProfileUpdated(updatedUser: User) {
    if (this.currentUser && Number(this.currentUser.id) === Number(updatedUser.id)) {
      const merged: AuthUser = {
        ...this.currentUser,
        ...updatedUser,
        username: updatedUser.username || (updatedUser.email ? updatedUser.email.split('@')[0] : 'user'),
        email: updatedUser.email,
        date_of_birth: updatedUser.date_of_birth,
        role: (updatedUser.role as 'admin' | 'user') || this.currentUser.role
      };
      this.currentUser = merged;
      this.authService.updateCurrentUserSession(merged);
    }
  }
}
