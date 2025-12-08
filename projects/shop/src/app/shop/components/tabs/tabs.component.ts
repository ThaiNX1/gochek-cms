import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string): void {
    this.tabChange.emit(tabId);
  }

  getTabClasses(tabId: string): string {
    const baseClasses =
      'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200';
    const activeClasses = 'border-black text-black';
    const inactiveClasses =
      'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

    return `${baseClasses} ${tabId === this.activeTabId ? activeClasses : inactiveClasses}`;
  }
}
