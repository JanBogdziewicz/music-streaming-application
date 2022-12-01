import { Component, HostListener } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

export let browserRefresh = false;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'music streaming service';

  @HostListener('contextmenu', ['$event'])
  preventDefaultContextMenu(event: Event) {
    event.preventDefault();
  }

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!router.navigated) {
          localStorage.removeItem('current_song_id');
        }
        browserRefresh = !router.navigated;
      }
    });
  }
}
