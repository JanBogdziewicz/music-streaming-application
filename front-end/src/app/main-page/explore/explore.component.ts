import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, switchMap } from 'rxjs';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
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

export interface Scroll {
  item_list: ScrollableDirective[];
  index: number;
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent implements OnInit {
  @ViewChildren(ScrollableDirective) listItems: QueryList<ScrollableDirective>;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();

  private songs$!: Observable<Song[]>;
  private albums$!: Observable<Album[]>;
  private artists$!: Observable<Artist[]>;
  private user_playlists$!: Observable<Playlist[]>;
  private library_songs$!: Observable<Song[]>;
  private library_albums$!: Observable<Album[]>;
  private library_artists$!: Observable<Artist[]>;

  public songs: Song[] = [];
  public albums: Album[] = [];
  public artists: Artist[] = [];
  public user_playlists: Playlist[] = [];
  public library_songs: Song[] = [];
  public library_albums: Album[] = [];
  public library_artists: Artist[] = [];
  public images: Map<string, string> = new Map<string, string>();
  public elementInLibrary: Map<string, boolean> = new Map<string, boolean>();

  public song_scroll: Scroll = { item_list: [], index: 0 };
  public album_scroll: Scroll = { item_list: [], index: 0 };
  public artist_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private songService: SongService,
    private artistService: ArtistService,
    private albumService: AlbumService,
    private playlistService: PlaylistService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.songs$ = this.songService.getSongs();
    this.library_songs$ = this.songs$.pipe(
      switchMap((source) => {
        this.songs = source.sort(() => 0.5 - Math.random()).slice(0, 12);
        this.songs.forEach((song) => {
          this.getSongCover(song.id, song.cover);
        });
        return this.userService.getUserLibrarySongs(this.username);
      })
    );
    this.library_songs$.subscribe((res) => {
      this.library_songs = res;
      this.songs.forEach((song) => {
        this.elementInLibrary.set(
          song.id,
          this.inLibrary(this.library_songs, song.id)
        );
      });
    });

    this.albums$ = this.albumService.getAlbums();
    this.library_albums$ = this.albums$.pipe(
      switchMap((source) => {
        this.albums = source.sort(() => 0.5 - Math.random()).slice(0, 12);
        this.albums.forEach((album) => {
          this.getAlbumCover(album.id, album.cover);
        });
        return this.userService.getUserLibraryAlbums(this.username);
      })
    );
    this.library_albums$.subscribe((res) => {
      this.library_albums = res;
      this.albums.forEach((album) => {
        this.elementInLibrary.set(
          album.id,
          this.inLibrary(this.library_albums, album.id)
        );
      });
    });

    this.artists$ = this.artistService.getArtists();
    this.library_artists$ = this.artists$.pipe(
      switchMap((source) => {
        this.artists = source.sort(() => 0.5 - Math.random()).slice(0, 12);
        this.artists.forEach((artist) => {
          this.getArtistLogo(artist.name, artist.logo);
        });
        return this.userService.getUserLibraryArtists(this.username);
      })
    );
    this.library_artists$.subscribe((res) => {
      this.library_artists = res;
      this.artists.forEach((artist) => {
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
    this.song_scroll.item_list = this.listItems.filter(
      (item) => item.element.id === 'song'
    );
    this.album_scroll.item_list = this.listItems.filter(
      (item) => item.element.id === 'album'
    );
    this.artist_scroll.item_list = this.listItems.filter(
      (item) => item.element.id === 'artist'
    );
  }

  private scrollMove(element: ScrollableDirective) {
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
