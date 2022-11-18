import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';
import { AlbumService } from 'src/app/services/album.service';
import { ArtistService } from 'src/app/services/artist.service';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SongService } from 'src/app/services/song.service';
import { UserService } from 'src/app/services/user.service';
import { getUsernameFromToken } from 'src/app/utils/jwt';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();

  private playlists$!: Observable<Playlist[]>;
  private albums$!: Observable<Album[]>;
  private artists$!: Observable<Artist[]>;
  private songs$!: Observable<Song[]>;
  private user_playlists$!: Observable<Playlist[]>;

  public playlists: Playlist[] = [];
  public albums: Album[] = [];
  public artists: Artist[] = [];
  public songs: Song[] = [];
  public user_playlists: Playlist[] = [];
  public images: Map<string, string> = new Map<string, string>();

  constructor(
    private userService: UserService,
    private albumService: AlbumService,
    private artistService: ArtistService,
    private songService: SongService,
    private playlistService: PlaylistService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.playlists$ = this.userService.getUserLibraryPlaylists(this.username);
    this.playlists$.subscribe((res) => {
      this.playlists = res;
      this.playlists.forEach((playlist) => {
        this.getPlaylistCover(playlist.id, playlist.cover);
      });
    });

    this.albums$ = this.userService.getUserLibraryAlbums(this.username);
    this.albums$.subscribe((res) => {
      this.albums = res;
      this.albums.forEach((album) => {
        this.getAlbumCover(album.id, album.cover);
      });
    });

    this.artists$ = this.userService.getUserLibraryArtists(this.username);
    this.artists$.subscribe((res) => {
      this.artists = res;
      this.artists.forEach((artist) => {
        this.getArtistLogo(artist.name, artist.logo);
      });
    });

    this.songs$ = this.userService.getUserLibrarySongs(this.username);
    this.songs$.subscribe((res) => {
      this.songs = res;
      this.songs.forEach((song) => {
        this.getSongCover(song.id, song.cover);
      });
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

  isUserPlaylist(playlist_id: string) {
    let ids = this.user_playlists.map((playlist) => playlist.id);
    return ids.indexOf(playlist_id) >= 0;
  }

  createUrl(image: Observable<Blob>, image_id: string) {
    image.subscribe((data) => {
      if (!this.images.has(image_id)) {
        let url = URL.createObjectURL(data);
        this.images.set(image_id, url);
      }
    });
  }

  getAlbumCover(album_id: string, image_id: string) {
    let image = this.albumService.getAlbumCover(album_id);
    this.createUrl(image, image_id);
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

  removeFromLibrary(ids: string[], collection_name: string) {
    this.userService
      .removeFromLibrary(this.username, ids, collection_name)
      .subscribe((res) => {
        if (res) {
          switch (collection_name) {
            case 'songs': {
              this.songs = this.songs.filter(
                (song) => ids.indexOf(song.id) < 0
              );
              break;
            }
            case 'albums': {
              this.albums = this.albums.filter(
                (album) => ids.indexOf(album.id) < 0
              );
              break;
            }
            case 'artists': {
              this.artists = this.artists.filter(
                (artist) => ids.indexOf(artist.name) < 0
              );
              break;
            }
            default: {
              this.playlists = this.playlists.filter(
                (playlist) => ids.indexOf(playlist.id) < 0
              );
              break;
            }
          }
          this.openSnackBar('Removed from library', 'OK');
        }
      });
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

  addToPlaylist(playlist_id: string, song_id: string) {
    this.playlistService
      .addToPlaylist(playlist_id, song_id)
      .subscribe((res) => {
        if (res) {
          this.openSnackBar('Song added to playlist', 'OK');
        }
      });
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
}
