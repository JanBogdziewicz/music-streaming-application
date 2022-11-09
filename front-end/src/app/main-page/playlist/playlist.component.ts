import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Observable } from 'rxjs';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  playlist$!: Observable<Playlist>
  playlist: Playlist = {} as Playlist;
  playlist_songs$!: Observable<Song[]>
  playlist_songs: Song[]

  constructor(private route: ActivatedRoute, private playlistService: PlaylistService) { }

  ngOnInit(): void {
    this.playlist$ = this.getPlaylist();
    this.playlist$.subscribe(res => this.playlist = res);

    this.playlist_songs$ = this.getPlaylistSongs();
    this.playlist_songs$.subscribe(res => this.playlist_songs = res);
  }

  getPlaylist() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.playlistService.getPlaylistById(id);
  }

  getPlaylistSongs() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.playlistService.getAllPlaylistSongs(id);
  }
}
