import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationComponent } from '../pages/organization/organization.component';
import { DeviceComponent } from '../pages/device/device.component';
import { UserComponent } from '../pages/user/user.component';
import { RoleComponent } from '../pages/role/role.component';
import { OrganizationCreateComponent } from '../pages/organization/organization-create/organization-create.component';
import { UserCreateComponent } from '../pages/user/user-create/user-create.component';
import { ForbidenComponent } from '../auth/forbiden/forbiden.component';
import { PageGuard } from '../core/guards/page.guard';
import { PermissionAction } from '../core/constants/enum';
import { DeviceTypeComponent } from '../pages/device-type/device-type.component';
import { PermissionComponent } from '../pages/permission/permission.component';
import { FirmwareComponent } from '../pages/firmware/firmware.component';
import { FirmwareCreateComponent } from '../pages/firmware/firmware-create/firmware-create.component';
import { GenerateSerialHistoryComponent } from '../pages/generate-serial-history/generate-serial-history.component';
import { HomeComponent } from '../pages/home/home.component';
import { CustomerComponent } from '../pages/customer/customer.component';
import { WebsiteBannerComponent } from '../pages/website/website-banner/website-banner.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
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
    },
  },
  {
    path: 'organization/:id',
    component: OrganizationCreateComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
    },
  },
  {
    path: 'permission',
    component: PermissionComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
    },
  },
  {
    path: 'device',
    component: DeviceComponent,
  },
  {
    path: 'device-type',
    component: DeviceTypeComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
    },
  },
  {
    path: 'generate-serial',
    component: GenerateSerialHistoryComponent,
    canActivate: [PageGuard],
    data: {
      permissions: [PermissionAction.MANAGE],
    },
  },
  {
    path: 'user',
    component: UserComponent,
  },
  {
    path: 'user/:id',
    component: UserCreateComponent,
  },
  {
    path: 'role',
    component: RoleComponent,
  },
  {
    path: 'firmware',
    component: FirmwareComponent,
  },
  {
    path: 'firmware/:id',
    component: FirmwareCreateComponent,
  },
  {
    path: 'customer',
    component: CustomerComponent,
  },
  {
    path: 'website/banner',
    component: WebsiteBannerComponent,
  },
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
