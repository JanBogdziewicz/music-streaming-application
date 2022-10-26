import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { Artist } from 'src/app/database-entities/artist';
import { Song } from 'src/app/database-entities/song';
import { ExploreService } from './explore.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent implements OnInit {
  songs$!: Observable<Song[]>;
  albums$!: Observable<Album[]>;
  artists$!: Observable<Artist[]>;

  constructor(private service: ExploreService) {}

  ngOnInit(): void {
    this.songs$ = this.service.getSongs();
    this.albums$ = this.service.getAlbums();
    this.artists$ = this.service.getArtists();
  }
}
