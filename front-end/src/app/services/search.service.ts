import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MongoResponse } from '../database-entities/mongo_response';
import { Search } from '../database-entities/search';
import { SearchResult } from '../database-entities/search_result';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  search_address: string = `${environment.backend_address}/searches`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  createSearch(search: Search): Observable<SearchResult> {
    return this.http
      .post<MongoResponse>(this.search_address, search, this.httpOptions)
      .pipe(map((response) => response.data as SearchResult));
  }
}
