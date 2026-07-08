import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less'
})
export class NavbarComponent {
  appTitle = 'Angular Demo Store';
  isCollapsed = true;

  toggleNavbar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
