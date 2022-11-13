import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Observable } from 'rxjs';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';
import { SongService } from 'src/app/services/song.service';
import { Album } from 'src/app/database-entities/album';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  private playlist$!: Observable<Playlist>;
  private playlist_songs$!: Observable<Song[]>;

  public playlist: Playlist = {} as Playlist;
  public playlist_songs: Song[];
  public playlist_songs_albums: Map<string, Album> = new Map<string, Album>();
  public images: Map<string, string> = new Map<string, string>();

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private songService: SongService
  ) {}

  ngOnInit(): void {
    this.playlist$ = this.getPlaylist();
    this.playlist$.subscribe((res) => {
      this.playlist = res;
      this.getPlaylistCover(this.playlist.id, this.playlist.cover);
    });

    this.playlist_songs$ = this.getPlaylistSongs();
    this.playlist_songs$.subscribe((res) => {
      this.playlist_songs = res;
      this.playlist_songs.forEach((song) => {
        let album$ = this.songService.getSongAlbum(song.id);
        album$.subscribe((res) => {
          this.playlist_songs_albums.set(song.id, res);
        });
        this.getSongCover(song.id, song.cover);
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
}
