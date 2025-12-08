import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {storageKey} from "../constants/storage-key";
import {AuthService} from "../../auth/auth.service";
import { UserState } from '../../commons/types';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(
    private readonly router: Router,
  ) {
  }
  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (localStorage.getItem(storageKey.token)?.length) {
      const user = JSON.parse(localStorage.getItem(storageKey.user) || '{}');
      if (user?.state === UserState.CONFIRM_OTP) {
        this.router.navigate(['/confirm-otp']).then();
        return false;
      }
      return true
    } else {
      this.router.navigate(['/login']);
      return false
    }
  }
}
