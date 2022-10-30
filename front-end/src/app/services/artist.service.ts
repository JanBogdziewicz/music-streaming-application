import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MongoResponse } from '../database-entities/mongo_response';
import { Artist } from '../database-entities/artist';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  artist_address = `${environment.backend_address}/artists`;

  constructor(private http: HttpClient) {}

  getArtists(): Observable<Artist[]> {
    return this.http.get<MongoResponse>(`${this.artist_address}`).pipe(
      tap((response) =>
        console.log(
          'HTTP status code:',
          response.code,
          'message:',
          response.message
        )
      ),
      map((response) => response.data as Artist[])
    );
  }

  getArtistLogo(name: string): Observable<Blob> {
    return this.http.get(`${this.artist_address}/${name}/logo`, {
      responseType: 'blob',
    });
  }
}
