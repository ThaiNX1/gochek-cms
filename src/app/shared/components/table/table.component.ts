import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonService } from '../../../core/services/common.service';
import { TableColumnType } from '../../../core/constants/enum';

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
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnChanges{
  @Input() dataSource: any[] = [];
  @Input() columns: any[] = [];
  @Input() pagination: any;
  @Input() showHeader: boolean = true;
  @Output() pageChange = new EventEmitter<PageEvent>();
  displayedStringColumns: string[] = [];
  TableColumnType = TableColumnType;
  commonService = inject(CommonService);

  ngOnInit(): void {
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['columns']){
      this.displayedStringColumns = this.columns.reduce((acc, item) => {
        acc.push(item.field?.toString() ?? '');
        return acc;
      }, []);
    }
  }
  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
