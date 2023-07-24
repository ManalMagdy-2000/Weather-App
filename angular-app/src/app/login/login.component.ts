import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  loginUser() {
    this.apiService.loginUser(this.credentials).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error || 'An error occurred during login. Please try again.';
      }
    );
  }
}
