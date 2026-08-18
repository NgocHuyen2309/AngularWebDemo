import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  isAdmin = false;

  destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.initUser();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initUser() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAdmin = this.authService.isAdmin();
      });
  }

  onOpenProfile(event?: Event) {
    if (event) event.preventDefault();
    this.authService.requestProfileModal();
  }
}
