import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
import { Artist } from 'src/app/database-entities/artist';
import { Listening } from 'src/app/database-entities/listening';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';
import { User } from 'src/app/database-entities/user';
import { ArtistService } from 'src/app/services/artist.service';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SongService } from 'src/app/services/song.service';
import { UserService } from 'src/app/services/user.service';
import { Scroll } from '../explore/explore.component';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AddPlaylistDialogComponent } from './add-playlist-dialog/add-playlist-dialog.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  @ViewChildren(ScrollableDirective) listItems: QueryList<ScrollableDirective>;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();
  private profileUsername: string;
  public isOwner: boolean;

  private playlists$!: Observable<Playlist[]>;
  private user$!: Observable<User>;
  private listenings$!: Observable<Listening[]>;
  private topSongs$!: Observable<Song[]>;
  private topArtists$!: Observable<Artist[]>;
  private user_playlists$!: Observable<Playlist[]>;
  private library_songs$!: Observable<Song[]>;
  private library_artists$!: Observable<Artist[]>;

  public playlists: Playlist[] = [];
  public user: User = {} as User;
  public user_join_time: string;
  public user_birthday_days: number;
  public images: Map<string, string> = new Map<string, string>();
  public elementInLibrary: Map<string, boolean> = new Map<string, boolean>();
  public songCount: { [index: string]: number } = {};
  public artistCount: { [index: string]: number } = {};
  public topSongs: Song[] = [];
  public topArtists: Artist[] = [];
  public library_songs: Song[] = [];
  public library_artists: Artist[] = [];
  public user_playlists: Playlist[] = [];

  public playlist_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private userService: UserService,
    private playlistService: PlaylistService,
    private songService: SongService,
    private artistService: ArtistService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      let username = paramMap.get('username');
      if (username) {
        this.profileUsername = username;
      }
    });

    this.isOwner = this.profileUsername === this.username;

    this.playlists$ = this.userService.getUserPlaylists(this.profileUsername);
    this.playlists$.subscribe((res) => {
      this.playlists = res;
      this.playlists.forEach((playlist) => {
        this.getPlaylistCover(playlist.id, playlist.cover);
      });
    });

    this.user$ = this.userService.getUser(this.profileUsername);
    this.user$.subscribe((res) => {
      this.user = res;
      this.getUserAvatar(this.user.username, this.user.avatar);
      this.user_join_time = this.getTimeSinceJoin(this.user.join_date);
      this.user_birthday_days = this.getDaysTillBirthday(this.user.birth_date);
    });

    this.listenings$ = this.userService.getUserListenings(this.profileUsername);
    this.topSongs$ = this.listenings$.pipe(
      switchMap((source) => {
        let songs = source.map((listening) => listening.song);
        return this.getTopSongs(songs);
      })
    );
    this.topArtists$ = this.listenings$.pipe(
      switchMap((source) => {
        let songs = source.map((listening) => listening.song);
        return this.getTopArtists(songs);
      })
    );
    this.library_songs$ = this.topSongs$.pipe(
      switchMap((source) => {
        this.topSongs = source;
        this.topSongs.forEach((song) => this.getSongCover(song.id, song.cover));
        return this.userService.getUserLibrarySongs(this.username);
      })
    );
    this.library_artists$ = this.topArtists$.pipe(
      switchMap((source) => {
        this.topArtists = source;
        this.topArtists.forEach((artist) =>
          this.getArtistLogo(artist.name, artist.logo)
        );
        return this.userService.getUserLibraryArtists(this.username);
      })
    );
    this.library_songs$.subscribe((res) => {
      this.library_songs = res;
      this.topSongs.forEach((song) => {
        this.elementInLibrary.set(
          song.id,
          this.inLibrary(this.library_songs, song.id)
        );
      });
    });
    this.library_artists$.subscribe((res) => {
      this.library_artists = res;
      this.topArtists.forEach((artist) => {
        this.elementInLibrary.set(
          artist.name,
          this.inLibrary(this.library_artists, artist.name)
        );
      });
    });

    this.user_playlists$ = this.userService.getUserPlaylists(this.username);
    this.user_playlists$.subscribe((res) => {
      this.user_playlists = res;
    });
  }

  ngAfterViewInit(): void {
    this.scrollableProcess();
    this.listItems.changes.subscribe(() => this.scrollableProcess());
  }

  ngOnDestroy() {
    this.images.forEach((image) => {
      URL.revokeObjectURL(image);
    });
  }

  private scrollableProcess() {
    this.playlist_scroll.item_list = this.listItems.filter(
      (item) => item.element.id === 'playlist'
    );
  }

  private getTopSongs(songs: Song[]) {
    this.songCount = songs.reduce((r, { id }) => {
      r[id] = r[id] || 0;
      r[id]++;
      return r;
    }, {} as { [index: string]: number });
    let topSongIds = this.getTopKeys(this.songCount, 3);
    return forkJoin(
      topSongIds.map((id) => {
        return this.songService.getSong(id);
      })
    );
  }

  private getTopArtists(songs: Song[]) {
    this.artistCount = songs.reduce((r, { artist }) => {
      r[artist] = r[artist] || 0;
      r[artist]++;
      return r;
    }, {} as { [index: string]: number });

    let topArtistNames = this.getTopKeys(this.artistCount, 3);
    return forkJoin(
      topArtistNames.map((name) => {
        return this.artistService.getArtistByName(name);
      })
    );
  }

  getTopKeys(o: { [index: string]: number }, n: number) {
    var keys = Object.keys(o);
    keys.sort(function (a, b) {
      return o[b] - o[a];
    });
    return keys.slice(0, n);
  }

  public scrollMove(element: ScrollableDirective) {
    element.scrollIntoView();
  }

  public scrollLeft(s: Scroll) {
    if (s.index == 0) {
      s.index += s.item_list.length - 6;
    } else {
      s.index--;
    }
    this.scrollMove(s.item_list[s.index]);
  }

  public scrollRight(s: Scroll) {
    s.index = (s.index + 1) % (s.item_list.length - 5);
    this.scrollMove(s.item_list[s.index]);
  }

  createUrl(image: Observable<Blob>, image_id: string) {
    image.subscribe((data) => {
      if (!this.images.has(image_id)) {
        let url = URL.createObjectURL(data);
        this.images.set(image_id, url);
      }
    });
  }

  getSongCover(song_id: string, image_id: string) {
    let image = this.songService.getSongCover(song_id);
    this.createUrl(image, image_id);
  }

  getArtistLogo(artist_name: string, image_id: string) {
    let image = this.artistService.getArtistLogo(artist_name);
    this.createUrl(image, image_id);
  }

  getPlaylistCover(playlist_id: string, image_id: string) {
    let image = this.playlistService.getPlaylistCover(playlist_id);
    this.createUrl(image, image_id);
  }

  getUserAvatar(username: string, image_id: string) {
    let image = this.userService.getUserAvatar(username);
    this.createUrl(image, image_id);
  }

  removePlaylist(playlist_id: string) {
    this.playlistService.removePlaylist(playlist_id).subscribe((res) => {
      if (res) {
        this.playlists = this.playlists.filter(
          (playlist) => playlist.id !== playlist_id
        );
        this.openSnackBar('Playlist deleted', 'OK');
      }
    });
  }

  playSong(song_id: string) {
    this.songService.playSong(song_id, this.username);
  }

  addToQueue(song_ids: string[]) {
    this.userService.addToQueue(this.username, song_ids).subscribe((res) => {
      if (res) {
        this.openSnackBar('Song added to queue', 'OK');
      }
    });
  }

  inLibrary(collection: any[], id: string) {
    return collection.some((e) => e.id === id || e.name === id);
  }

  addToLibrary(ids: string[], collection_name: string) {
    this.userService
      .addToLibrary(this.username, ids, collection_name)
      .subscribe((res) => {
        if (res) {
          ids.forEach((id) => {
            this.elementInLibrary.set(id, true);
          });
          this.openSnackBar('Added to library', 'OK');
        }
      });
  }

  removeFromLibrary(ids: string[], collection_name: string) {
    this.userService
      .removeFromLibrary(this.username, ids, collection_name)
      .subscribe((res) => {
        if (res) {
          ids.forEach((id) => {
            this.elementInLibrary.set(id, false);
          });
          this.openSnackBar('Removed from library', 'OK');
        }
      });
  }

  addToPlaylist(playlist_id: string, song_id: string) {
    this.playlistService
      .addToPlaylist(playlist_id, song_id)
      .subscribe((res) => {
        if (res) {
          this.openSnackBar('Song added to playlist', 'OK');
        }
      });
  }

  getTimeSinceJoin(join_date: string): string {
    let diff = this.dateDiff(join_date, new Date().toISOString());
    return this.formatOutput(diff);
  }

  formatOutput(v: number[]) {
    let values = ['year', 'month', 'day'];
    return v.reduce(function (s, x, i) {
      s += x
        ? (s.length ? ', ' : '') +
          (i == 5 ? x.toFixed(2) : x) +
          ' ' +
          values[i] +
          (x == 1 ? '' : 's')
        : '';
      return s;
    }, '');
  }

  dateDiff(d1: string, d2: string) {
    let s: number[] = d1.split(/\D/).map(function (item) {
      return parseInt(item, 10);
    });
    let e: number[] = d2.split(/\D/).map(function (item) {
      return parseInt(item, 10);
    });

    let hr = (e[3] || 0) - (s[3] || 0);
    let day = e[2] - s[2];
    let mon = e[1] - s[1];
    let yr = e[0] - s[0];

    if (hr < 0) {
      hr += 24;
      --day;
    }

    if (day < 0) {
      let prevMonLen = new Date(e[0], e[1] - 1, 0).getDate();
      day = s[2] < prevMonLen ? prevMonLen + day : +e[2];
      --mon;
    }

    if (mon < 0) {
      mon += 12;
      --yr;
    }

    let endMonLen = new Date(e[0], e[1], 0).getDate();

    if (day >= endMonLen && s[2] > e[2] && e[2] == endMonLen) {
      day = 0;
      ++mon;
      if (mon == 12) {
        mon = 0;
        ++yr;
      }
    }
    return [yr, mon, day];
  }

  getDaysTillBirthday(date: string): number {
    let d = new Date(date);
    let now = new Date();
    let bday = new Date(now.getFullYear(), d.getUTCMonth(), d.getUTCDate());
    if (now.getTime() > bday.getTime()) {
      bday.setFullYear(bday.getFullYear() + 1);
    }
    let diff = bday.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  onContextMenu(event: MouseEvent, id: string, type: string) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { id: id, type: type };
    this.contextMenu.menu!.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }

  openEditUserDialog() {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      data: {
        user_avatar: this.images.get(this.user.avatar),
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.username = getUsernameFromToken();
      this.ngOnInit();
    });
  }

  openAddPlaylistDialog() {
    const dialogRef = this.dialog.open(AddPlaylistDialogComponent);

    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }
}
