import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Observable, switchMap } from 'rxjs';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';
import { SongService } from 'src/app/services/song.service';
import { Album } from 'src/app/database-entities/album';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { EditPlaylistDialogComponent } from './edit-playlist-dialog/edit-playlist-dialog.component';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();
  public isUserPlaylist: boolean;

  private playlist$!: Observable<Playlist>;
  private playlist_songs$!: Observable<Song[]>;
  private user_playlists$!: Observable<Playlist[]>;
  private library_songs$!: Observable<Song[]>;
  private library_playlists$!: Observable<Playlist[]>;

  public playlist: Playlist = {} as Playlist;
  public playlist_songs: Song[] = [];
  public library_songs: Song[] = [];
  private library_playlists: Playlist[];
  public user_playlists: Playlist[] = [];
  public playlist_songs_albums: Map<string, Album> = new Map<string, Album>();
  public images: Map<string, string> = new Map<string, string>();
  public elementInLibrary: Map<string, boolean> = new Map<string, boolean>();

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private songService: SongService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.playlist$ = this.getPlaylist();
    this.user_playlists$ = this.playlist$.pipe(
      switchMap((source) => {
        this.playlist = source;
        this.isUserPlaylist = this.playlist.user === this.username;
        this.getPlaylistCover(this.playlist.id, this.playlist.cover);
        return this.userService.getUserPlaylists(this.username);
      })
    );
    this.library_playlists$ = this.user_playlists$.pipe(
      switchMap((source) => {
        this.user_playlists = source.filter(
          (playlist) => playlist.id !== this.playlist.id
        );
        return this.userService.getUserLibraryPlaylists(this.username);
      })
    );
    this.library_playlists$.subscribe((res) => {
      this.library_playlists = res;
      this.elementInLibrary.set(
        this.playlist.id,
        this.inLibrary(this.library_playlists, this.playlist.id)
      );
    });

    this.playlist_songs$ = this.getPlaylistSongs();
    this.library_songs$ = this.playlist_songs$.pipe(
      switchMap((source) => {
        this.playlist_songs = source;
        this.playlist_songs.forEach((song) => {
          let album$ = this.songService.getSongAlbum(song.id);
          album$.subscribe((res) => {
            this.playlist_songs_albums.set(song.id, res);
          });
          this.getSongCover(song.id, song.cover);
        });
        return this.userService.getUserLibrarySongs(this.username);
      })
    );
    this.library_songs$.subscribe((res) => {
      this.library_songs = res;
      this.playlist_songs.forEach((song) => {
        this.elementInLibrary.set(
          song.id,
          this.inLibrary(this.library_songs, song.id)
        );
      });
    });
  }

  ngOnDestroy() {
    this.images.forEach((image) => {
      URL.revokeObjectURL(image);
    });
  }

  createUrl(image: Observable<Blob>, image_id: string) {
    image.subscribe((data) => {
      if (!this.images.has(image_id)) {
        let url = URL.createObjectURL(data);
        this.images.set(image_id, url);
      }
    });
  }

  getPlaylist() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.playlistService.getPlaylistById(id);
  }

  getPlaylistSongs() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.playlistService.getAllPlaylistSongs(id);
  }

  getPlaylistCover(playlist_id: string, image_id: string) {
    let image = this.playlistService.getPlaylistCover(playlist_id);
    this.createUrl(image, image_id);
  }

  getSongCover(song_id: string, image_id: string) {
    let image = this.songService.getSongCover(song_id);
    this.createUrl(image, image_id);
  }

  playSong(song_id: string) {
    this.songService.playSong(song_id);
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

  removeFromPlaylist(playlist_id: string, song_index: number) {
    this.playlistService
      .removeFromPlaylist(playlist_id, song_index)
      .subscribe((res) => {
        if (res) {
          this.playlist_songs = this.playlist_songs.filter(
            (song) => song.id !== res.id
          );
          this.openSnackBar('Song removed from playlist', 'OK');
        }
      });
  }

  secondsToHms(d: number) {
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
    let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
    let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
    if (!h && !m && !s) {
      return 'no data';
    }
    return hDisplay + mDisplay + sDisplay;
  }

  fancyTimeFormat(duration: number) {
    let mins = ~~(duration / 60);
    let secs = ~~duration % 60;

    let ret = '';

    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;
    return ret;
  }

  onContextMenu(event: MouseEvent, id: string, type: string, index: number) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { id: id, type: type, index: index };
    this.contextMenu.menu!.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(EditPlaylistDialogComponent, {
      data: {
        playlist: this.playlist,
        playlist_cover: this.images.get(this.playlist.cover),
      },
    });

    dialogRef.afterClosed().subscribe(() => this.ngOnInit());
  }
}
