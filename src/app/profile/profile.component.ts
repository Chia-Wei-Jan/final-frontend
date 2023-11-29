import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProfileService } from '../profile/profile.service';
import { FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule  } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  avatarUrl: string = ''; 
  username: string = '';
  email: string = '';
  zipcode: string = '';
  phone: string = '';
  password: string = '';
  showPassword: string = '';

  selectedFile: File | null = null;

  profileForm: FormGroup;

 @ViewChild('inputImage') inputImage?: ElementRef;

  constructor(private profileService: ProfileService, private fb: FormBuilder) {
    this.profileForm = new FormGroup({
      username: new FormControl(''),
      email: new FormControl(''),
      zipcode: new FormControl(''),
      phone: new FormControl(''),
      password: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      username: [''], 
      email: ['', [Validators.required, Validators.email]],
      zipcode: ['', [Validators.pattern(/^\d{5}$/)]],
      phone: ['', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatch });
  }

  loadUserProfile() {
    const user = this.profileService.getCurrentUser();
    const username = user.username;

    if (username) {
      this.username = username;
      this.showPassword = user.password;

      this.profileService.getUserEmail(username).subscribe(response => {
        this.email = response.email;
      });

      this.profileService.getUserZipcode(username).subscribe(response => {
        this.zipcode = response.zipcode;
      });

      this.profileService.getUserPhone(username).subscribe(response => {
        this.phone = response.phone;
      });
    }

    this.loadUserAvatar();
  }


  passwordMatch(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
  
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordNotMatch: true };
    }
    return null;
  }

  handleFileInput(event: Event) {
    const element = event.target as HTMLInputElement;
    this.selectedFile = element.files && element.files.length > 0 ? element.files[0] : null;
  }


  uploadAvatar() {
      if (this.selectedFile) {
          this.profileService.updateUserAvatar(this.selectedFile).subscribe(
              response => {
                  this.avatarUrl = response.avatar;
              },
              error => {

              }
          );
      }
  }

  loadUserAvatar() {
    this.profileService.getAvatar(this.username).subscribe(
      response => {
        this.avatarUrl = response.avatar;
      },
      error => {
        console.error('Error fetching avatar:', error);
      }
    );
  }

  updateProfile() {
    let hasError = false;

    if (this.profileForm.controls['username'].value && !this.profileForm.controls['username'].valid) {
        // alert('Username is invalid.');
        hasError = true;
    }
    if (this.profileForm.controls['email'].value && !this.profileForm.controls['email'].valid) {
        //  alert('Please enter a valid email.');
        hasError = true;
    }

    if (this.profileForm.controls['zipcode'].value && !this.profileForm.controls['zipcode'].valid) {
        //  alert('Zipcode must be 5 digits.');
        hasError = true;
    }
    if (this.profileForm.controls['phone'].value && !this.profileForm.controls['phone'].valid) {
        // alert('Phone number must be in the format XXX-XXX-XXXX.');
        hasError = true;
    }
    if (this.profileForm.errors && this.profileForm.errors['passwordNotMatch']) {
      // alert('Passwords do not match.');
      hasError = true;
    }

    if (hasError) {
        return;
    }


    if (this.profileForm.value.email && this.profileForm.value.email !== this.email) {
      this.profileService.updateUserEmail(this.profileForm.value.email).subscribe({
        next: (response) => {
          this.email = response.email;
        },
        error: (error) => {
          console.error('Error updating email:', error);
        }
      });
    }
  
    if (this.profileForm.value.zipcode && this.profileForm.value.zipcode !== this.zipcode) {
      this.profileService.updateUserZipcode(this.profileForm.value.zipcode).subscribe({
        next: (response) => {
          this.zipcode = response.zipcode;
        },
        error: (error) => {
          console.error('Error updating zipcode:', error);
        }
      });
    }
  
    if (this.profileForm.value.phone && this.profileForm.value.phone !== this.phone) {
      this.profileService.updateUserPhone(this.profileForm.value.phone).subscribe({
        next: (response) => {
          this.phone = response.phone;
        },
        error: (error) => {
          console.error('Error updating phone:', error);
        }
      });
    }
  
    if (this.profileForm.controls['password'].value) {
      const passwordValue = this.profileForm.controls['password'].value;
      this.profileService.updateUserPassword(this.profileForm.controls['password'].value).subscribe({
        next: (response) => {
          if (passwordValue) {
            this.showPassword = '*'.repeat(passwordValue.length);
          }
        },
        error: (error) => {
          console.error('Error updating password:', error);
        }
      });
    }

    this.profileForm.reset();
  }
}
