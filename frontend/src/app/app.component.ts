import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { SoapInfoComponent } from './components/soap-info/soap-info.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    CatalogComponent,
    UserFormComponent,
    SoapInfoComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'Angular Demo Store';
}
