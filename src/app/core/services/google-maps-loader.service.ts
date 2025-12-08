import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, shareReplay, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private apiLoaded$: Observable<boolean> | null = null;

  constructor(
    private httpClient: HttpClient,
    private injector: Injector
  ) {}

  /**
   * Load Google Maps API once and cache the result
   * Subsequent calls will return the cached Observable
   */
  loadApi(): Observable<boolean> {
    // If already loaded or loading, return the cached Observable
    if (this.apiLoaded$) {
      return this.apiLoaded$;
    }
    this.injector.get(CommonService).setIncludeHttpHeader(false)
    // Load the API and cache the result using shareReplay
    this.apiLoaded$ = this.httpClient.jsonp(
      `https://maps.googleapis.com/maps/api/js?key=${environment.keymap}`,
      'callback'
    ).pipe(
      map(() => true), // Convert response to boolean
      tap(() => console.log('Google Maps API loaded successfully')),
      catchError((error) => {
        console.error('Error loading Google Maps API:', error);
        return of(false);
      }),
      shareReplay(1) // Cache the result for all subscribers
    );

    return this.apiLoaded$;
  }

  /**
   * Check if Google Maps API is already loaded
   */
  isLoaded(): boolean {
    return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
  }
}

