import { Component, HostListener } from '@angular/core';

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
}
