import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationService } from '../services/register.service';
import { UserRegister } from '../database-entities/user_register';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Country, getData } from 'country-list';
import { LoginService } from '../services/login.service';
import { Emitter } from '../authEmitter';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 12)
  );

  registerForm: FormGroup;
  hide = true;

  public countries: Country[] = getData();

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private registerService: RegistrationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      birth_date: [
        this.maxDate.toISOString().slice(0, 10),
        Validators.required,
      ],
      country: ['', Validators.required],
    });
  }

  register() {
    const formValue = this.registerForm.value;
    const user: UserRegister = {
      username: formValue.username,
      password: formValue.password,
      birth_date: formValue.birth_date,
      country: formValue.country,
    };

    if (!user.username.length) {
      this.openSnackBar('Please specify the username', 'OK');
      return;
    }
    if (user.password.length < 6) {
      this.openSnackBar('Password has to have at least 6 characters', 'OK');
      return;
    }
    if (new Date(user.birth_date).getTime() > this.maxDate.getTime()) {
      this.openSnackBar('User has to be 12 years or older', 'OK');
      return;
    }
    if (!user.country.length) {
      this.openSnackBar('Please specify the country', 'OK');
      return;
    }

    this.registerService.register(user).subscribe({
      next: () => {
        this.openSnackBar('Account created successfully. Logging in...', 'OK');
        this.login(user.username, user.password);
      },
      error: (err) => {
        if (err.error.error === 'DuplicateKeyError')
          this.openSnackBar(
            'User with such name already exists! Try something else.',
            'OK'
          );
        else this.openSnackBar('Something went wrong!!', 'OK');
      },
    });
  }

  login(username: string, password: string) {
    this.loginService.login(username, password).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.access_token);
        Emitter.authEmitter.emit(true);
        this.router.navigate(['/']);
      },
      error: () => {
        this.openSnackBar('Wrong username or password!', 'OK');
      },
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }
}
