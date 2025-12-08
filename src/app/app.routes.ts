import { Routes } from '@angular/router';
import { ForbidenComponent } from './auth/forbiden/forbiden.component';
import { LoginComponent } from './auth/login/login.component';
import { NotFoundComponent } from './auth/not-found/not-found.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuardService } from './core/guards/auth-guard.guard';
import { ConfirmOtpComponent } from './auth/confirm-otp/confirm-otp.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./layout/layout-routing.module').then(m => m.LayoutRoutingModule),
        canActivate: [AuthGuardService],
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'confirm-otp',
    component: ConfirmOtpComponent,
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('@angular-architects/module-federation')
        .then((mf) => mf.loadRemoteModule({
          type: 'module',
          remoteEntry: 'https://angular18-cms.onrender.com/shop/remoteEntry.js',
          exposedModule: './Module',
        }))
        .then((m) => m.RemoteEntryModule),
  },
  {
    path: '403',
    component: ForbidenComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
