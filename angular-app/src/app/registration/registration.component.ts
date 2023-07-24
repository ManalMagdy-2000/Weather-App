import { Component } from '@angular/core';
import { ApiService } from '../api.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  user = { username: '', email: '', password: '' };

  constructor(private apiService: ApiService, private router: Router) {}

  registerUser() {
    this.apiService.registerUser(this.user).subscribe(
      () => {
        console.log('Registration successful.');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Registration error:', error);
      }
    );
  }
}
