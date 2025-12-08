import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonService } from './services/common.service';
import { ApiService } from './services/api.service';
import { LocalStorageService } from './services/local-storage.service';
import { BrandingService } from './services/branding.service';
import { ServiceInterceptor } from './services/service-interceptor';

/**
 * Shared services that will be provided by Shell and consumed by Remotes
 * These services maintain singleton state across the entire application
 */
export const SHARED_SERVICES: Provider[] = [
  CommonService,
  ApiService,
  LocalStorageService,
  BrandingService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ServiceInterceptor,
    multi: true,
  },
];

/**
 * Export services for remote consumption
 */
export {
  CommonService,
  ApiService,
  LocalStorageService,
  BrandingService,
  ServiceInterceptor,
};
