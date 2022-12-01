import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Album } from '../../database-entities/album';
import { Observable, switchMap } from 'rxjs';
import { Song } from '../../database-entities/song';
import { ArtistService } from '../../services/artist.service';
import { Artist } from '../../database-entities/artist';
import { AlbumService } from '../../services/album.service';
import { SongService } from '../../services/song.service';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
import { UserService } from 'src/app/services/user.service';
import { PlaylistService } from 'src/app/services/playlist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { Playlist } from 'src/app/database-entities/playlist';

export interface Scroll {
  item_list: ScrollableDirective[];
  index: number;
}

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css'],
})
export class ArtistComponent implements OnInit {
  @ViewChildren(ScrollableDirective) listItems: QueryList<ScrollableDirective>;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private username: string = getUsernameFromToken();

  private artist$!: Observable<Artist>;
  private songs$!: Observable<Song[]>;
  private albums$!: Observable<Album[]>;
  private user_playlists$!: Observable<Playlist[]>;
  private library_songs$!: Observable<Song[]>;
  private library_albums$!: Observable<Album[]>;
  private library_artists$!: Observable<Artist[]>;

  public artist: Artist = {} as Artist;
  public songs: Song[] = [];
  public albums: Album[] = [];
  public user_playlists: Playlist[] = [];
  public library_songs: Song[] = [];
  public library_albums: Album[] = [];
  public library_artists: Artist[] = [];
  public song_nr: number;
  public album_nr: number;
  public images: Map<string, string> = new Map<string, string>();
  public elementInLibrary: Map<string, boolean> = new Map<string, boolean>();

  public song_scroll: Scroll = { item_list: [], index: 0 };
  public album_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private artistService: ArtistService,
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
    this.artist$ = this.getArtist();
    this.songs$ = this.getArtistSongs();
    this.albums$ = this.getArtistAlbums();

    this.library_artists$ = this.artist$.pipe(
      switchMap((source) => {
        this.artist = source;
        this.getArtistLogo(this.artist.name, this.artist.logo);
        return this.userService.getUserLibraryArtists(this.username);
      })
    );
    this.library_artists$.subscribe((res) => {
      this.library_artists = res;
      this.elementInLibrary.set(
        this.artist.name,
        this.inLibrary(this.library_artists, this.artist.name)
      );
    });

    this.library_songs$ = this.songs$.pipe(
      switchMap((source) => {
        this.song_nr = source.length;
        this.songs = source
          .sort((s1, s2) => s2.listenings - s1.listenings)
          .slice(0, 12);
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

    this.library_albums$ = this.albums$.pipe(
      switchMap((source) => {
        this.album_nr = source.length;
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
    this.album_scroll.item_list = this.listItems.filter(
      (item) => item.element.id === 'album'
    );
    this.song_scroll.item_list = this.listItems.filter(
      (item) => item.element.id === 'song'
    );
  }

  getArtist() {
    const name = String(this.route.snapshot.paramMap.get('name'));
    return this.artistService.getArtistByName(name);
  }

  getArtistSongs() {
    const name = String(this.route.snapshot.paramMap.get('name'));
    return this.artistService.getArtistSongs(name);
  }

  getArtistAlbums() {
    const name = String(this.route.snapshot.paramMap.get('name'));
    return this.artistService.getArtistAlbums(name);
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

  playArtist() {
    this.playSong(this.songs[0].id);
    let song_ids = this.songs.map((song) => song.id).slice(1);
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

  createUrl(image: Observable<Blob>, image_id: string) {
    image.subscribe((data) => {
      if (!this.images.has(image_id)) {
        let url = URL.createObjectURL(data);
        this.images.set(image_id, url);
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
