export interface Playlist {
  id: string;
  name: string;
  creation_date: Date;
  songs: string[];
  length: number;
  user: string;
  cover: string;
}
