import { Album } from './album';
import { Artist } from './artist';
import { Playlist } from './playlist';
import { Song } from './song';

export interface SearchResult {
  artists: Artist[];
  songs: Song[];
  playlists: Playlist[];
  albums: Album[];
}
