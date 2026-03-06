import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface DownloadRequest {
  url: string;
  filename: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private downloadSubject = new Subject<DownloadRequest>();
  public download$ = this.downloadSubject.asObservable();

  private isDownloadingSubject = new BehaviorSubject<boolean>(false);
  public isDownloading$ = this.isDownloadingSubject.asObservable();

  private downloadListSubject = new BehaviorSubject<DownloadItem[]>([]);
  public downloadList$ = this.downloadListSubject.asObservable();

  constructor(
    private readonly injector: Injector
  ) { }

  /**
   * Trigger a download request
   * @param url - The URL to download from
   * @param filename - The filename to save as
   */
  triggerDownload(url: string, filename: string, query: any = null, queryVariable: any = {}, queryResultKey: string = '', queryType: string = 'subscription') {
    const downloadItem: DownloadItem = {
      id: this.generateId(),
      filename,
      url,
      status: 'pending',
      timestamp: new Date()
    };

    // Add to download list
    const currentList = this.downloadListSubject.value;
    this.downloadListSubject.next([downloadItem, ...currentList]);

    // Simulate API call to prepare download
    this.isDownloadingSubject.next(true);

    // Simulate preparation time
    switch (queryType) {
      case 'subscription':
        const sub = this.injector.get(ApiService).executeSubscription(query, queryVariable).pipe(
          map(response => ({ ...response, downloadItemId: downloadItem.id })),
          filter(response => {
            const data = response[queryResultKey];
            if (!data) return false;
            return !!data.url || !!data.error || ['COMPLETED', 'DONE', 'FAILED', 'ERROR'].includes(data.status?.toUpperCase());
          }),
          take(1)
        ).subscribe({
          next: (response) => {
            this.isDownloadingSubject.next(false)
            const _currentList = this.downloadListSubject.value;
            for (let index = 0; index < _currentList.length; index++) {
              const element = _currentList[index];
              if (element.id === response.downloadItemId) {
                _currentList[index].url = response[queryResultKey]?.url;
                _currentList[index].status = 'completed';
                _currentList[index].timestamp = new Date();
                this.downloadListSubject.next([..._currentList]);
                break;
              }
            }
          },
          error: (error) => {
            this.isDownloadingSubject.next(false)
            this.removeDownloadItem(downloadItem.id);
          },
          complete: () => {
            // Stream kết thúc mà không có data (server đóng kết nối sớm)
            this.isDownloadingSubject.next(false);
          }
        });
        break;
    }
  }

  /**
   * Download a file from URL by item ID
   * @param id - The download item ID
   */
  downloadFileById(id: string) {
    const currentList = this.downloadListSubject.value;
    const item = currentList.find(i => i.id === id);

    if (!item || item.status !== 'completed') {
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  /**
   * Download a file from URL
   * @param url - The download item URL
   */
  downloadFileByURL(url: string) {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  /**
   * Set downloading state
   */
  setDownloading(isDownloading: boolean) {
    this.isDownloadingSubject.next(isDownloading);
  }

  /**
   * Update download status
   */
  private updateDownloadStatus(filename: string, status: DownloadItem['status']) {
    const currentList = this.downloadListSubject.value;
    const updatedList = currentList.map(item =>
      item.filename === filename ? { ...item, status } : item
    );
    this.downloadListSubject.next(updatedList);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear download list
   */
  clearDownloadList() {
    this.downloadListSubject.next([]);
  }

  /**
   * Remove download item
   */
  removeDownloadItem(id: string) {
    const currentList = this.downloadListSubject.value;
    const updatedList = currentList.filter(item => item.id !== id);
    this.downloadListSubject.next(updatedList);
  }
}
