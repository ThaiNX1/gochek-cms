import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForbidenComponent } from '../auth/forbiden/forbiden.component';
import { PermissionAction } from '../core/constants/enum';
import { PageGuard } from '../core/guards/page.guard';
import { CustomerComponent } from '../pages/customer/customer.component';
import { DeviceTypeComponent } from '../pages/device-type/device-type.component';
import { DeviceComponent } from '../pages/device/device.component';
import { FirmwareCreateComponent } from '../pages/firmware/firmware-create/firmware-create.component';
import { FirmwareComponent } from '../pages/firmware/firmware.component';
import { GenerateSerialHistoryComponent } from '../pages/generate-serial-history/generate-serial-history.component';
import { HomeComponent } from '../pages/home/home.component';
import { ImageConvertComponent } from '../pages/image-convert/image-convert.component';
import { InventoryDashboardComponent } from '../pages/inventory-dashboard/inventory-dashboard.component';
import { ManufacturingDashboardComponent } from '../pages/manufacturing-dashboard/manufacturing-dashboard.component';
import { OrganizationCreateComponent } from '../pages/organization/organization-create/organization-create.component';
import { OrganizationComponent } from '../pages/organization/organization.component';
import { PermissionComponent } from '../pages/permission/permission.component';
import { RoleComponent } from '../pages/role/role.component';
import { SettingsComponent } from '../pages/settings/settings.component';
import { StockHistoryComponent } from '../pages/stock-history/stock-history.component';
import { StockComponent } from '../pages/stock/stock.component';
import { SupplierComponent } from '../pages/supplier/supplier.component';
import { UserCreateComponent } from '../pages/user/user-create/user-create.component';
import { UserComponent } from '../pages/user/user.component';
import { ViettelPostComponent } from '../pages/viettel-post/viettel-post.component';
import { WarehouseComponent } from '../pages/warehouse/warehouse.component';
import { WebsiteBannerCreateComponent } from '../pages/website/website-banner/website-banner-create/website-banner-create.component';
import { WebsiteBannerComponent } from '../pages/website/website-banner/website-banner.component';
import { PurchaseOrderComponent } from '../pages/purchase-order/purchase-order.component';
import { PurchaseOrderCreateComponent } from '../pages/purchase-order/purchase-order-create/purchase-order-create.component';
import { PurchaseOrderShipmentComponent } from '../pages/purchase-order-shipment/purchase-order-shipment.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    data: {
      headerSubtitle: 'Tổng quan hoạt động hệ thống và các chỉ số quản lý',
    },
  },
  {
    path: 'inventory-dashboard',
    component: InventoryDashboardComponent,
    data: {
      headerSubtitle: 'Tổng quan tồn kho, rủi ro và sức khỏe kho hàng',
    },
  },
  {
    path: 'manufacturing-dashboard',
    component: ManufacturingDashboardComponent,
    data: {
      headerSubtitle: 'Theo dõi tiến độ sản xuất và chất lượng thiết bị',
    },
  },
  {
    path: 'error/403',
    component: ForbidenComponent,
  },
  {
    path: 'organization',
    component: OrganizationComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
      headerSubtitle: 'Quản lý danh sách tổ chức và thông tin hoạt động',
    },
  },
  {
    path: 'organization/:id',
    component: OrganizationCreateComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
      headerSubtitle: 'Cập nhật thông tin, người dùng và cấu hình tổ chức',
    },
  },
  {
    path: 'permission',
    component: PermissionComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
      headerSubtitle: 'Quản lý danh mục quyền truy cập trong hệ thống',
    },
  },
  {
    path: 'device',
    component: DeviceComponent,
    data: {
      headerSubtitle: 'Quản lý thiết bị, trạng thái và thông tin gán tổ chức',
    },
  },
  {
    path: 'device-type',
    component: DeviceTypeComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerSubtitle: 'Quản lý loại thiết bị, model và đồng bộ sản phẩm',
    },
  },
  {
    path: 'generate-serial',
    component: GenerateSerialHistoryComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
      headerSubtitle: 'Theo dõi và tạo các đợt sinh serial cho sản phẩm',
    },
  },
  {
    path: 'user',
    component: UserComponent,
    data: {
      headerSubtitle: 'Quản lý tài khoản người dùng và trạng thái hoạt động',
    },
  },
  {
    path: 'user/:id',
    component: UserCreateComponent,
    data: {
      headerSubtitle: 'Cập nhật thông tin và phân quyền cho người dùng',
    },
  },
  {
    path: 'role',
    component: RoleComponent,
    data: {
      headerSubtitle: 'Quản lý vai trò và quyền truy cập của người dùng',
    },
  },
  {
    path: 'firmware',
    component: FirmwareComponent,
    data: {
      headerSubtitle: 'Quản lý firmware và phiên bản phần mềm thiết bị',
    },
  },
  {
    path: 'firmware/:id',
    component: FirmwareCreateComponent,
    data: {
      headerSubtitle: 'Cập nhật thông tin, tệp và cấu hình firmware',
    },
  },
  {
    path: 'customer',
    component: CustomerComponent,
    data: {
      headerSubtitle: 'Quản lý khách hàng và lịch sử bảo hành thiết bị',
    },
  },
  {
    path: 'warehouse',
    component: WarehouseComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerSubtitle: 'Quản lý kho và cấu hình đồng bộ với Nhanh.vn',
    },
  },
  {
    path: 'stock',
    component: StockComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerTitle: 'Xuất/Nhập kho',
      headerSubtitle: 'Theo dõi tồn kho, nhập lô và xuất thiết bị theo serial',
    },
  },
  {
    path: 'stock/history',
    component: StockHistoryComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerTitle: 'Lịch sử kho',
      headerSubtitle: 'Theo dõi các lần nhập kho, xuất kho và điều chỉnh tồn kho',
    },
  },
  {
    path: 'supplier',
    component: SupplierComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerSubtitle: 'Quản lý nhà cung cấp phục vụ đơn đặt hàng',
    },
  },
  {
    path: 'viettel-post',
    component: ViettelPostComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerTitle: 'Vận chuyển',
      headerSubtitle: 'Theo dõi đơn vận chuyển và cập nhật hoàn hàng về kho',
    },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: {
      headerSubtitle: 'Quản lý kết nối đối tác và cấu hình thanh toán',
    },
  },
  {
    path: 'website/banner',
    component: WebsiteBannerComponent,
    data: {
      headerSubtitle: 'Quản lý banner hiển thị trên website',
    },
  },
  {
    path: 'website/banner/:id',
    component: WebsiteBannerCreateComponent,
    data: {
      headerSubtitle: 'Cập nhật nội dung và hình ảnh banner',
    },
  },
  {
    path: 'purchase-order',
    component: PurchaseOrderComponent,
    data: {
      headerSubtitle: 'Theo dõi đơn đặt hàng, sản xuất và trạng thái hoàn thành',
    },
  },
  {
    path: 'purchase-order/create',
    component: PurchaseOrderCreateComponent,
    data: {
      headerSubtitle: 'Khởi tạo thông tin sản phẩm, batch/lot và vận chuyển',
    },
  },
  {
    path: 'purchase-order/:id',
    component: PurchaseOrderCreateComponent,
    data: {
      headerSubtitle: 'Xem và cập nhật sản phẩm, batch/lot và vận chuyển',
    },
  },
  {
    path: 'purchase-order-shipment',
    component: PurchaseOrderShipmentComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE, PermissionAction.READ],
      headerSubtitle: 'Theo dõi các đơn vận chuyển của đơn đặt hàng',
    },
  },
  {
    path: 'image_convert',
    component: ImageConvertComponent,
    data: {
      headerSubtitle: 'Quản lý cấu hình và lịch sử chuyển đổi hình ảnh',
    },
  },
  {
    path: 'image_convert/create',
    loadComponent: () => import('../pages/image-convert/image-convert-create/image-convert-create.component').then(m => m.ImageConvertCreateComponent),
    data: {
      headerSubtitle: 'Tạo cấu hình chuyển đổi hình ảnh mới',
    },
  },
  // {
  //   path: 'model-ai',
  //   component: ModelAiComponent,
  // },
  // {
  //   path: 'guest',
  //   component: GuestLayoutComponent,
  //   canActivate: [GuestAuthGuardService],
  //   children: [
  //     {
  //       path: '',
  //       loadChildren: () => import('../pages/guest/guest.module').then(module => module.GuestModule),
  //     }
  //   ]
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule { }
