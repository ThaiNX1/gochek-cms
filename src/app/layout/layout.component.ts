import { Component, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { BaseModule } from '../commons/base.module';
import { LayoutRoutingModule } from './layout-routing.module';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonService } from '../core/services/common.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { toObservable } from '@angular/core/rxjs-interop';
import { animate } from '@angular/animations';
import { transition } from '@angular/animations';
import { style, state } from '@angular/animations';
import { trigger } from '@angular/animations';
import { ApiService } from '../core/services/api.service';
import { storageKey } from '../core/constants/storage-key';
import { MatMenuModule } from '@angular/material/menu';
import { DownloadService, DownloadItem } from '../core/services/download.service';
import { takeUntil, Subject } from 'rxjs';
import { BrandingService } from '../core/services/branding.service';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    BaseModule,
    LayoutRoutingModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  animations: [
    trigger('menuExpand', [
      state('collapsed', style({ height: '0px', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    ]),
  ],
})
export class LayoutComponent implements OnInit {
  isLoading = signal(false);
  isDownloading = signal(false);
  downloadList = signal<DownloadItem[]>([]);
  logoPath = signal<string>('assets/images/logo.svg');
  logoPathMobile = signal<string>('assets/images/logo_neutral.svg');
  commonService = inject(CommonService);
  apiService = inject(ApiService);
  downloadService = inject(DownloadService);
  brandingService = inject(BrandingService);
  private destroy$ = new Subject<void>();
  isSidenavOpen = true;
  sidenavMode: 'side' | 'over' | 'push' = 'side';
  menus: RouterMenu[] = [];
  userInfo: any;
  queryParams: Params = {};

  constructor(private injector: Injector) {
    effect(() => {
      if (this.commonService.smallScreen()) {
        this.sidenavMode = 'over';
        this.isSidenavOpen = false;
      } else {
        this.sidenavMode = 'side';
        this.isSidenavOpen = true;
      }
    });
    this.commonService.showGlobalLoading.subscribe((isShow) => {
      this.isLoading.set(isShow);
    });
  }

  async ngOnInit() {
    this.userInfo = JSON.parse(localStorage.getItem(storageKey.user) || '{}');
    this.menus = JSON.parse(localStorage.getItem(storageKey.menus) || '[]');
    this.getActiveMenu();
    this.subscribeToDownloads();
  }

  subscribeToDownloads() {
    // Subscribe to download state
    this.downloadService.isDownloading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDownloading => {
        this.isDownloading.set(isDownloading);
      });

    // Subscribe to download list
    this.downloadService.downloadList$
      .pipe(takeUntil(this.destroy$))
      .subscribe(downloadList => {
        this.downloadList.set(downloadList);
      });
  }

  isParentActive(menu: RouterMenu): boolean {
    if (!menu.children || menu.children.length === 0) {
      return false;
    }
    const currentUrl = this.injector.get(Router).url;
    return menu.children.some(child => {
      if (child.path && currentUrl.includes(child.path)) {
        return true;
      }
      // Recursive check for nested children
      if (child.children && child.children.length > 0) {
        return this.isParentActive(child);
      }
      return false;
    });
  }

  getActiveMenu() {
    const menuActive = this.menus.find(menu => this.injector.get(Router).url?.includes(menu?.path || 'undefined'));
    if (menuActive) {
      this.onUpdateHeaderInfo(menuActive);
    }
  }

  onUpdateHeaderInfo(menu: RouterMenu) {
    this.commonService.menuSelected.set(menu);
    this.commonService.headerInfo.update((prev) => {
      return {
        ...prev,
        title: menu.name,
      }
    });
  }

  getDownloadStatusText(status: DownloadItem['status']): string {
    switch (status) {
      case 'pending': return 'Chờ tải';
      case 'downloading': return 'Đang tải';
      case 'completed': return 'Hoàn thành';
      case 'failed': return 'Thất bại';
      default: return '';
    }
  }

  getDownloadStatusColor(status: DownloadItem['status']): string {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'downloading': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  clearDownloadList() {
    this.downloadService.clearDownloadList();
  }

  removeDownloadItem(id: string) {
    this.downloadService.removeDownloadItem(id);
  }

  downloadFile(item: DownloadItem) {
    if (item.status === 'completed') {
      this.downloadService.downloadFileById(item.id);
    }
  }

  logout() {
    localStorage.clear();
    this.brandingService.clearBranding();
    this.brandingService.resetBranding();
    this.injector.get(Router).navigate(['/login']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
type RouterMenu = Menu & {
  path?: string;
  icon?: string;
  isExpanded?: boolean;
  children?: RouterMenu[];
  childrenIds?: string[];
}

export interface Menu {
  id?: string;
  code?: string;
  name?: string;
  status?: string;
  description?: string;// Dùng cho tìm kiếm
  isChildren?: boolean;
}
