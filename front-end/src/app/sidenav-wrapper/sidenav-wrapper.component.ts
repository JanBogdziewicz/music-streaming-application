import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistService } from '../services/playlist.service';
import { Playlist } from '../database-entities/playlist';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Emitter } from '../authEmitter';
import { AuthenticationService } from '../services/authentication.service';
import { getUsernameFromToken } from '../utils/jwt';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-sidenav-wrapper',
  templateUrl: './sidenav-wrapper.component.html',
  styleUrls: ['./sidenav-wrapper.component.css'],
})
export class SidenavWrapperComponent implements OnInit {
  public username: string = getUsernameFromToken();
  public avatar: string;

  public isExpanded: boolean = false;

  private playlists$!: Observable<Playlist[]>;

  public playlists: Playlist[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.playlists$ = this.userService.getUserPlaylists(this.username);
    this.playlists$.subscribe(
      (res) =>
        (this.playlists = res.sort(() => 0.5 - Math.random()).slice(0, 8))
    );

    this.getUserAvatar(this.username);
  }

  ngOnDestroy() {
    URL.revokeObjectURL(this.avatar);
  }

  goToPlaylist(playlist: Playlist) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([`/playlist/${playlist.id}`]));
  }

  createUrl(image: Observable<Blob>) {
    image.subscribe((data) => {
      let url = URL.createObjectURL(data);
      this.avatar = url;
    });
  }

  getUserAvatar(username: string) {
    let image = this.userService.getUserAvatar(username);
    this.createUrl(image);
  }

  logout() {
    this.authenticationService.logout();
  }

  play() {
    this.audioService.play();
  }

  pause() {
    this.audioService.pause();
  }
}
