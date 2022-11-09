import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MongoResponse } from '../database-entities/mongo_response';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  accessHome(): Observable<any> {
    return this.http.get(`${environment.backend_address}/users/auth/me`)
  }
}