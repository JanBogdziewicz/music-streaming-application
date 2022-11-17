import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { ActivatedRoute } from '@angular/router';
import { Song } from 'src/app/database-entities/song';
import { AlbumService } from 'src/app/services/album.service';
import { SongService } from 'src/app/services/song.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { Playlist } from 'src/app/database-entities/playlist';
import { UserService } from 'src/app/services/user.service';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { PlaylistService } from 'src/app/services/playlist.service';

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

  public album: Album = { album_type: '' } as Album;
  public album_length: number = 0;
  public album_songs: Song[] = [];
  public user_playlists: Playlist[] = [];
  public images: Map<string, string> = new Map<string, string>();

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
    private songService: SongService,
    private userService: UserService,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    this.album$ = this.getAlbum();
    this.album$.subscribe((res) => {
      this.album = res;
      this.getAlbumCover(this.album.id, this.album.cover);
    });

    this.album_songs$ = this.getAlbumSongs();
    this.album_songs$.subscribe((res) => {
      this.album_songs = res;
      this.album_songs.forEach((song) => {
        this.album_length += song.length;
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
    this.songService.playSong(song_id);
  }

  addToQueue(song_ids: string[]) {
    this.userService
      .addToQueue(this.username, song_ids)
      .subscribe((res) => console.log(res));
  }

  addToLibrary(song_ids: string[], collection_name: string) {
    this.userService
      .addToLibrary(this.username, song_ids, collection_name)
      .subscribe((res) => console.log(res));
  }

  addToPlaylist(playlist_id: string, song_id: string) {
    this.playlistService
      .addToPlaylist(playlist_id, song_id)
      .subscribe((res) => console.log(res));
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
}
