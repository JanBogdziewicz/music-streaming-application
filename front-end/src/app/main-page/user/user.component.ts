import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ScrollableDirective } from 'src/app/common/scrollable-directive';
import { Playlist } from 'src/app/database-entities/playlist';
import { PlaylistService } from 'src/app/services/playlist.service';
import { UserService } from 'src/app/services/user.service';
import { Scroll } from '../explore/explore.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  @ViewChildren(ScrollableDirective) listItems: QueryList<ScrollableDirective>;

  username: string = localStorage.getItem('username') as string;

  private playlists$!: Observable<Playlist[]>;

  public playlists: Playlist[];
  public images: Map<string, string> = new Map<string, string>();

  public playlist_scroll: Scroll = { item_list: [], index: 0 };

  constructor(
    private userService: UserService,
    private playlistService: PlaylistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playlists$ = this.userService.getUserPlaylists(this.username);
    this.playlists$.subscribe((res) => {
      this.playlists = res;
      this.playlists.forEach((playlist) => {
        this.getPlaylistCover(playlist.id, playlist.cover);
      });
    });
  }

  ngAfterViewInit(): void {
    this.listItems.changes.subscribe(() => {
      this.playlist_scroll.item_list = this.listItems.filter(
        (item) => item.element.id === 'playlist'
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

  goToPlaylist(playlist: Playlist) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([`/playlist/${playlist.id}`]));
  }

  createUrl(image: Observable<Blob>, image_id: string) {
    image.subscribe((data) => {
      if (!this.images.has(image_id)) {
        let url = URL.createObjectURL(data);
        this.images.set(image_id, url);
      }
    });
  }

  getPlaylistCover(playlist_id: string, image_id: string) {
    let image = this.playlistService.getPlaylistCover(playlist_id);
    this.createUrl(image, image_id);
  }
}
