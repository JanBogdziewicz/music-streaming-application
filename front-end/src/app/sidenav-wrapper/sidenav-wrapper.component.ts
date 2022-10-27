import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistService } from '../services/playlist.service';
import { Playlist } from '../database-entities/playlist';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav-wrapper',
  templateUrl: './sidenav-wrapper.component.html',
  styleUrls: ['./sidenav-wrapper.component.css'],
})
export class SidenavWrapperComponent implements OnInit {
  isExpanded: boolean = false;
  playlists$!: Observable<Playlist[]>

  constructor(
    private playlistService: PlaylistService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playlists$ = this.playlistService.getPlaylists()
  }

  goToPlaylist(playlist: Playlist) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
        this.router.navigate([`/playlist/${playlist.id}`])
    );
  }
}
