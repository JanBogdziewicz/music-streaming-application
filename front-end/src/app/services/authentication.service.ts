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
    Emitter.authEmitter.emit(false);
    this.router.navigate(['/login']);
  }
}
