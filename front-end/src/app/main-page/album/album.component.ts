import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { ActivatedRoute, Router } from '@angular/router';
import { Song } from 'src/app/database-entities/song';
import { AlbumService } from 'src/app/services/album.service';
import { SongService } from 'src/app/services/song.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { Playlist } from 'src/app/database-entities/playlist';
import { UserService } from 'src/app/services/user.service';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { PlaylistService } from 'src/app/services/playlist.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();

  private album$!: Observable<Album>;
  private album_songs$!: Observable<Song[]>;
  private user_playlists$!: Observable<Playlist[]>;
  private library_songs$!: Observable<Song[]>;
  private library_albums$!: Observable<Album[]>;

  public album: Album = { album_type: '' } as Album;
  public album_length: number = 0;
  public album_songs: Song[] = [];
  public user_playlists: Playlist[] = [];
  public library_songs: Song[] = [];
  public library_albums: Album[] = [];
  public images: Map<string, string> = new Map<string, string>();
  public elementInLibrary: Map<string, boolean> = new Map<string, boolean>();

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
    private songService: SongService,
    private userService: UserService,
    private playlistService: PlaylistService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.album_songs$ = this.getAlbumSongs();
    this.library_songs$ = this.album_songs$.pipe(
      switchMap((source) => {
        this.album_songs = source;
        this.album_songs.forEach((song) => {
          this.album_length += song.length;
          this.getSongCover(song.id, song.cover);
        });
        return this.userService.getUserLibrarySongs(this.username);
      })
    );
    this.library_songs$.subscribe((res) => {
      this.library_songs = res;
      this.album_songs.forEach((song) => {
        this.elementInLibrary.set(
          song.id,
          this.inLibrary(this.library_songs, song.id)
        );
      });
    });

    this.album$ = this.getAlbum();
    this.library_albums$ = this.album$.pipe(
      switchMap((source) => {
        this.album = source;
        this.getAlbumCover(this.album.id, this.album.cover);
        return this.userService.getUserLibraryAlbums(this.username);
      })
    );
    this.library_albums$.subscribe((res) => {
      this.library_albums = res;
      this.elementInLibrary.set(
        this.album.id,
        this.inLibrary(this.library_albums, this.album.id)
      );
    });

    this.user_playlists$ = this.userService.getUserPlaylists(this.username);
    this.user_playlists$.subscribe((res) => {
      this.user_playlists = res;
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

  getAlbum() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.albumService.getAlbumById(id);
  }

  getAlbumSongs() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.albumService.getAllAlbumSongs(id);
  }

  getAlbumCover(album_id: string, image_id: string) {
    let image = this.albumService.getAlbumCover(album_id);
    this.createUrl(image, image_id);
  }

  getSongCover(song_id: string, image_id: string) {
    let image = this.songService.getSongCover(song_id);
    this.createUrl(image, image_id);
  }

  playSong(song_id: string) {
    this.songService.playSong(song_id, this.username);
  }

  playAlbum() {
    this.playSong(this.album_songs[0].id);
    let song_ids = this.album_songs.map((song) => song.id).slice(1);
    this.prependQueue(song_ids);
  }

  prependQueue(song_ids: string[]) {
    this.userService.prependQueue(this.username, song_ids).subscribe(() => {});
  }

  addToQueue(song_ids: string[]) {
    this.userService.addToQueue(this.username, song_ids).subscribe((res) => {
      if (res) {
        this.openSnackBar('Song added to queue', 'OK');
      }
    });
  }

  inLibrary(collection: any[], id: string) {
    return collection.some((e) => e.id === id);
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

  secondsToHms(d: number) {
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
    let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
    let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
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

  onContextMenu(event: MouseEvent, song_id: string) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { id: song_id };
    this.contextMenu.menu!.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }
}
