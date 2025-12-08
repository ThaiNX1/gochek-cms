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
    const menuActive = menus.find((menu: any) => state.url.includes(menu?.path || 'undefined'));
    if (menuActive?.permissions?.some((permission: string) => requiredPermissions.includes(permission))
    ) {
      return true;
    } else {
      this.router.navigate(['/error/403']).then();
      return false;
    }
  }
}
