import { Component } from '@angular/core';
import { ManufacturingManagementDashboardComponent } from '../home/components/manufacturing-management-dashboard/manufacturing-management-dashboard.component';

@Component({
  selector: 'app-manufacturing-dashboard',
  standalone: true,
  imports: [ManufacturingManagementDashboardComponent],
  template: `
    <div class="flex flex-1 min-h-0 flex-col overflow-auto gray-500-scroll px-4 pt-2 pb-4">
      <app-manufacturing-management-dashboard />
    </div>
  `,
  styles: [':host { display:flex; flex:1; min-height:0; flex-direction:column; overflow:hidden; }'],
})
export class ManufacturingDashboardComponent {}
