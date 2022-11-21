import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MongoResponse } from 'src/app/database-entities/mongo_response';
import { Song } from 'src/app/database-entities/song';
import { environment } from 'src/environments/environment';
import { Playlist } from '../database-entities/playlist';
import { UpdatePlaylist } from '../database-entities/update_playlist';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private playlist_address: string = `${environment.backend_address}/playlists`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getPlaylists(): Observable<Playlist[]> {
    return this.http
      .get<MongoResponse>(this.playlist_address)
      .pipe(map((response) => response.data as Playlist[]));
  }

  getPlaylistById(id: string): Observable<Playlist> {
    return this.http.get<MongoResponse>(`${this.playlist_address}/${id}`).pipe(
      tap((response) => console.log(response)),
      map((response) => response.data as Playlist)
    );
  }

  getAllPlaylistSongs(id: string): Observable<Song[]> {
    return this.http
      .get<MongoResponse>(`${this.playlist_address}/${id}/songs`)
      .pipe(
        tap((response) => console.log(response)),
        map((response) => response.data as Song[])
      );
  }

  getPlaylistCover(id: string): Observable<Blob> {
    return this.http.get(`${this.playlist_address}/${id}/cover`, {
      responseType: 'blob',
    });
  }

  addToPlaylist(id: string, song_id: string) {
    return this.http
      .patch<MongoResponse>(
        `${this.playlist_address}/${id}/songs/${song_id}`,
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }

  removeFromPlaylist(id: string, index: number) {
    return this.http
      .delete<MongoResponse>(
        `${this.playlist_address}/${id}/songs/${index}`,
        this.httpOptions
      )
      .pipe(map((response) => response.data as Song));
  }

  removePlaylist(id: string) {
    return this.http
      .delete<MongoResponse>(`${this.playlist_address}/${id}`)
      .pipe(map((response) => response.data as string));
  }

  updatePlaylist(id: string, playlist: UpdatePlaylist) {
    return this.http
      .put<MongoResponse>(
        `${this.playlist_address}/${id}`,
        playlist,
        this.httpOptions
      )
      .pipe(map((response) => response.data as string));
  }

  updatePlaylistCover(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .put<MongoResponse>(`${this.playlist_address}/${id}/cover`, formData)
      .pipe(map((response) => response.data as string));
  }
}
