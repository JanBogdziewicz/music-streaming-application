import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { MongoResponse } from 'src/app/database-entities/mongo_response';
import { Song } from 'src/app/database-entities/song';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExploreService {
  constructor(private http: HttpClient) {}

  getSongs(): Observable<Song[]> {
    return this.http
      .get<MongoResponse>(`${environment.backend_address}/songs/`)
      .pipe(
        tap((response) =>
          console.log(
            'HTTP status code:',
            response.code,
            'message:',
            response.message
          )
        ),
        map((response) => response.data as Song[])
      );
  }

  getAlbums(): Observable<Album[]> {
    return this.http
      .get<MongoResponse>(`${environment.backend_address}/albums/`)
      .pipe(
        tap((response) =>
          console.log(
            'HTTP status code:',
            response.code,
            'message:',
            response.message
          )
        ),
        map((response) => response.data as Album[])
      );
  }

  getArtists(): Observable<Artist[]> {
    return this.http
      .get<MongoResponse>(`${environment.backend_address}/artists/`)
      .pipe(
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

  getSongAlbum(id: string): Observable<Album> {
    return this.http
      .get<MongoResponse>(`${environment.backend_address}/songs/${id}/album/`)
      .pipe(
        tap((response) =>
          console.log(
            'HTTP status code:',
            response.code,
            'message:',
            response.message
          )
        ),
        map((response) => response.data as Album)
      );
  }
}
