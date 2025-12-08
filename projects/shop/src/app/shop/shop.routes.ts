import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './layout/shop-layout.component';
import { ShopHomeComponent } from './pages/home/shop-home.component';
import { ProductListComponent } from './pages/products/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { StoreInfoComponent } from './pages/store-info/store-info.component';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      {
        path: '',
        component: ShopHomeComponent,
        title: 'Shop - Trang chủ',
      },
      {
        path: 'products',
        component: ProductListComponent,
        title: 'Shop - Sản phẩm',
      },
      {
        path: 'products/:slug',
        component: ProductDetailComponent,
        title: 'Chi tiết sản phẩm',
      },
      {
        path: 'store',
        component: StoreInfoComponent,
        title: 'Thông tin cửa hàng',
      },
    ],
  },
];
