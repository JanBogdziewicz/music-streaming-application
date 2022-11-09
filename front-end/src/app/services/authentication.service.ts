import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Emitter } from '../authEmitter';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private router: Router) { }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    Emitter.authEmitter.emit(false);
    this.router.navigate(['/login']);
  }
}
