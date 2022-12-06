import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';
import { SongService } from 'src/app/services/song.service';
import { Album } from 'src/app/database-entities/album';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { MatMenuTrigger } from '@angular/material/menu';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css'],
})
export class QueueComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();

  private queue_songs$!: Observable<Song[]>;
  private user_playlists$!: Observable<Playlist[]>;
  private library_songs$!: Observable<Song[]>;

  public queue_songs: Song[] = [];
  public library_songs: Song[] = [];
  public user_playlists: Playlist[] = [];
  public queue_songs_albums: Map<string, Album> = new Map<string, Album>();
  public images: Map<string, string> = new Map<string, string>();
  public elementInLibrary: Map<string, boolean> = new Map<string, boolean>();

  constructor(
    private playlistService: PlaylistService,
    private songService: SongService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user_playlists$ = this.userService.getUserPlaylists(this.username);
    this.user_playlists$.subscribe((res) => (this.user_playlists = res));

    this.queue_songs$ = this.getQueueSongs();
    this.library_songs$ = this.queue_songs$.pipe(
      switchMap((source) => {
        this.queue_songs = source;
        this.queue_songs.forEach((song) => {
          let album$ = this.songService.getSongAlbum(song.id);
          album$.subscribe((res) => {
            this.queue_songs_albums.set(song.id, res);
          });
          this.getSongCover(song.id, song.cover);
        });
        return this.userService.getUserLibrarySongs(this.username);
      })
    );
    this.library_songs$.subscribe((res) => {
      this.library_songs = res;
      this.queue_songs.forEach((song) => {
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

  getQueueSongs() {
    const id = this.username;
    return this.userService.getUserQueueSongs(id);
  }

  getSongCover(song_id: string, image_id: string) {
    let image = this.songService.getSongCover(song_id);
    this.createUrl(image, image_id);
  }

  playSong(song_id: string) {
    this.songService.playSong(song_id);
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

  addToQueue(song_ids: string[]) {
    this.userService.addToQueue(this.username, song_ids).subscribe((res) => {
      if (res) {
        this.openSnackBar('Song added to queue', 'OK');
        this.ngOnInit();
      }
    });
  }

  removeFromQueue(song_index: number[]) {
    this.userService
      .removeFromQueue(this.username, song_index)
      .subscribe((res) => {
        if (res) {
          song_index.forEach((idx) => this.queue_songs.splice(idx, 1));
          this.openSnackBar('Song removed from queue', 'OK');
        }
      });
  }

  clearQueue() {
    this.userService.clearQueue(this.username).subscribe((res) => {
      if (res) {
        this.queue_songs = [];
        this.openSnackBar('Queue cleared', 'OK');
      }
    });
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

  public refreshQueue() {
    this.ngOnInit();
  }
}
