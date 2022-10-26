import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { MongoResponse } from 'src/app/database-entities/mongo_response';
import { Song } from 'src/app/database-entities/song';
import { Playlist } from './database-entities/playlists';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  constructor(private http: HttpClient) { }

  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<MongoResponse>('http://127.0.0.1:8090/playlists/').pipe(
      map(response => response.data as Playlist[])
    )
  }
}
