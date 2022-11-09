import { Song } from './song';

export interface Listening {
  id: string;
  song: Song;
  time: string;
  user: string;
}
