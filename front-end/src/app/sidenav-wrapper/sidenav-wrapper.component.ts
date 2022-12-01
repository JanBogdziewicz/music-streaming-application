import { Component, OnInit, EventEmitter, ContentChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Playlist } from '../database-entities/playlist';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { getUsernameFromToken } from '../utils/jwt';
import { AudioService, StreamState } from '../services/audio.service';
import { MatSliderChange } from '@angular/material/slider';
import { SearchService } from '../services/search.service';
import { Search } from '../database-entities/search';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchResult } from '../database-entities/search_result';
import { SongService } from '../services/song.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Song } from '../database-entities/song';
import { SongEmitter } from '../currentSongEmitter';
import { browserRefresh } from '../app.component';
import { QueueComponent } from '../main-page/queue/queue.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav-wrapper',
  templateUrl: './sidenav-wrapper.component.html',
  styleUrls: ['./sidenav-wrapper.component.css'],
  providers: [QueueComponent],
})
export class SidenavWrapperComponent implements OnInit {
  searchForm: FormGroup;

  public username: string = getUsernameFromToken();
  public avatar: string;
  public song_image: string;
  public current_song_id: string;
  public song_emitter: EventEmitter<string>;
  public isExpanded: boolean = false;
  private playlists$!: Observable<Playlist[]>;
  public playlists: Playlist[] = [];
  public state: StreamState;
  public searchResult: SearchResult;
  public current_song: Song = {} as Song;

  currentFile: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private audioService: AudioService,
    private searchService: SearchService,
    private songService: SongService,
    private snackBar: MatSnackBar
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      content: [''],
    });
    this.searchForm.controls['content'].valueChanges.subscribe((value) => {
      this.search(value);
    });

    this.song_emitter = SongEmitter.currentSongEmitter;
    this.song_emitter.subscribe((next) => {
      localStorage.setItem('current_song_id', next);
      this.current_song_id = next;
      this.songService.getSong(next).subscribe((val) => {
        this.current_song = val;
      });
      this.getCurrentSongImage();
    });
    if (!this.current_song_id && !browserRefresh) {
      const saved_id = localStorage.getItem('current_song_id');
      if (saved_id) {
        this.current_song_id = saved_id;
        this.songService.getSong(saved_id).subscribe((val) => {
          this.current_song = val;
        });
        this.getCurrentSongImage();
      }
    }

    this.playlists$ = this.userService.getUserPlaylists(this.username);
    this.playlists$.subscribe(
      (res) =>
        (this.playlists = res.sort(() => 0.5 - Math.random()).slice(0, 12))
    );
    this.audioService.getState().subscribe((state) => {
      this.state = state;
    });
    this.getUserAvatar(this.username);
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

  search(content: string) {
    if (!content) {
      return;
    }
    const search: Search = {
      content: content,
      user: this.username,
    };
    this.searchService.createSearch(search).subscribe({
      next: (res) => {
        this.searchResult = res;
      },
      error: () => {
        this.openSnackBar('Something went wrong!!', 'OK');
      },
    });
  }

  playSong(song_id: string) {
    this.songService.playSong(song_id);
  }

  noResults() {
    if (this.searchResult) {
      if (
        !this.searchResult.albums.length &&
        !this.searchResult.artists.length &&
        !this.searchResult.songs.length &&
        !this.searchResult.playlists.length
      ) {
        return true;
      }
    }
    return false;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }

  clickOption(event: MatAutocompleteSelectedEvent) {
    event.option['_element'].nativeElement.click();
  }

  nextSong() {
    this.userService.popQueue(this.username).subscribe((data) => {
      let nextSong = data;
      const newSongId = this.songService.playSong(nextSong.id, true, true);
    });
    if (this.router.url.split('/').pop() === 'queue') {
      this.redirectTo(this.router.url);
    }
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
    if (this.router.url.split('/').pop() === 'queue') {
      this.redirectTo(this.router.url);
    }
  }

  redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }
}
