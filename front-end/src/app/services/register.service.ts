import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MongoResponse } from '../database-entities/mongo_response';
import { User } from '../database-entities/user';
import { UserRegister } from '../database-entities/user_register';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  constructor(private http:HttpClient) { }

  register(user: UserRegister): Observable<User> {
    return this.http.post<MongoResponse>(`${environment.backend_address}/users`, user).pipe(
      map(resp => resp.data as User)
    )
  }
}