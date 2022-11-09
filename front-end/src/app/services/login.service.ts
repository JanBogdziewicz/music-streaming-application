import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MongoResponse } from '../database-entities/mongo_response';
import { User } from '../database-entities/user';
import { map } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

interface Login {
  grant_type: string,
  username: string,
  password: string,
  scope: string,
  client_id: string,
  client_secret: string
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  private loginRequest(username: string, password: string): Login {
    return {
      grant_type: "",
      username: username,
      password: password,
      scope: "",
      client_id: "",
      client_secret: ""
    }
  }
  private loginRequest2(username: string, password: string): string {
    return `${username}&${password}`;
  }

  constructor(private http:HttpClient) { }

  login(username: string, password: string): Observable<any> {
    let body = new URLSearchParams();
    body.set("username", username);
    body.set("password", password);
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.http.post<MongoResponse>(
      `${environment.backend_address}/users/login`, 
      body, 
      options
    );
  }
}