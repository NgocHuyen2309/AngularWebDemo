import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  appTitle = 'Crown & Velvet';
  isCollapsed = true;
  isDarkMode = true;

  @Input() userRole: string | null = null;
  @Input() isLoggedIn = false;
  @Input() currentUserEmail: string | null = null;
  @Input() currentUsername: string | null = null;
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() editProfileEvent = new EventEmitter<void>();
  @Output() changePasswordEvent = new EventEmitter<void>();

  dropdownOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  get isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleNavbar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  onEditProfile(event: Event) {
    event.preventDefault();
    this.dropdownOpen = false;
    if (!this.isCollapsed) {
      this.isCollapsed = true;
    }
    this.editProfileEvent.emit();
  }

  onChangePassword(event: Event) {
    event.preventDefault();
    this.dropdownOpen = false;
    if (!this.isCollapsed) {
      this.isCollapsed = true;
    }
    this.changePasswordEvent.emit();
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.isDarkMode = newTheme === 'dark';
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.dropdownOpen = false;
    this.logoutEvent.emit();
  }
}
