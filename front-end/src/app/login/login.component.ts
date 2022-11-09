import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm : FormGroup
  message = '';

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username:['',Validators.required],
      password:['',Validators.required],
    }) 
  }

  login() {
    const formValue = this.loginForm.value
    this.loginService.login(formValue.username,formValue.password).subscribe({
      next: (res) => {
        console.log(res)
        localStorage.setItem('access_token', res.access_token)
        localStorage.setItem('refresh_token', res.refresh_token)
        this.router.navigate(['/'])
      },
      error: (err) => {
        this.message='Wrong username or password!!'
      }
    })
  }

}