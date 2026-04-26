import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type ServiceKey = 'identity' | 'organization' | 'masterData';

declare global {
  interface Window {
    __HISHAB_NIKASH_CONFIG__?: {
      apiBaseUrl?: string;
      services?: Partial<Record<ServiceKey, string>>;
    };
  }
}

const LOCAL_DEV_PORTS = new Set(['4200', '4201']);
const LOCAL_DEV_SERVICE_BASE_URLS: Record<ServiceKey, string> = {
  identity: 'http://localhost:8081',
  organization: 'http://localhost:8083',
  masterData: 'http://localhost:8082',
};
const PROXY_SERVICE_BASE_URLS: Record<ServiceKey, string> = {
  identity: '/identity',
  organization: '/organization',
  masterData: '/master-data',
};

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function readConfiguredServiceBaseUrl(service: ServiceKey): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const configuredBaseUrl = window.__HISHAB_NIKASH_CONFIG__?.services?.[service];

  if (typeof configuredBaseUrl !== 'string') {
    return undefined;
  }

  return normalizeBaseUrl(configuredBaseUrl.trim());
}

export function resolveServiceBaseUrl(service: ServiceKey): string {
  const configuredBaseUrl = readConfiguredServiceBaseUrl(service);

  if (configuredBaseUrl !== undefined) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined' && LOCAL_DEV_PORTS.has(window.location.port)) {
    return LOCAL_DEV_SERVICE_BASE_URLS[service];
  }

  return PROXY_SERVICE_BASE_URLS[service];
}

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  protected readonly http = inject(HttpClient);

  private buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) {
      return path;
    }

    return `/${path}`;
  }

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), { params });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), body);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), body);
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.buildUrl(url), body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url));
  }
}
