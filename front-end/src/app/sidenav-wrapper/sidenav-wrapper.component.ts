import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistService } from '../services/playlist.service';
import { Playlist } from '../database-entities/playlist';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Emitter } from '../authEmitter';
import { AuthenticationService } from '../services/authentication.service';
import { getUsernameFromToken } from '../utils/jwt';
import { AudioService, StreamState } from '../services/audio.service';
import { MatSliderChange } from '@angular/material/slider';
import { SongService } from '../services/song.service';
import { Song } from '../database-entities/song';
import { SongEmitter } from '../currentSongEmitter';

@Component({
  selector: 'app-sidenav-wrapper',
  templateUrl: './sidenav-wrapper.component.html',
  styleUrls: ['./sidenav-wrapper.component.css'],
})
export class SidenavWrapperComponent implements OnInit {
  public username: string = getUsernameFromToken();
  public avatar: string;
  public song_image: string;
  public current_song_id: string;
  public song_emitter: EventEmitter<string>;
  public isExpanded: boolean = false;
  private playlists$!: Observable<Playlist[]>;
  public playlists: Playlist[] = [];
  public state: StreamState;
  public current_song: Song = {} as Song;

  currentFile: any = {};

  constructor(
    private userService: UserService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private audioService: AudioService,
    private songService: SongService
  ) {}

  ngOnInit(): void {
    this.song_emitter = SongEmitter.currentSongEmitter;
    this.song_emitter.subscribe(next => {
      this.current_song_id = next;
      this.songService.getSong(next).subscribe(val => {
        this.current_song = val;
      });
      this.getCurrentSongImage();
    })
    this.playlists$ = this.userService.getUserPlaylists(this.username);
    this.playlists$.subscribe(
      (res) =>
        (this.playlists = res.sort(() => 0.5 - Math.random()).slice(0, 12))
    );
    this.audioService.getState().subscribe((state) => {
      this.state = state;
    });
    this.getUserAvatar(this.username);
    this.getCurrentSongImage();
  }

  ngOnDestroy() {
    URL.revokeObjectURL(this.avatar);
    URL.revokeObjectURL(this.song_image);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  stop() {
    this.audioService.stop();
  }

  onSliderChangeEnd(change: MatSliderChange) {
    this.audioService.seekTo(change.value);
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

  createUrlForSong(song_image: Observable<Blob>) {
    song_image.subscribe((data) => {
      let url = URL.createObjectURL(data);
      this.song_image = url;
    });
  }

  getUserAvatar(username: string) {
    let image = this.userService.getUserAvatar(username);
    this.createUrl(image);
  }

  getCurrentSongImage() {
    let image = this.songService.getSongCover(this.current_song_id as string);
    this.createUrlForSong(image);
  }

  logout() {
    this.authenticationService.logout();
  }

  nextSong() {
    this.userService.popQueue(this.username).subscribe((data) => {
      let nextSong = data;
      const newSongId = this.songService.playSong(nextSong.id, true, true);
    });
  }

  prevSong() {
    if (this.audioService.history.length === 0) {
      return;
    }
    const current_id = this.audioService.currentSongId;
    if (current_id === undefined) {
      return;
    }
    this.userService.prependQueue(this.username, [current_id]).subscribe();
    const songToPlay = this.audioService.history.pop();
    this.songService.playSong(songToPlay as string, false, true);
  }
}
