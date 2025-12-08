import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopLayoutComponent } from '../shop/layout/shop-layout.component';
import { ShopHomeComponent } from '../shop/pages/home/shop-home.component';
import { ProductListComponent } from '../shop/pages/products/product-list.component';
import { ProductDetailComponent } from '../shop/pages/product-detail/product-detail.component';
import { StoreInfoComponent } from '../shop/pages/store-info/store-info.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemoteEntryModule {}
