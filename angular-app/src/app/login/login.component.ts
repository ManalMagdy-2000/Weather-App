import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { AlertService } from '../alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertService: AlertService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  loginUser() {
    // Reset error message before login attempt
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      // Check if the form is invalid (e.g., required fields are empty)
      return;
    }

    const { username, password } = this.loginForm.value;
    this.apiService.loginUser({ username, password }).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        this.alertService.showSuccess('Login Successfully.');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Login error:', error);
        if (error.status === 404) {
          this.errorMessage = 'Username not found! Please register first.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid credentials! Please check your username and password.';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
      }
    );
  }
}
