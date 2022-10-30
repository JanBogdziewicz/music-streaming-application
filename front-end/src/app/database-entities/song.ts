export interface Song {
  id: string;
  name: string;
  genres: string[];
  artist: string;
  album: string;
  length: number;
  release_date: string;
  cover: string;
  listenings: number;
}
