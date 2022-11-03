export interface Playlist {
  id: string;
  name: string;
  creation_date: Date;
  songs: string[];
  length: Number;
  user: string;
  cover: string;
}
