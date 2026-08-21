import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoginType, PermissionAction, PermissionEnum } from '../../core/constants/enum';
import { LOGIN } from '../../core/constants/gqlqueries/authentication-query';
import { storageKey } from '../../core/constants/storage-key';
import { MaterialModule } from '../../core/material.module';
import { ApiService } from '../../core/services/api.service';
import { CommonService } from '../../core/services/common.service';
import { DirectiveModule } from '../../shared/directive.module';
import { LoginResponse, RoleCode, UserState } from '../../commons/types';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    DirectiveModule,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  $unsubscribe: any = null;
  loginFrom!: FormGroup;
  loginType = LoginType.LOGIN;
  isLoading = signal(false);

  apiService = inject(ApiService);
  commonService = inject(CommonService);
  brandingService = inject(BrandingService);

  constructor(private readonly router: Router) { }

  ngOnDestroy(): void {
    this.$unsubscribe?.unsubscribe();
  }

  ngOnInit(): void {
    this.loginFrom = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      showPassword: new FormControl(false),
    });
    if (localStorage.getItem(storageKey.token)) {
      this.router.navigate(['/home']).then();
    }
  }

  /**
   * Handle logic login
   */
  async handleLogin() {
    this.loginFrom.markAllAsTouched();
    if (this.loginFrom.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đủ thông tin', 'center');
      return;
    };
    this.isLoading.set(true);
    const response = await this.apiService.executeMutation<LoginResponse>(LOGIN, {
      email: this.loginFrom.value.email,
      password: this.loginFrom.value.password
    });
    this.isLoading.set(false);
    if (response) {
      localStorage.setItem(storageKey.token, response?.login?.access_token || '');
      localStorage.setItem(
        storageKey.user,
        JSON.stringify(response?.login?.user));
      localStorage.setItem(storageKey.permissions, JSON.stringify(response?.login?.userPermissions));
      const isAdminstrator = response?.login?.user?.roles?.find((role: any) => role.code === RoleCode.ADMINISTRATOR);
      const menus = Object.keys(response?.login?.menus || {})?.reduce((acc: any, curr) => {
        const _menus: MenuItem[] = this.getMenuPath(curr, response?.login?.menus[curr] || [], !!isAdminstrator);
        if (_menus.length) {
          for (const menu of _menus) {
            acc.push(menu);
          }
        }
        return acc;
      }, []);
      localStorage.setItem(storageKey.menus, JSON.stringify(this.buildMenuGroups(menus)));
      if (isAdminstrator)
        this.router.navigate(['/organization']).then();
      else
        this.router.navigate(['/home']).then();
    }
  }

  buildMenuGroups(menus: MenuItem[]): MenuItem[] {
    const menuGroups: MenuGroup[] = [
      {
        id: 'overview',
        icon: 'dashboard',
        name: 'Tổng quan',
        order: 10,
        children: [
          {
            id: 'home',
            path: '/home',
            icon: 'home',
            name: 'Trang chủ',
            order: 10,
          },
        ],
      },
      {
        id: 'system',
        icon: 'admin_panel_settings',
        name: 'Quản trị hệ thống',
        order: 20,
        children: [],
      },
      {
        id: 'device-production',
        icon: 'precision_manufacturing',
        name: 'Thiết bị & sản xuất',
        order: 30,
        children: [],
      },
      {
        id: 'inventory-shipping',
        icon: 'inventory_2',
        name: 'Nhập/xuất kho',
        order: 40,
        children: [],
      },
      {
        id: 'customer-warranty',
        icon: 'support_agent',
        name: 'Bảo hành & khách hàng',
        order: 50,
        children: [],
      },
      {
        id: 'website-content',
        icon: 'web',
        name: 'Website & nội dung',
        order: 60,
        children: [],
      },
      {
        id: 'operation-checkin',
        icon: 'fact_check',
        name: 'Vận hành / Check-in',
        order: 70,
        children: [],
      },
      {
        id: 'geography',
        icon: 'public',
        name: 'Địa lý',
        order: 80,
        children: [],
      },
      {
        id: 'package-payment',
        icon: 'payments',
        name: 'Gói dịch vụ & thanh toán',
        order: 90,
        children: [],
      },
    ];

    menus.forEach((menu) => {
      const group = menuGroups.find((item) => item.id === menu.groupId);
      if (group) {
        group.children.push(menu);
      }
    });

    return menuGroups
      .map((group) => ({
        id: group.id,
        icon: group.icon,
        name: group.name,
        isExpanded: true,
        children: group.children.sort((first, second) => (first.order ?? 0) - (second.order ?? 0)),
      }))
      .filter((group) => group.children.length > 0)
      .sort((first, second) => {
        const firstGroup = menuGroups.find((group) => group.id === first.id);
        const secondGroup = menuGroups.find((group) => group.id === second.id);
        return (firstGroup?.order ?? 0) - (secondGroup?.order ?? 0);
      });
  }

  getMenuPath(menuCode: string, menus: any[], isAdminstrator: boolean = false): MenuItem[] {
    const actions = menus?.reduce((acc: any[], menu: any) => {
      if (menu.action.includes('manage')) {
        acc.push(...[PermissionAction.MANAGE, PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE]);
      } else {
        acc.push(menu.action.split(':')[1]);
      }
      return acc;
    }, []);
    let result: MenuItem[] = [];
    switch (menuCode) {
      case PermissionEnum.ORGANIZATIONS_READ.split(':')[0]:
        result = [{
          id: 'organizations',
          groupId: 'system',
          order: 10,
          path: '/organization',
          icon: 'schema',
          name: 'Chi nhánh/Cửa hàng',
          permissions: actions
        }];
        break;
      case PermissionEnum.DEVICES_READ.split(':')[0]:
        result = [
          {
            id: 'devices',
            groupId: 'device-production',
            order: 10,
            path: '/device',
            icon: 'broadcast_on_home',
            name: 'Thiết bị',
            permissions: actions
          }
        ];
        if (isAdminstrator)
          result.push({
            id: 'generate-serial',
            groupId: 'device-production',
            order: 20,
            path: '/generate-serial',
            icon: 'developer_board',
            name: 'Lịch sử serial',
            permissions: actions
          });
        break;
      case PermissionEnum.DEVICE_TYPES_READ.split(':')[0]:
        result = [{
          id: 'device-types',
          groupId: 'device-production',
          order: 30,
          path: '/device-type',
          icon: 'devices',
          name: 'Loại thiết bị',
          permissions: actions
        }];
        break;
      case PermissionEnum.USERS_READ.split(':')[0]:
        result = [{
          id: 'users',
          groupId: 'system',
          order: 20,
          path: '/user',
          icon: 'people',
          name: 'Người dùng',
          permissions: actions
        }];
        break;
      case PermissionEnum.ROLES_READ.split(':')[0]:
        result = [{
          id: 'roles',
          groupId: 'system',
          order: 30,
          path: '/role',
          icon: 'approval',
          name: 'Phân quyền',
          permissions: actions
        }];
        break;
      case PermissionEnum.PERMISSIONS_READ.split(':')[0]:
        result = [{
          id: 'permissions',
          groupId: 'system',
          order: 40,
          path: '/permission',
          icon: 'rule',
          name: 'Quyền',
          permissions: actions
        }];
        break;
      case 'firmware':
        result = [{
          id: 'firmware',
          groupId: 'device-production',
          order: 40,
          path: '/firmware',
          icon: 'memory',
          name: 'Firmware',
          permissions: actions
        }];
        break;
      case PermissionEnum.CUSTOMERS_READ.split(':')[0]:
        result = [{
          id: 'customers',
          groupId: 'customer-warranty',
          order: 10,
          path: '/customer',
          icon: 'people',
          name: 'Khách hàng',
          permissions: actions
        }];
        break;
      case PermissionEnum.IMAGE_CONVERT_READ.split(':')[0]:
        result = [{
          id: 'image-convert',
          groupId: 'website-content',
          order: 20,
          path: '/image_convert',
          icon: 'swap_horizontal_circle',
          name: 'Image convert',
          permissions: actions
        }];
        break;
      case PermissionEnum.WEBSITE_READ.split(':')[0]:
        result = [{
          id: 'website',
          groupId: 'website-content',
          order: 10,
          path: '/website',
          icon: 'language',
          name: 'Website',
          permissions: actions,
          children: [
            {
              id: 'banner',
              path: '/website/banner',
              icon: 'panorama',
              name: 'Banner',
              permissions: actions,
              isChildren: true
            },
          ]
        }];
        break;
      case PermissionEnum.WAREHOUSE_READ.split(':')[0]:
        result = [{
          id: 'warehouse',
          groupId: 'inventory-shipping',
          order: 10,
          path: '/warehouse',
          icon: 'warehouse',
          name: 'Kho',
          permissions: actions,
        }];
        break;
      case PermissionEnum.STOCK_READ.split(':')[0]:
        result = [{
          id: 'stock',
          groupId: 'inventory-shipping',
          order: 20,
          path: '/stock',
          icon: 'inventory_2',
          name: 'Xuất/Nhập kho',
          permissions: actions,
        }];
        break;
      case PermissionEnum.VIETTEL_POST_READ.split(':')[0]:
        result = [{
          id: 'viettel-post',
          groupId: 'inventory-shipping',
          order: 30,
          path: '/viettel-post',
          icon: 'local_shipping',
          name: 'Vận chuyển',
          permissions: actions
        }];
        break;
      default:
        return [];
    }
    return result;
  }
}
export type MenuItem = {
  id?: string;
  groupId?: MenuGroupId;
  order?: number;
  path?: string;
  icon?: string;
  name: string;
  permissions?: string[];
  children?: MenuItem[];
  isChildren?: boolean;
}

type MenuGroupId =
  | 'overview'
  | 'system'
  | 'device-production'
  | 'inventory-shipping'
  | 'customer-warranty'
  | 'website-content'
  | 'operation-checkin'
  | 'geography'
  | 'package-payment';

type MenuGroup = {
  id: MenuGroupId;
  icon: string;
  name: string;
  order: number;
  children: MenuItem[];
}
