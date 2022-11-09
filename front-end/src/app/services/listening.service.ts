import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MongoResponse } from '../database-entities/mongo_response';
import { Listening } from '../database-entities/listening';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ListeningService {
  listening_address: string = `${environment.backend_address}/listenings`;

  constructor(private http: HttpClient) {}

  getListenings(): Observable<Listening[]> {
    return this.http
      .get<MongoResponse>(this.listening_address)
      .pipe(map((response) => response.data as Listening[]));
  }
}
