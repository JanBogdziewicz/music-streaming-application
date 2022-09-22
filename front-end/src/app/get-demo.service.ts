import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GetDemoService {
  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get('https://api.publicapis.org/entries');
  }
}
