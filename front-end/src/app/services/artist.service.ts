import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MongoResponse } from '../database-entities/mongo_response';
import { Artist } from '../database-entities/artist';
import { Song } from '../database-entities/song';
import { Album } from '../database-entities/album';

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

  getArtistByName(name: string): Observable<Artist> {
    return this.http.get<MongoResponse>(`${this.artist_address}/${name}`).pipe(
      tap((response) =>
        console.log(
          'HTTP status code:',
          response.code,
          'message:',
          response.message
        )
      ),
      map((response) => response.data as Artist)
    );
  }

  getArtistSongs(name: string): Observable<Song[]> {
    return this.http.get<MongoResponse>(`${this.artist_address}/${name}/songs`).pipe(
        map((response) => response.data as Song[])
    )
  }

  getArtistAlbums(name: string): Observable<Album[]> {
    return this.http.get<MongoResponse>(`${this.artist_address}/${name}/albums`).pipe(
        map((response) => response.data as Album[])
    )
  }

  getArtistLogo(name: string): Observable<Blob> {
    return this.http.get(`${this.artist_address}/${name}/logo`, {
      responseType: 'blob',
    });
  }
}
