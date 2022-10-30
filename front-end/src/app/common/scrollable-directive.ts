import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[scrollable]' })
export class ScrollableDirective {
  constructor(private _el: ElementRef) {}
  get element() {
    return this._el.nativeElement;
  }
  scrollIntoView() {
    this._el.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }
}
