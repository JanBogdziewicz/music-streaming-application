import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Album } from '../database-entities/album';
import { Artist } from '../database-entities/artist';
import { MongoResponse } from '../database-entities/mongo_response';
import { Playlist } from '../database-entities/playlist';
import { Song } from '../database-entities/song';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user_address: string = `${environment.backend_address}/users`;

  constructor(private http: HttpClient) {}

  getUserLibraryPlaylists(username: string): Observable<Playlist[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/library/playlists`)
      .pipe(map((response) => response.data as Playlist[]));
  }

  getUserLibraryAlbums(username: string): Observable<Album[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/library/albums`)
      .pipe(map((response) => response.data as Album[]));
  }

  getUserLibraryArtists(username: string): Observable<Artist[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/library/artists`)
      .pipe(map((response) => response.data as Artist[]));
  }

  getUserLibrarySongs(username: string): Observable<Song[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/library/songs`)
      .pipe(map((response) => response.data as Song[]));
  }
}
