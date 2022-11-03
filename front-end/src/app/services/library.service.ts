import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  library_address: string = `${environment.backend_address}/libraries`;

  constructor() {}
}
