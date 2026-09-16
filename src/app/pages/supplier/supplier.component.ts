import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { PaginatedSupplierResponse, Supplier } from '../../commons/types';
import { CREATE_SUPPLIER, DELETE_SUPPLIER, GET_SUPPLIERS, UPDATE_SUPPLIER } from '../../commons/queries/supplier.query';
import { DialogNotificationComponent } from '../../shared/components/dialog-notification/dialog-notification.component';

@Component({
  selector: 'app-supplier',
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
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss'
})
export class SupplierComponent extends BaseClass {
  @ViewChild('createDialogContent') createDialogContent!: TemplateRef<any>;
  @ViewChild('deleteNotification') deleteNotification!: TemplateRef<any>;
  
  createForm!: FormGroup;
  selectedItem: any = null;

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Mã NCC', field: 'code', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Tên nhà cung cấp', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Người liên hệ', field: 'contactPerson', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Số điện thoại', field: 'phone', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Email', field: 'email', className: 'min-w-[180px] max-w-[180px]' },
      { name: 'Địa chỉ', field: 'address', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Mã số thuế', field: 'taxCode', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Trạng thái', field: 'statusName', className: 'min-w-[150px] max-w-[150px]', templateCode: 'statusColumnTemplate' },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    this.createForm = new FormGroup({
      id: new FormControl(''),
      code: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      contactPerson: new FormControl(''),
      phone: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      address: new FormControl(''),
      taxCode: new FormControl(''),
      description: new FormControl(''),
    });
    await this.onGetData();
  }

  async onGetData(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedSupplierResponse>(
      GET_SUPPLIERS,
      {
        pagination: {
          page: page < 1 ? 1 : page,
          size: 20,
          keyword: this.filterForm.value.keyword ?? '',
        },
      }
    );

    this.dataSource = response?.suppliers?.data?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        statusName: item.isActive ? 'Hoạt động' : 'Không hoạt động',
      });
      return acc;
    }, []) ?? [];

    this.pagination = {
      ...this.pagination,
      page: (response?.suppliers?.pagination?.page ?? 1) - 1,
      size: response?.suppliers?.pagination?.size ?? 20,
      total: response?.suppliers?.pagination?.total ?? 0,
    };
  }

  async onPageChange(event: PageEvent) {
    await this.onGetData(event.pageIndex + 1);
  }

  onOpenCreateDialog() {
    this.createForm.reset();
    this.commonService.openRightSlideNav({
      title: 'Thêm nhà cung cấp',
      content: this.createDialogContent,
      width: '600px',
    });
  }

  async onEdit(item: any) {
    this.createForm.patchValue({
      id: item.id,
      code: item.code,
      name: item.name,
      contactPerson: item.contactPerson,
      phone: item.phone,
      email: item.email,
      address: item.address,
      taxCode: item.taxCode,
      description: item.description,
    });
    this.commonService.openRightSlideNav({
      title: 'Sửa nhà cung cấp',
      content: this.createDialogContent,
      width: '600px',
    });
  }

  async onSave() {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const id = this.createForm.value.id;
    const input = {
      code: this.createForm.value.code,
      name: this.createForm.value.name,
      contactPerson: this.createForm.value.contactPerson || null,
      phone: this.createForm.value.phone || null,
      email: this.createForm.value.email || null,
      address: this.createForm.value.address || null,
      taxCode: this.createForm.value.taxCode || null,
      description: this.createForm.value.description || null,
    };

    const response = id
      ? await this.injector.get(ApiService).executeMutation<{ updateSupplier: Supplier }>(
          UPDATE_SUPPLIER,
          { id, input }
        )
      : await this.injector.get(ApiService).executeMutation<{ createSupplier: Supplier }>(
          CREATE_SUPPLIER,
          { input }
        );

    if (response) {
      this.commonService.openSnackBar(id ? 'Cập nhật nhà cung cấp thành công' : 'Thêm nhà cung cấp thành công');
      this.commonService.closeRightSlideNav();
      await this.onGetData(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError(id ? 'Cập nhật nhà cung cấp thất bại' : 'Thêm nhà cung cấp thất bại');
    }
  }

  onCancel() {
    this.commonService.closeRightSlideNav();
  }

  override ngOnDestroy(): void {
    this.commonService.closeRightSlideNav();
    super.ngOnDestroy();
  }

  async onDelete(item: any) {
    this.selectedItem = item;
    const dialogRef = this.injector.get(MatDialog).open(DialogNotificationComponent, {
      disableClose: true,
      data: {
        title: 'Xác nhận xóa',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });
    dialogRef.componentInstance.content = this.deleteNotification;
    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(
          DELETE_SUPPLIER,
          { id: this.selectedItem.id }
        );
        if (response) {
          this.commonService.openSnackBar('Xóa nhà cung cấp thành công');
          await this.onGetData(
            this.dataSource.length === 1 && this.pagination.page > 0
              ? this.pagination.page
              : this.pagination.page + 1
          );
        } else {
          this.commonService.openSnackBarError('Xóa nhà cung cấp thất bại');
        }
      }
    });
  }
}
