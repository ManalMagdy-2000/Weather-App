import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  alertMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[^\s@]+@[^\s@]+\.[^\s@]+$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get username() {
    return this.registrationForm.get('username');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  registerUser() {
    this.alertMessage = '';

    if (this.registrationForm.invalid) {
      this.alertMessage = 'Please enter valid information';
      return;
    }

    this.apiService.registerUser(this.registrationForm.value).subscribe(
      () => {
        console.log('Registration successful.');
        this.alertService.showSuccess('Registration Successful! You can now login.');
        this.router.navigate(['/login']);
        this.alertMessage = '';
      },
      (error) => {
        console.error('Registration error:', error);
        if (error?.error?.error) {
          this.alertMessage = error.error.error; //error message returned from the server
        } else {
          this.alertMessage = 'Registration failed. Please try again.';
        }
      }
    );
  }

}
