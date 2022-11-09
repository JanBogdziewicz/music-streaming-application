import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationService } from '../services/register.service';
import { User } from '../database-entities/user';
import { UserRegister } from '../database-entities/user_register';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  registerForm: FormGroup
  success = false;
  errMessage = '';
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private registerService: RegistrationService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      birth_date: ['', Validators.required],
      country: ['', Validators.required]
    })
  }

  register() {
    const formValue = this.registerForm.value
    const user: UserRegister = {
      username: formValue.username,
      password: formValue.password,
      birth_date: formValue.birth_date,
      country: formValue.country
    }
    this.registerService.register(user).subscribe({
      next: () => {
        this.success = true
      },
      error: (err) => {
      if(err.error.code == 11000)
        this.errMessage = 'User already exists!! Try something else.'
      else 
        this.errMessage = 'Something went wrong!!'
      }
    })
  }
}