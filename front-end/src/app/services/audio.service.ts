import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";
import { environment } from "src/environments/environment";

export interface StreamState {
  playing: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  canplay: boolean;
  error: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private stop$ = new Subject();
  private audioObj = new Audio();
  audioEvents = [
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeupdate",
    "canplay",
    "loadedmetadata",
    "loadstart"
  ];
  private currentSongId: string;
  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
  };

  constructor() { }

  private streamObservable(url: string) {
    return new Observable(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();
      console.log("Done");
      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
      };
    });
  }

  private addEvents(obj: HTMLAudioElement, events: string[], handler: any) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj: HTMLAudioElement, events: string[], handler: any) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(url: string) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  loadSong(id: string) {
    if(this.currentSongId == id) {
      this.play();
      return;
    }
    this.currentSongId = id;
    this.stop();
    this.audioObj = new Audio(`${environment.backend_address}/songs/${id}/file`);
    this.playStream(`${environment.backend_address}/songs/${id}/file`);
    this.play();
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.audioObj.pause();
    this.audioObj.currentTime = 0;
  }

  seekTo(seconds: any) {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = "HH:mm:ss") {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case 'playing':
        this.state.playing = true;
        break;
      case 'pause':
        this.state.playing = false;
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false
    };
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }
}
