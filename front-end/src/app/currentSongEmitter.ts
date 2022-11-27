import { EventEmitter } from "@angular/core";

export class SongEmitter {
    static currentSongEmitter = new EventEmitter<string>();
}