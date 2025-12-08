import {inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, Subject, throwError} from 'rxjs';
import {catchError, finalize, takeUntil, tap, timeout} from 'rxjs/operators';
import {CommonService} from './common.service';
import {ResponseCode} from "../constants/enum";
import {storageKey} from "../constants/storage-key";
import { Router } from '@angular/router';
import { isPublicRoute } from '../constants/public-routes';

@Injectable()
export class ServiceInterceptor implements HttpInterceptor {
  listCallingAPI: string[] = [];
  cancelRequests$ = new Subject<void>();
  commonService = inject(CommonService)
  router = inject(Router)

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any> | any> {
    if (this.commonService.cancelRequests$.value) {
      this.cancelRequests$.next();
      return of(null)
    } else {
      this.listCallingAPI.push('request');
      if (!this.commonService.removeShowGlobalLoading.value) {
        this.commonService.setShowGlobalLoading(true);
      }
      let headers = req.headers;
      
      // Check if current route is a public route (no Authorization needed)
      const currentUrl = this.router.url;
      const isPublic = isPublicRoute(currentUrl);
      
      // Only add Authorization header if not a public route and includeHttpHeader is true
      if (this.commonService.includeHttpHeader.value && !isPublic) {
        headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem(storageKey.token));
      }
      
      const authReq = req.clone({headers});
      const response = next.handle(authReq).pipe(
        tap({
          next: async (event) => {
            this.commonService.setIncludeHttpHeader(true)
            if (event instanceof HttpResponse) {
              if (event?.body?.errors?.[0]?.statusCode?.toString() === ResponseCode.Expired_Token.toString()) {
                this.cancelRequests$.next()
                // this.refreshTokenService.refreshToken()
                localStorage.clear()
                this.router.navigate(['/login'])
              } else if (event?.body?.errors?.[0]?.statusCode?.toString() === ResponseCode.Confirm_OTP.toString()) {
                this.router.navigate(['/confirm-otp'])
              }
              else if (event?.body?.errors?.[0]) {
                this.commonService.setShowErrorResponse(event?.body?.errors?.[0])
              }
            }
          },
        }),
        takeUntil(this.cancelRequests$),
        timeout(720000),
        catchError(error => {
          if (!this.commonService.removeShowErrorResponse.value)
            this.commonService.setShowErrorResponse(error)
          return throwError(error);
        }),
        finalize(() => {
          this.listCallingAPI.pop();
          if (this.listCallingAPI.length === 0) {
            this.commonService.setShowGlobalLoading(false);
            this.commonService.setRemoveShowGlobalLoading(false)
            this.commonService.setRemoveShowErrorResponse(false)
          }
        })
      );
      return response
    }
  }
}
