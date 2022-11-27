import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Playlist } from '../database-entities/playlist';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-sidenav-wrapper',
  templateUrl: './sidenav-wrapper.component.html',
  styleUrls: ['./sidenav-wrapper.component.css'],
})
export class SidenavWrapperComponent implements OnInit {
  searchForm: FormGroup;

  public username: string = getUsernameFromToken();
  public avatar: string;
  public isExpanded: boolean = false;
  private playlists$!: Observable<Playlist[]>;
  public playlists: Playlist[] = [];
  public state: StreamState;
  public searchResult: SearchResult;

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
  ) {}

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      content: [''],
    });
    this.searchForm.controls['content'].valueChanges.subscribe((value) => {
      this.search(value);
    });

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

  getUserAvatar(username: string) {
    let image = this.userService.getUserAvatar(username);
    this.createUrl(image);
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

  test(a: MatAutocompleteSelectedEvent) {
    a.option['_element'].nativeElement.click();
  }
}
