import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Album } from 'src/app/database-entities/album';
import { ActivatedRoute } from '@angular/router';
import { Song } from 'src/app/database-entities/song';
import { AlbumService } from 'src/app/services/album.service';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit {
  album$!: Observable<Album>;
  album: Album = {} as Album;
  album_songs$!: Observable<Song[]>;
  album_songs: Song[];

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService
  ) {}

  ngOnInit(): void {
    this.album$ = this.getAlbum();
    this.album$.subscribe((res) => (this.album = res));

    this.album_songs$ = this.getAlbumSongs();
    this.album_songs$.subscribe((res) => (this.album_songs = res));
  }

  getAlbum() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.albumService.getAlbumById(id);
  }

  getAlbumSongs() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    return this.albumService.getAllAlbumSongs(id);
  }
}
