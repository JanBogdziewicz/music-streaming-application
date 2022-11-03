import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  username: string = 'gmccullough'; // constant for now

  private playlists$!: Observable<Playlist[]>;
  private albums$!: Observable<Album[]>;
  private artists$!: Observable<Artist[]>;
  private songs$!: Observable<Song[]>;

  public playlists: Playlist[];
  public albums: Album[];
  public artists: Artist[];
  public songs: Song[];
  public images: Map<string, string> = new Map<string, string>();

  constructor(
    private router: Router,
    private userService: UserService,
    private albumService: AlbumService,
    private artistService: ArtistService,
    private songService: SongService,
    private playlistService: PlaylistService
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
        this.getArtistLogo(artist.id, artist.logo);
      });
    });

    this.songs$ = this.userService.getUserLibrarySongs(this.username);
    this.songs$.subscribe((res) => {
      this.songs = res;
      this.songs.forEach((song) => {
        this.getSongCover(song.id, song.cover);
      });
    });
  }

  ngOnDestroy() {
    this.images.forEach((image) => {
      URL.revokeObjectURL(image);
    });
  }

  goToAlbum(album: Album) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([`/album/${album.id}`]));
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
}
