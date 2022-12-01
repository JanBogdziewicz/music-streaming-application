import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Album } from '../database-entities/album';
import { Artist } from '../database-entities/artist';
import { Listening } from '../database-entities/listening';
import { MongoResponse } from '../database-entities/mongo_response';
import { Playlist } from '../database-entities/playlist';
import { Song } from '../database-entities/song';
import { UpdateUser } from '../database-entities/update_user';
import { User } from '../database-entities/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user_address: string = `${environment.backend_address}/users`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<User> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}`)
      .pipe(map((response) => response.data as User));
  }

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

  getUserPlaylists(username: string): Observable<Playlist[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/playlists`)
      .pipe(map((response) => response.data as Playlist[]));
  }

  getUserListenings(username: string): Observable<Listening[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/listenings`)
      .pipe(map((response) => response.data as Listening[]));
  }

  getUserQueueSongs(username: string): Observable<Song[]> {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/queue/songs`)
      .pipe(map((response) => response.data as Song[]));
  }

  getUserAvatar(username: string): Observable<Blob> {
    return this.http.get(`${this.user_address}/${username}/avatar`, {
      responseType: 'blob',
    });
  }

  addToQueue(username: string, song_ids: string[]) {
    return this.http
      .post<MongoResponse>(
        `${this.user_address}/${username}/queue/append`,
        song_ids,
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }

  removeFromQueue(username: string, song_ids: number[]) {
    return this.http
      .post<MongoResponse>(
        `${this.user_address}/${username}/queue/pull`,
        song_ids,
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }

  addToLibrary(username: string, ids: string[], collection_name: string) {
    return this.http
      .put<MongoResponse>(
        `${this.user_address}/${username}/library/append`,
        {
          collection_name: collection_name,
          item_ids: ids,
        },
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }

  removeFromLibrary(username: string, ids: string[], collection_name: string) {
    return this.http
      .put<MongoResponse>(
        `${this.user_address}/${username}/library/pull`,
        {
          collection_name: collection_name,
          item_ids: ids,
        },
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }

  updateUser(id: string, user: UpdateUser) {
    return this.http
      .put<MongoResponse>(`${this.user_address}/${id}`, user, this.httpOptions)
      .pipe(map((response) => response.data as string));
  }

  updateUserAvatar(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .put<MongoResponse>(`${this.user_address}/${id}/avatar`, formData)
      .pipe(map((response) => response.data as string));
  }

  popQueue(username: string) {
    return this.http
      .get<MongoResponse>(`${this.user_address}/${username}/queue/pop`)
      .pipe(map((response) => response.data as Song));
  }

  prependQueue(username: string, song_id: string[]) {
    return this.http
      .post<MongoResponse>(
        `${this.user_address}/${username}/queue/prepend`,
        song_id,
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }
}
