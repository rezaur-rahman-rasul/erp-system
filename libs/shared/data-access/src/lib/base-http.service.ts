import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = 'http://localhost:8081';

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, { params });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body);
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`);
  }
}
