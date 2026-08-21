import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';
import { storageKey } from '../constants/storage-key';

@Injectable({
  providedIn: 'root'
})
export class PageGuard implements CanActivate {
  constructor(private readonly router: Router, private commonService: CommonService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as string[]; // lấy từ định nghĩa route
    const menus = JSON.parse(localStorage.getItem(storageKey.menus) || '[]');
    const menuActive = this.findActiveMenu(menus, state.url);
    if (menuActive?.permissions?.some((permission: string) => requiredPermissions.includes(permission))
    ) {
      return true;
    } else {
      this.router.navigate(['/error/403']).then();
      return false;
    }
  }

  private findActiveMenu(menus: any[], url: string): any | null {
    const currentPath = url.split(/[?#]/)[0];
    let activeMenu: any | null = null;

    for (const menu of menus) {
      const activeChild = menu.children?.length ? this.findActiveMenu(menu.children, url) : null;
      if (activeChild) {
        activeMenu = this.getLongerPathMenu(activeMenu, activeChild);
      }

      if (menu.path && this.isActiveMenuPath(currentPath, menu.path)) {
        activeMenu = this.getLongerPathMenu(activeMenu, menu);
      }
    }

    return activeMenu;
  }

  private isActiveMenuPath(currentPath: string, menuPath: string): boolean {
    return currentPath === menuPath || currentPath.startsWith(`${menuPath}/`);
  }

  private getLongerPathMenu(first: any | null, second: any): any {
    if (!first) {
      return second;
    }

    return (second.path?.length ?? 0) > (first.path?.length ?? 0) ? second : first;
  }
}
