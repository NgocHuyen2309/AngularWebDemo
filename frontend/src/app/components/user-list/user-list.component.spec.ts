import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start and cancel editing', () => {
    const mockUser = { id: 1, username: 'test', email: 'test@gmail.com', date_of_birth: '2000-01-01T00:00:00.000Z', role: 'user' };
    component.startEdit(mockUser);
    expect(component.editingId).toBe(1);
    expect(component.editEmail).toBe('test@gmail.com');
    expect(component.editDob).toBe('2000-01-01');

    component.cancelEdit();
    expect(component.editingId).toBeNull();
    expect(component.editEmail).toBe('');
    expect(component.editDob).toBe('');
  });
});
