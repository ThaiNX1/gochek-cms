import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { BaseClass } from '../../commons/base.class';
import { IMAGE_CONVERT_HISTORY_QUERY } from '../../commons/queries/image-convert.query';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { ImageConvertHistoryData } from '../../commons/types';

@Component({
  selector: 'app-image-convert',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
  ],
  templateUrl: './image-convert.component.html',
  styleUrl: './image-convert.component.scss'
})
export class ImageConvertComponent extends BaseClass implements OnInit {

  constructor() {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Kích thước', field: 'dimensions', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Số ảnh tải lên', field: 'totalFiles', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.NUMBER },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[150px] max-w-[150px]', type: TableColumnType.DATE_TIME },
      { name: 'Hành động', field: 'action', className: 'min-w-[80px] max-w-[80px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.onGetHistory();
  }

  async onGetHistory(page: number = 1): Promise<void> {
    try {
      const apiService = this.injector.get(ApiService);
      const response = await apiService.executeQuery<any>(
        IMAGE_CONVERT_HISTORY_QUERY,
        {
          page: page,
          limit: this.pagination.size
        },
        'network-only'
      );

      const historyData = response?.getImageConvertHistory;

      this.dataSource = historyData?.data?.reduce((acc: any, item: ImageConvertHistoryData, index: number) => {
        acc.push({
          ...item,
          index: index + 1 + (page - 1) * this.pagination.size,
          totalFiles: item.convertedImages?.length ?? 0,
        });
        return acc;
      }, []) ?? [];

      this.pagination = {
        ...this.pagination,
        page: (historyData?.pagination?.page ?? 1) - 1,
        size: historyData?.pagination?.size ?? 20,
        total: historyData?.pagination?.total ?? 0,
      };
    } catch (e) {
      console.error('Get history failed', e);
    }
  }

  async onPageChange(event: PageEvent): Promise<void> {
    this.pagination.size = event.pageSize;
    await this.onGetHistory(event.pageIndex + 1);
  }

  downloadResult(item: any): void {
    if (item.results && item.results.length > 0) {
      // Logic for downloading or viewing results, maybe opening a dialog to show multiple images
    }
  }
}
