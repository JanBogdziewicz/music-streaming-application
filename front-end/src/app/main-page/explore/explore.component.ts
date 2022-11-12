import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { Song } from 'src/app/database-entities/song';
import { AlbumService } from 'src/app/services/album.service';
import { ArtistService } from 'src/app/services/artist.service';
import { SongService } from 'src/app/services/song.service';

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

  private songs$!: Observable<Song[]>;
  private albums$!: Observable<Album[]>;
  private artists$!: Observable<Artist[]>;

  public songs: Song[];
  public albums: Album[];
  public artists: Artist[];
  public images: Map<string, string> = new Map<string, string>();

  public song_scroll: Scroll = { item_list: [], index: 0 };
  public album_scroll: Scroll = { item_list: [], index: 0 };
  public artist_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private songService: SongService,
    private artistService: ArtistService,
    private albumService: AlbumService
  ) {}

  ngOnInit(): void {
    this.songs$ = this.songService.getSongs();
    this.songs$.subscribe((res) => {
      this.songs = res.sort(() => 0.5 - Math.random()).slice(0, 12);
      this.songs.forEach((song) => {
        this.getSongCover(song.id, song.cover);
      });
    });

    this.albums$ = this.albumService.getAlbums();
    this.albums$.subscribe((res) => {
      this.albums = res.sort(() => 0.5 - Math.random()).slice(0, 12);
      this.albums.forEach((album) => {
        this.getAlbumCover(album.id, album.cover);
      });
    });

    this.artists$ = this.artistService.getArtists();
    this.artists$.subscribe((res) => {
      this.artists = res.sort(() => 0.5 - Math.random()).slice(0, 12);
      this.artists.forEach((artist) => {
        this.getArtistLogo(artist.name, artist.logo);
      });
    });
  }

  ngAfterViewInit(): void {
    this.listItems.changes.subscribe(() => {
      this.song_scroll.item_list = this.listItems.filter(
        (item) => item.element.id === 'song'
      );
      this.album_scroll.item_list = this.listItems.filter(
        (item) => item.element.id === 'album'
      );
      this.artist_scroll.item_list = this.listItems.filter(
        (item) => item.element.id === 'artist'
      );
    });
  }

  ngOnDestroy() {
    this.images.forEach((image) => {
      URL.revokeObjectURL(image);
    });
  }

  public scrollMove(element: ScrollableDirective) {
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
}
