import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { map, tap, catchError, of, throwError } from 'rxjs';
import { MongoResponse } from '../database-entities/mongo_response';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private http: HttpClient, private authenticationService: AuthenticationService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('veryfing session')
        if (localStorage.getItem('access_token')) {
            return this.http.get<MongoResponse>(`${environment.backend_address}/users/auth/me`).pipe(
                catchError(() => {
                    console.log('token expired, removing token...');
                    this.authenticationService.logout();
                    return of(false)
                }),
                map(resp => true)
            )
        } else {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
    }
}