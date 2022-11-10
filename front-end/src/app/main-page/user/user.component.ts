import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { Listening } from 'src/app/database-entities/listening';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';
import { User } from 'src/app/database-entities/user';
import { AlbumService } from 'src/app/services/album.service';
import { ArtistService } from 'src/app/services/artist.service';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SongService } from 'src/app/services/song.service';
import { UserService } from 'src/app/services/user.service';
import { Scroll } from '../explore/explore.component';
import { getUsernameFromToken } from 'src/app/utils/jwt'

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  @ViewChildren(ScrollableDirective) listItems: QueryList<ScrollableDirective>;

  public username: string = getUsernameFromToken();

  private playlists$!: Observable<Playlist[]>;
  private user$!: Observable<User>;
  private listenings$!: Observable<Listening[]>;
  private topSongs$!: Observable<Song[]>;
  private topArtists$!: Observable<Artist[]>;

  public playlists: Playlist[];
  public user: User = {} as User;
  public user_join_time: string;
  public user_birthday_days: number;
  public images: Map<string, string> = new Map<string, string>();
  public topSongs: Song[];
  public topArtists: Artist[];

  public playlist_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private userService: UserService,
    private playlistService: PlaylistService,
    private songService: SongService,
    private artistService: ArtistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playlists$ = this.userService.getUserPlaylists(this.username);
    this.playlists$.subscribe((res) => {
      this.playlists = res;
      this.playlists.forEach((playlist) => {
        this.getPlaylistCover(playlist.id, playlist.cover);
      });
    });

    this.user$ = this.userService.getUser(this.username);
    this.user$.subscribe((res) => {
      this.user = res;
      this.getUserAvatar(this.user.username, this.user.avatar);
      this.user_join_time = this.getTimeSinceJoin(this.user.join_date);
      this.user_birthday_days = this.getDaysTillBirthday(this.user.birth_date);
    });

    this.listenings$ = this.userService.getUserListenings(this.username);
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
    this.topSongs$.subscribe((res) => {
      this.topSongs = res;
      this.topSongs.forEach((song) => this.getSongCover(song.id, song.cover));
    });
    this.topArtists$.subscribe((res) => {
      this.topArtists = res;
      this.topArtists.forEach((artist) =>
        this.getArtistLogo(artist.name, artist.logo)
      );
    });
  }

  ngAfterViewInit(): void {
    this.listItems.changes.subscribe(() => {
      this.playlist_scroll.item_list = this.listItems.filter(
        (item) => item.element.id === 'playlist'
      );
    });
  }

  ngOnDestroy() {
    this.images.forEach((image) => {
      URL.revokeObjectURL(image);
    });
  }

  private getTopSongs(songs: Song[]) {
    let songCount = songs.reduce((r, { id }) => {
      r[id] = r[id] || 0;
      r[id]++;
      return r;
    }, {} as { [index: string]: number });
    let topSongIds = this.getTopKeys(songCount, 3);
    return forkJoin(
      topSongIds.map((id) => {
        return this.songService.getSong(id);
      })
    );
  }

  private getTopArtists(songs: Song[]) {
    let artistCount = songs.reduce((r, { artist }) => {
      r[artist] = r[artist] || 0;
      r[artist]++;
      return r;
    }, {} as { [index: string]: number });

    let topArtistNames = this.getTopKeys(artistCount, 3);
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
    console.log(keys);
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

  goToPlaylist(playlist: Playlist) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([`/playlist/${playlist.id}`]));
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
}
