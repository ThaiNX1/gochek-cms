import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SHOP_ROUTES } from './shop.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(SHOP_ROUTES),
    provideHttpClient(),
    provideAnimations(),
  ],
};
