import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Album } from '../database-entities/album';
import { MongoResponse } from '../database-entities/mongo_response';
import { Song } from '../database-entities/song';
import { AudioService } from './audio.service';
import { SongEmitter } from '../currentSongEmitter';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  song_address: string = `${environment.backend_address}/songs`;

  constructor(private http: HttpClient, private audio: AudioService) {}

  getSongs(): Observable<Song[]> {
    return this.http.get<MongoResponse>(`${this.song_address}`).pipe(
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

  getSong(id: string): Observable<Song> {
    return this.http.get<MongoResponse>(`${this.song_address}/${id}`).pipe(
      tap((response) => console.log(response)),
      map((response) => response.data as Song)
    );
  }

  getSongCover(id: string): Observable<Blob> {
    return this.http.get(`${this.song_address}/${id}/cover`, {
      responseType: 'blob',
    });
  }

  getSongAlbum(id: string): Observable<Album> {
    return this.http
      .get<MongoResponse>(`${this.song_address}/${id}/album`)
      .pipe(map((response) => response.data as Album));
  }

  playSong(id: string, addToHistory: boolean = true, forceChange = false) {
    SongEmitter.currentSongEmitter.emit(id);
    return this.audio.loadSong(id, addToHistory, forceChange);
  }
}
