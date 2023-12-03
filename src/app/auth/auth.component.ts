import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterationService } from './registeration/registeration.service';


function emailValidator(control: AbstractControl): { [key: string]: any } | null {
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value);
  return validFormat ? null : { 'invalidEmail': true };
}

function phoneValidator(control: AbstractControl): { [key: string]: any } | null {
  const validFormat = /^\d{3}-\d{3}-\d{4}$/.test(control.value);
  return validFormat ? null : { 'invalidPhone': true };
}

function zipcodeValidator(control: AbstractControl): { [key: string]: any } | null {
  const validFormat = /^\d{5}$/.test(control.value);
  return validFormat ? null : { 'invalidZipcode': true };
}

function confirmPasswordValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { 'mismatchedPasswords': true };
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;

  users: any[] = [];
  loginError: string = '';
  registerError: string = '';
  usernameError: string = '';

  constructor(private formBuilder: FormBuilder, private router: Router, private registerationService: RegisterationService) { 
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required], 
      email: ['', [Validators.required, emailValidator]],
      zipcode: ['', [Validators.required, zipcodeValidator]],
      phone: ['', [Validators.required, phoneValidator]],
      dateOfBirth: ['']
    }, { validators: confirmPasswordValidator });

  }

  ngOnInit() {

  }

  login() {
    const val = this.loginForm.value;

    if (val.username && val.password) {
      this.registerationService.loginUser(val.username, val.password).subscribe(
        response => {
          if (response.result === "success") {
            this.registerationService.setCurrentUser({
              username: response.username,
              password: '*'.repeat(val.password.length)
            });

            this.router.navigate(['/main']);
          } else {
            this.loginError = 'Invalid username or password';
          }
        },
        error => {
          // Handle the error based on the error status code
          if(error.status === 401) {
            this.loginError = 'Invalid username or password';
          } else {
            this.loginError = 'Login failed. Please try again.';
          }
        }
      );
    } else {
      this.loginError = 'Please enter both username and password';
    }
  }

  register() {
    if (this.registerForm.valid) {
      const newUser = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        dob: this.registerForm.value.dateOfBirth,
        phone: this.registerForm.value.phone,
        zipcode: this.registerForm.value.zipcode,
        password: this.registerForm.value.password,
      };
      this.registerationService.registerUser(newUser).subscribe(
        response => {
          if (response.result === 'success') {
             this.registerationService.setCurrentUser(response.username);
             this.router.navigate(['/main']);
          }
        },
        error => {
          this.registerError = 'Registration failed. Please try again.';
          if (error.error.message) {
            this.registerError = error.error.message; // Display error message from backend if available
          }
        }
      );
    } else {
      this.registerError = 'Please fill in all required fields correctly.';
    }
  }

  loginWithGoogle() {
    // Redirect to your backend route for Google authentication
    window.location.href = 'http://localhost:3000/auth/google';
    // this.router.navigate(['/main']); 
  }
}  