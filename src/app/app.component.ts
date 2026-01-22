import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  Component,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import DisableDevtool from 'disable-devtool';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from './core/services/common.service';
import { DialogNotificationComponent, DialogNotificationData } from './shared/components/dialog-notification/dialog-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gochek-cms';
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);
  destroyed = new Subject<void>();
  isLoading = signal(false)

  /** Error */
  isShowGlobalError = false;
  @ViewChild('globalErrorDialogContent') globalErrorDialogContent!: TemplateRef<any>;
  dataDialogNotification = signal<DialogNotificationData>({
    title: '',
    message: '',
    type: 'default',
    showCloseButton: true,
    showActions: false,
  });

  translateService = inject(TranslateService);
  commonService = inject(CommonService);

  constructor(private injector: Injector, private dialog: MatDialog) {
    this.translateService.setDefaultLang('vi');

    inject(BreakpointObserver)
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe((result) => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            const currentScreenSize = this.displayNameMap.get(query) ?? '';
            this.commonService.smallScreen.set(
              ['Small', 'XSmall'].includes(currentScreenSize)
            );
          }
        }
      });

    this.commonService.showErrorResponse.subscribe((error: any) => {
      if (error && !this.commonService.removeShowErrorResponse?.value)
        this.translateService.get(error.message).subscribe((mess) => {
          // Đóng tất cả các dialog global error đang hiển thị trước khi mở dialog mới
          this.dialog.closeAll();

          this.dataDialogNotification.update((value) => {
            return {
              ...value,
              message: mess?.toString() || '',
              type: error?.type || 'default',
            }
          });
          const dialogRef = this.dialog.open(DialogNotificationComponent, {
            data: {
              ...this.dataDialogNotification(),
              title: error?.type === 'error'
                ? 'Lỗi'
                : error?.type === 'warning'
                  ? 'Cảnh báo'
                  : 'Thông báo',
              message: mess,
              type: error?.type || 'default',
            },
          });
          dialogRef.componentInstance.content = this.globalErrorDialogContent;
        });
    });

    this.commonService.showGlobalLoading.subscribe((value) => {
      this.isLoading.update(() => value)
    })
  }
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngOnInit(): void {
  }

  /**
   * Close web when open dev tool in browser
   */
  suspendDevTool(): void {
    DisableDevtool({
      url: 'about:blank',
    });
    // @ts-ignore
    window.oncontextmenu = (ev: any) => {
      ev.preventDefault();
    };
    // @ts-ignore
    document.onkeydown = (event: any) => {
      if (event.key === 'F12') {
        event.preventDefault();
        return;
      }

      // Chặn Ctrl + Shift + I (DevTools)
      if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        return;
      }

      // Chặn Ctrl + Shift + J (DevTools)
      if (event.ctrlKey && event.shiftKey && event.key === 'J') {
        event.preventDefault();
        return;
      }
    };
  }
}
