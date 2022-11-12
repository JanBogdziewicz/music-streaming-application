import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Observable } from 'rxjs';
import { Playlist } from 'src/app/database-entities/playlist';
import { Song } from 'src/app/database-entities/song';

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
  public cover: string;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    this.playlist$ = this.getPlaylist();
    this.playlist$.subscribe((res) => {
      this.playlist = res;
      this.getPlaylistCover(this.playlist.id);
    });

    this.playlist_songs$ = this.getPlaylistSongs();
    this.playlist_songs$.subscribe((res) => (this.playlist_songs = res));
  }

  ngOnDestroy() {
    URL.revokeObjectURL(this.cover);
  }

  createUrl(image: Observable<Blob>) {
    image.subscribe((data) => {
      let url = URL.createObjectURL(data);
      this.cover = url;
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

  getPlaylistCover(playlist_id: string) {
    let image = this.playlistService.getPlaylistCover(playlist_id);
    this.createUrl(image);
  }

  secondsToHms(d: number) {
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
    var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
    var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
    return hDisplay + mDisplay + sDisplay;
  }
}
