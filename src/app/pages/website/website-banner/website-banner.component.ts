import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BaseClass } from '../../../commons/base.class';
import { WebsiteBanner } from '../../../commons/types';
import { TableColumnType } from '../../../core/constants/enum';
import { ApiService } from '../../../core/services/api.service';
import { TableComponent } from '../../../shared/components/table/table.component';
import { DirectiveModule } from '../../../shared/directive.module';
import { GET_WEBSITE_BANNERS, REMOVE_WEBSITE_BANNER } from '../../../commons/queries/website.query';

@Component({
  selector: 'app-website-banner',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    TableComponent,
    ReactiveFormsModule,
    DirectiveModule,
  ],
  templateUrl: './website-banner.component.html',
  styleUrl: './website-banner.component.scss'
})
export class WebsiteBannerComponent extends BaseClass {

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Hình ảnh', field: 'imageUrl', className: 'min-w-[150px] max-w-[150px]', templateCode: 'imageColumnTemplate' },
      { name: 'Tiêu đề', field: 'title', className: 'min-w-[200px] max-w-[300px]' },
      { name: 'Thứ tự', field: 'order', className: 'text-center min-w-[80px] max-w-[80px]', type: TableColumnType.NUMBER },
      { name: 'Trạng thái', field: 'isActive', className: 'min-w-[120px] max-w-[120px]', templateCode: 'statusColumnTemplate' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    await this.onGetBanners();
  }

  async onGetBanners(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<{ websiteBanners: WebsiteBanner[] }>(GET_WEBSITE_BANNERS, {
      pagination: {
        page: page,
        size: 20,
      },
    });
    this.dataSource = response?.websiteBanners?.data?.reduce((acc: any, item, index) => {
      acc.push({
        ...item,
        index: (page - 1) * 20 + index + 1,
      });
      return acc;
    }, []) || [];
    this.pagination = {
      ...this.pagination,
      page: page - 1,
      size: 20,
      total: response?.websiteBanners?.pagination?.total || 0,
    };
  }

  async onPageChange(event: PageEvent) {
    await this.onGetBanners(event.pageIndex + 1);
  }

  onAddBanner() {
    this.router.navigate(['/website/banner/create']);
  }

  onEditBanner(item: WebsiteBanner) {
    this.router.navigate(['/website/banner', item.id]);
  }

  async onDeleteBanner(item: WebsiteBanner) {
    if (!confirm(`Bạn có chắc chắn muốn xóa banner "${item.title}"?`)) {
      return;
    }

    try {
      await this.injector.get(ApiService).executeMutation(REMOVE_WEBSITE_BANNER, { id: item.id });
      this.snackBar.open('Xóa banner thành công', 'Đóng', { duration: 3000 });
      await this.onGetBanners();
    } catch (error) {
      this.snackBar.open('Xóa banner thất bại', 'Đóng', { duration: 3000 });
    }
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Đang hiển thị' : 'Đã ẩn';
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium'
      : 'px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium';
  }
}
