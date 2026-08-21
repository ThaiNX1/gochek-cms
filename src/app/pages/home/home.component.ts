import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { BaseClass } from '../../commons/base.class';
import { ManufacturingManagementDashboardComponent } from './components/manufacturing-management-dashboard/manufacturing-management-dashboard.component';
import { OverviewDashboardComponent } from './components/overview-dashboard/overview-dashboard.component';

type HomeDashboard = 'overview' | 'manufacturing-management';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonToggleModule,
        MatIconModule,
        ManufacturingManagementDashboardComponent,
        OverviewDashboardComponent,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseClass {
    selectedDashboard: HomeDashboard = 'overview';

    readonly canViewManufacturingDashboard = this.hasPermission([
        this.PermissionEnum.DEVICES_MANAGE,
    ]);

    onSelectDashboard(dashboard: HomeDashboard): void {
        if (dashboard === 'manufacturing-management' && !this.canViewManufacturingDashboard) {
            return;
        }
        this.selectedDashboard = dashboard;
    }
}
