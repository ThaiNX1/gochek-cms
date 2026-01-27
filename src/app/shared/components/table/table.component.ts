import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonService } from '../../../core/services/common.service';
import { TableColumnType } from '../../../core/constants/enum';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent implements OnInit, OnChanges{
  @Input() dataSource: any[] = [];
  @Input() columns: any[] = [];
  @Input() pagination: any;
  @Input() showHeader: boolean = true;
  @Input() expandable: boolean = false;
  @Input() expandTemplate: any;
  @Output() pageChange = new EventEmitter<PageEvent>();
  displayedStringColumns: string[] = [];
  displayedColumnsWithExpand: string[] = [];
  TableColumnType = TableColumnType;
  commonService = inject(CommonService);
  expandedElement: any | null = null;

  ngOnInit(): void {
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['columns']){
      this.displayedStringColumns = this.columns.reduce((acc, item) => {
        acc.push(item.field?.toString() ?? '');
        return acc;
      }, []);
      
      // Add expand column if expandable is true
      if(this.expandable) {
        this.displayedColumnsWithExpand = ['expand', ...this.displayedStringColumns];
      } else {
        this.displayedColumnsWithExpand = [...this.displayedStringColumns];
      }
    }
  }
  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
  
  toggleRow(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }
}
