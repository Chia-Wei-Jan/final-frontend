import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile/profile.service';
import { FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule  } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  avatarUrl: string = 'https://brand.rice.edu/sites/g/files/bxs2591/files/2019-08/190308_Rice_Mechanical_Brand_Standards_Logos-2.png'; 
  username: string = '';
  email: string = '';
  zipcode: string = '';
  phone: string = '';
  password: string = '';
  showPassword: string = '';

  selectAvatar: File | null = null;

  profileForm: FormGroup;

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
    // const currentUser = this.registerationService.getCurrentUser();

    // // Default values to prevent possible undefined errors.
    // const defaultUser = {
    //   username: '',
    //   email: '',
    //   phone: '',
    //   address: { zipcode: '' },
    //   avatarUrl: this.avatarUrl,
    //   password: ''
    // };  

    // const user = { ...defaultUser, ...currentUser };

    // this.username = user.username;
    // this.email = user.email;
    // this.phone = user.phone.split(' x')[0];
    // if (this.phone.startsWith('1-')) {
    //   this.phone = this.phone.slice(2); 
    // }

    // if(user.zipcode) {
    //   this.zipcode = user.zipcode;
    // }
    // else {
    //   this.zipcode = user.address.zipcode.split('-')[0]; 
    // }

    // this.avatarUrl = user.avatarUrl;

    // if (user.address && user.address.street) {
    //   this.password = user.address.street;
    // }
    // else {
    //   this.password = user.password;
    // }
  
    // this.showPassword = '*'.repeat(this.password.length);

    // this.profileForm = this.fb.group({
    //   username: [''],
    //   email: ['', [Validators.required, Validators.email]],
    //   zipcode: ['', [Validators.pattern(/^\d{5}$/)]],
    //   phone: ['', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
    //   password: [''],
    //   confirmPassword: ['']
    // }, { validators: this.passwordMatch });
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
  }


  passwordMatch(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
  
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordNotMatch: true };
    }
    return null;
  }

  uploadAvatar(event: Event): void {
    const input = event?.target as HTMLInputElement;
    if(input.files && input.files[0]) {
      this.selectAvatar = input.files[0];
    }
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

    // // Update the fields that have a value entered
    // if (this.profileForm.value.username) {
    //     this.username = this.profileForm.value.username;
    // }
    // if (this.profileForm.value.email) {
    //     this.email = this.profileForm.value.email;
    // }
    // if (this.profileForm.value.zipcode) {
    //     this.zipcode = this.profileForm.value.zipcode;
    // }
    // if (this.profileForm.value.phone) {
    //     this.phone = this.profileForm.value.phone;
    // }
    // if (this.profileForm.controls['password'].value) {
    //   this.showPassword = '*'.repeat(this.profileForm.controls['password'].value.length);
    // }


    if (this.profileForm.value.email && this.profileForm.value.email !== this.email) {
      this.profileService.updateUserEmail(this.profileForm.value.email).subscribe({
        next: (response) => {
          // Handle the response, e.g., updating the email in the component
          this.email = response.email;
        },
        error: (error) => {
          console.error('Error updating email:', error);
          // Handle error scenario, e.g., showing an error message to the user
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
