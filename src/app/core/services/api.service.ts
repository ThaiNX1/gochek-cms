import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom, map, Observable } from 'rxjs';
import { Mutation, Query } from '../../commons/types';

@Injectable({
  providedIn: 'root', // Available app-wide
})
export class ApiService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject('API_CONFIG') private config: { baseUrl: string },
    private apollo: Apollo
  ) {
    this.baseUrl = config.baseUrl;
  }

  // Generic GET request
  get<T>(endpoint: string, options = {}): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  // Generic POST request
  post<T>(endpoint: string, body: any, options = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options);
  }

  // Generic PUT request
  put<T>(endpoint: string, body: any, options = {}): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options);
  }

  // Generic DELETE request
  delete<T>(endpoint: string, options = {}): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  // Generic GET request
  async asyncGet<T>(endpoint: string, options = {}): Promise<T> {
    return await lastValueFrom(
      this.http.get<T>(`${this.baseUrl}/${endpoint}`, options)
    );
  }

  // Generic POST request
  async asyncPost<T>(endpoint: string, body: any, options = {}): Promise<T> {
    return await lastValueFrom(
      this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options)
    );
  }

  // Generic PUT request
  async asyncPut<T>(endpoint: string, body: any, options = {}): Promise<T> {
    return await lastValueFrom(
      this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options)
    );
  }

  // Generic DELETE request
  async asyncDelete<T>(endpoint: string, options = {}): Promise<T> {
    return await lastValueFrom(
      this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options)
    );
  }

  async executeQuery<T>(
    query: any,
    variables: any = {},
    fetchPolicy:
      | 'no-cache'
      | 'cache-first'
      | 'network-only'
      | 'cache-only' = 'no-cache'
  ): Promise<Query | null> {
    try {
      const result = await lastValueFrom(
        this.apollo
          .query<Query>({
            query: query,
            variables: variables,
            fetchPolicy: fetchPolicy,
          })
          .pipe(map((response) => response?.data))
      );
      return result;
    } catch (error) {
      return null;
    }
  }

  async executeMutation<T>(
    query: any,
    variables: any = null,
    multipart: boolean = false
  ): Promise<Mutation | null | undefined> {
    const useMultipart = !!variables?.file && variables.file instanceof File;
    try {
      const result = await lastValueFrom(
        this.apollo
          .mutate<Mutation>({
            mutation: query,
            variables: variables,
            context: {
              headers: {
                'apollo-require-preflight': 'true',
              },
              useMultipart: useMultipart || multipart
            },
          })
          .pipe(map((response) => response?.data))
      );
      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Execute GraphQL subscription
   * @param subscription - GraphQL subscription query
   * @param variables - Variables for the subscription
   * @returns Observable that emits subscription data
   */
  executeSubscription<T = any>(
    subscription: any,
    variables: any = {}
  ): Observable<T | null> {
    return this.apollo
      .subscribe<T>({
        query: subscription,
        variables: variables,
      })
      .pipe(
        map((response) => response?.data || null)
      );
  }
}
