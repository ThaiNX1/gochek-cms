import { Routes } from '@angular/router';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./shop/shop.routes').then((m) => m.SHOP_ROUTES),
  },
];
