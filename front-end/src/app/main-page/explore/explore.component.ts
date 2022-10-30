import {
  Component,
  Directive,
  ElementRef,
  OnInit,
  Pipe,
  PipeTransform,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { Song } from 'src/app/database-entities/song';
import { ExploreService } from '../../services/explore.service';

export interface Scroll {
  item_list: ScrollableDirective[];
  index: number;
}

@Directive({ selector: '[scrollable]' })
export class ScrollableDirective {
  constructor(private _el: ElementRef) {}
  get element() {
    return this._el.nativeElement;
  }
  scrollIntoView() {
    this._el.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }
}

@Pipe({ name: 'safeResourceUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  public transform(url: string | undefined): SafeResourceUrl {
    if (url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return '';
  }
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
  public test: string;

  public song_scroll: Scroll = { item_list: [], index: 0 };
  public album_scroll: Scroll = { item_list: [], index: 0 };
  public artist_scroll: Scroll = { item_list: [], index: 0 };

  constructor(private service: ExploreService, private router: Router) {}

  ngOnInit(): void {
    this.songs$ = this.service.getSongs();
    this.songs$.subscribe((res) => {
      this.songs = res;
      this.songs.forEach((song) => {
        this.getSongCover(song.id, song.cover);
      });
    });

    this.albums$ = this.service.getAlbums();
    this.albums$.subscribe((res) => {
      this.albums = res;
      this.albums.forEach((album) => {
        this.getAlbumCover(album.id, album.cover);
      });
    });

    this.artists$ = this.service.getArtists();
    this.artists$.subscribe((res) => {
      this.artists = res;
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
        console.log(this.images);
      }
    });
  }

  getAlbumCover(album_id: string, image_id: string) {
    let image = this.service.getAlbumCover(album_id);
    this.createUrl(image, image_id);
  }

  getSongCover(song_id: string, image_id: string) {
    let image = this.service.getSongCover(song_id);
    this.createUrl(image, image_id);
  }

  getArtistLogo(artist_name: string, image_id: string) {
    let image = this.service.getArtistLogo(artist_name);
    this.createUrl(image, image_id);
  }
}
