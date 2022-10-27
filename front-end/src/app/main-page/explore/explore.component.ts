import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { Song } from 'src/app/database-entities/song';
import { ExploreService } from '../../services/explore.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent implements OnInit {
  public songs$!: Observable<Song[]>;
  public songs: Song[];
  public song_albums: Album[] = [];
  public albums$!: Observable<Album[]>;
  public albums: Album[];
  public artists$!: Observable<Artist[]>;
  public artists: Artist[];

  public songs_list: HTMLElement | null;
  public albums_list: HTMLElement | null;
  public artists_list: HTMLElement | null;

  constructor(private service: ExploreService) {}

  ngOnInit(): void {
    this.songs$ = this.service.getSongs();
    this.songs$.subscribe((res) => (this.songs = res));
    this.songs$.subscribe((res) => this.getSongAlbums(res));

    this.albums$ = this.service.getAlbums();
    this.albums$.subscribe((res) => (this.albums = res));

    this.artists$ = this.service.getArtists();
    this.artists$.subscribe((res) => (this.artists = res));

    this.songs_list = document.getElementById('songs-list');
    this.albums_list = document.getElementById('albums-list');
    this.artists_list = document.getElementById('artists-list');
  }

  getSongAlbums(songs: Song[]) {
    songs.forEach((song) => {
      let album$ = this.service.getSongAlbum(song.id);
      album$.subscribe((res) => this.song_albums.push(res));
    });
  }

  public scrollLeft(element: HTMLElement | null) {
    if (element) {
      let scroll =
        element.scrollLeft - Math.floor((1 / 6) * element.clientWidth);
      if (scroll >= 0) {
        element.scrollLeft = scroll;
      }
    }
  }

  public scrollRight(element: HTMLElement | null) {
    if (element) {
      let scroll = element.scrollLeft + (1 / 6) * element.clientWidth;
      if (scroll <= element.scrollWidth - element.clientWidth) {
        element.scrollLeft = scroll;
      }
    }
  }
}
