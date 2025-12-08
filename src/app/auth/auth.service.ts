import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { CommonService } from '../core/services/common.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apollo = inject(Apollo);
  commonService = inject(CommonService);
  router = inject(Router);

}
