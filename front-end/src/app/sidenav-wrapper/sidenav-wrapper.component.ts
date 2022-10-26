import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistService } from '../playlist.service';
import { Playlist } from '../database-entities/playlists';
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
    console.log("NO CO JEST");
    //this.router.navigate([`/explore`]);
    this.router.navigate([`/playlist/${playlist.id}`]);
  }
}
