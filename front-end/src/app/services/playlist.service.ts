import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MongoResponse } from 'src/app/database-entities/mongo_response';
import { Song } from 'src/app/database-entities/song';
import { environment } from 'src/environments/environment';
import { Playlist } from '../database-entities/playlist';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  playlist_address: string = `${environment.backend_address}/playlists`

  constructor(private http: HttpClient) { }

  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<MongoResponse>(this.playlist_address).pipe(
      map(response => response.data as Playlist[])
    )
  }

  getPlaylistById(id: string): Observable<Playlist> {
    return this.http.get<MongoResponse>(`${this.playlist_address}/${id}`).pipe(
      tap(response => console.log(response)),
      map(response => response.data as Playlist)
    )
  }

  getAllPlaylistSongs(id: string): Observable<Song[]> {
    return this.http.get<MongoResponse>(`${this.playlist_address}/${id}/songs`).pipe(
      tap(response => console.log(response)),
      map(response => response.data as Song[])
    )
  }
}
