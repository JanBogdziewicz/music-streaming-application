import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Playlist } from 'src/app/database-entities/playlist';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  playlists$!: Observable<Playlist[]>;
  playlists: Playlist[];

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    this.playlists$ = this.playlistService.getPlaylists();
    this.playlists$.subscribe((res) => (this.playlists = res));
  }
}
