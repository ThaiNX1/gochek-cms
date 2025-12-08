import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs';
import { BaseClass } from '../../commons/base.class';
import { GET_ORGANIZATIONS, UPDATE_ORGANIZATION } from '../../commons/queries/organization.query';
import { PaginatedOrganizationResponse } from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
    ReactiveFormsModule,
  ],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
  host: {
    class: 'flex-1 flex flex-col items-stretch justify-start overflow-auto'
  }
})
export class OrganizationComponent extends BaseClass {
  @ViewChild('organizationDialogContent') organizationDialogContent!: TemplateRef<any>;
  dialogData: DialogData = {
    title: 'Xác nhận',
    showActions: true,
    showCloseButton: true,
    width: '600px',
    align: 'center',
    type: 'error',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
  }

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER, },
      { name: 'Tên chi nhánh/cửa hàng', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Thương hiệu', field: 'shortName', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Địa chỉ', field: 'address', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Email', field: 'email', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Số điện thoại', field: 'phone', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Trạng thái', field: 'isActive', className: 'min-w-[150px] max-w-[150px]', templateCode: 'statusColumnTemplate' },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ]
  }
  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      roomId: new FormControl(''),
    });
    await this.onGetOrganizations();
  }

  async onGetOrganizations(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedOrganizationResponse>(GET_ORGANIZATIONS, {
      pagination: {
        page: page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    });
    this.dataSource = response?.organizations?.data?.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
    })) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.organizations?.pagination?.page ?? 1) - 1,
      size: response?.organizations?.pagination?.size ?? 20,
      total: response?.organizations?.pagination?.total ?? 0
    }
  }

  onPageChange(event: PageEvent) {
    this.onGetOrganizations(event.pageIndex + 1);
  }

  async onToggleStatus(item: any) {
    const action = item.isActive ? 'vô hiệu hóa' : 'kích hoạt';
    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn ${action} tổ chức "${item.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xác nhận',
        type: 'error',
        showActions: true,
      },
      width: this.dialogData.width
    });
    dialogRef.componentInstance.content = this.organizationDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(UPDATE_ORGANIZATION, {
          id: item.id,
          input: { isActive: !item.isActive }
        });
        if (response) {
          this.commonService.openSnackBar(`Cập nhật trạng thái thành công`);
          this.onGetOrganizations();
        }
      }
    });
  }

  onDeleteOrganization(item: any) {
    // TODO: Implement delete functionality
  }
}
