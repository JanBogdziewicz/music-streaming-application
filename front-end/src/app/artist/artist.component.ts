import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Album } from '../database-entities/album';
import { Observable } from 'rxjs';
import { Song } from '../database-entities/song';
import { ArtistService } from '../services/artist.service';
import { Artist } from '../database-entities/artist';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
import { AlbumService } from '../services/album.service';
import { SongService } from '../services/song.service';

export interface Scroll {
  item_list: ScrollableDirective[];
  index: number;
}

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css']
})
export class ArtistComponent implements OnInit {
  @ViewChildren(ScrollableDirective) listItems: QueryList<ScrollableDirective>;

  artist$!: Observable<Artist>;
  songs$!: Observable<Song[]>;
  albums$!: Observable<Album[]>;

  public artist: Artist;
  public songs: Song[];
  public albums: Album[];

  public images: Map<string, string> = new Map<string, string>();

  public song_scroll: Scroll = { item_list: [], index: 0 };
  public album_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private router: Router, 
    private artistService: ArtistService, 
    private route: ActivatedRoute, 
    private albumService: AlbumService,
    private songService: SongService
  ) { }

  ngOnInit(): void {
    this.artist$ = this.getArtist();
    this.songs$ = this.getArtistSongs();
    this.albums$ = this.getArtistAlbums();

    this.artist$.subscribe(res => {
      this.artist = res;
      this.getArtistLogo(this.artist.name, this.artist.logo);
    });
    this.songs$.subscribe((res) => {
      this.songs = res.sort(() => 0.5 - Math.random()).slice(0, 12);
      this.songs.forEach((song) => {
        this.getSongCover(song.id, song.cover);
      });
    });
    this.albums$.subscribe((res) => {
      this.albums = res.sort(() => 0.5 - Math.random()).slice(0, 12);
      this.albums.forEach((album) => {
        this.getAlbumCover(album.id, album.cover);
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

  createUrl(image: Observable<Blob>, image_id: string) {
    image.subscribe((data) => {
      if (!this.images.has(image_id)) {
        let url = URL.createObjectURL(data);
        this.images.set(image_id, url);
      }
    });
  }
}
