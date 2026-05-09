import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoginType, PermissionAction } from '../../core/constants/enum';
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
      localStorage.setItem(storageKey.menus, JSON.stringify([
        {
          path: '/home',
          icon: 'home',
          name: 'Trang chủ',
        },
        {
          path: '/model-ai',
          icon: 'smart_toy',
          name: 'AI',
        },
        ...menus
      ]));
      if (isAdminstrator)
        this.router.navigate(['/organization']).then();
      else
        this.router.navigate(['/home']).then();
    }
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
      case 'organizations':
        result = [{
          path: '/organization',
          icon: 'schema',
          name: 'Chi nhánh/Cửa hàng',
          permissions: actions
        }];
        break;
      case 'devices':
        result = [
          {
            path: '/device',
            icon: 'broadcast_on_home',
            name: 'Thiết bị',
            permissions: actions
          }
        ];
        if (isAdminstrator)
          result.push({
            path: '/generate-serial',
            icon: 'developer_board',
            name: 'Lịch sử serial',
            permissions: actions
          });
        break;
      case 'device_types':
        result = [{
          path: '/device-type',
          icon: 'devices',
          name: 'Loại thiết bị',
          permissions: actions
        }];
        break;
      case 'users':
        result = [{
          path: '/user',
          icon: 'people',
          name: 'Người dùng',
          permissions: actions
        }];
        break;
      case 'firmware':
        result = [{
          path: '/firmware',
          icon: 'memory',
          name: 'Firmware',
          permissions: actions
        }];
        break;
      case 'customers':
        result = [{
          path: '/customer',
          icon: 'people',
          name: 'Khách hàng',
          permissions: actions
        }];
        break;
      case 'image_convert':
        result = [{
          path: '/image_convert',
          icon: 'swap_horizontal_circle',
          name: 'Image convert',
          permissions: actions
        }];
        break;
      case 'website':
        result = [{
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
              isChildren: true
            },
          ]
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
  path: string;
  icon: string;
  name: string;
  permissions?: string[];
  children?: MenuItem[];
  isChildren?: boolean;
}