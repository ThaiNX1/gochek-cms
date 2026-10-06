import { Component } from '@angular/core';
import { OverviewDashboardComponent } from '../home/components/overview-dashboard/overview-dashboard.component';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [OverviewDashboardComponent],
  template: `
    <div class="flex flex-1 min-h-0 flex-col overflow-auto gray-500-scroll p-2">
      <app-overview-dashboard />
    </div>
  `,
  styles: [':host { display:flex; flex:1; min-height:0; flex-direction:column; overflow:hidden; }'],
})
export class InventoryDashboardComponent {}
