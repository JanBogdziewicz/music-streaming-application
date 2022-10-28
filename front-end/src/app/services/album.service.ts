import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MongoResponse } from '../database-entities/mongo_response';
import { Album } from '../database-entities/album';
import { Song } from '../database-entities/song';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  album_address: string = `${environment.backend_address}/albums`

  constructor(private http: HttpClient) { }

  getAlbums(): Observable<Album[]> {
    return this.http.get<MongoResponse>(this.album_address).pipe(
      map(response => response.data as Album[])
    )
  }

  getAlbumById(id: string): Observable<Album> {
    return this.http.get<MongoResponse>(`${this.album_address}/${id}`).pipe(
      tap(response => console.log(response)),
      map(response => response.data as Album)
    )
  }

  getAllAlbumSongs(id: string): Observable<Song[]> {
    return this.http.get<MongoResponse>(`${this.album_address}/${id}/songs`).pipe(
      tap(response => console.log(response)),
      map(response => response.data as Song[])
    )
  }
}
