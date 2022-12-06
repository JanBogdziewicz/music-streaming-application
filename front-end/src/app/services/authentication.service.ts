import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Emitter } from '../authEmitter';
import { AudioService } from './audio.service';
import { SongEmitter } from '../currentSongEmitter'

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private router: Router, private audioService: AudioService) { }

  logout() {
    this.audioService.stop();
    this.audioService.currentSongId = undefined;
    SongEmitter.currentSongEmitter.emit(undefined);
    localStorage.removeItem('access_token');
    Emitter.authEmitter.emit(false);
    this.router.navigate(['/login']);
  }
}
