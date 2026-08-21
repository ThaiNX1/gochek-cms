import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { takeUntil } from 'rxjs';
import { BaseClass } from '../../commons/base.class';
import { CREATE_WAREHOUSE, DELETE_WAREHOUSE, GET_WAREHOUSES, UPDATE_WAREHOUSE } from '../../commons/queries/warehouse.query';
import { PaginatedWarehouseResponse } from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TableComponent,
    DirectiveModule,
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss',
})
export class WarehouseComponent extends BaseClass {
  @ViewChild('warehouseDialogContent') warehouseDialogContent!: TemplateRef<any>;

  warehouseForm!: FormGroup;
  dialogData: DialogData = {
    title: 'Thêm kho',
    showActions: false,
    showCloseButton: true,
    width: '640px',
    align: 'center',
    type: 'default',
    confirmText: 'Lưu',
    cancelText: 'Hủy',
  };

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Mã kho', field: 'code', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Tên kho', field: 'name', className: 'min-w-[180px] max-w-[180px]' },
      { name: 'Quản lý', field: 'managerName', className: 'min-w-[140px] max-w-[140px]' },
      { name: 'Số điện thoại', field: 'phone', className: 'min-w-[130px] max-w-[130px]' },
      { name: 'Địa chỉ', field: 'address', className: 'min-w-[220px] max-w-[220px]' },
      { name: 'Trạng thái', field: 'isActive', className: 'min-w-[120px] max-w-[120px]', templateCode: 'statusColumnTemplate' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Hành động', field: 'action', className: 'min-w-[120px] max-w-[120px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    this.warehouseForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      managerName: new FormControl(''),
      phone: new FormControl(''),
      address: new FormControl(''),
      description: new FormControl(''),
      isActive: new FormControl(true),
    });
    await this.onGetWarehouses();
  }

  async onGetWarehouses(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedWarehouseResponse>(GET_WAREHOUSES, {
      pagination: {
        page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    });
    this.dataSource = response?.warehouses?.data?.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
    })) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.warehouses?.pagination?.page ?? 1) - 1,
      size: response?.warehouses?.pagination?.size ?? 20,
      total: response?.warehouses?.pagination?.total ?? 0,
    };
  }

  async onPageChange(event: PageEvent) {
    await this.onGetWarehouses(event.pageIndex + 1);
  }

  onAddEditWarehouse(item: any = null) {
    if (item) {
      this.warehouseForm.patchValue({
        id: item.id,
        name: item.name,
        code: item.code,
        managerName: item.managerName,
        phone: item.phone,
        address: item.address,
        description: item.description,
        isActive: item.isActive,
      });
    } else {
      this.warehouseForm.reset({
        isActive: true,
      });
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: item ? 'Sửa kho' : 'Thêm kho',
        type: 'default',
        confirmText: item ? 'Cập nhật' : 'Thêm',
        showActions: false,
      },
      width: this.dialogData.width,
    });
    dialogRef.componentInstance.content = this.warehouseDialogContent;
  }

  async saveWarehouse() {
    this.warehouseForm.markAllAsTouched();
    if (this.warehouseForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const formValue = this.warehouseForm.value;
    const input = {
      name: formValue.name,
      code: formValue.code,
      managerName: formValue.managerName,
      phone: formValue.phone,
      address: formValue.address,
      description: formValue.description,
      isActive: formValue.isActive,
    };
    const response = formValue.id
      ? await this.injector.get(ApiService).executeMutation(UPDATE_WAREHOUSE, {
        id: formValue.id,
        input,
      })
      : await this.injector.get(ApiService).executeMutation(CREATE_WAREHOUSE, {
        input: {
          name: input.name,
          code: input.code,
          managerName: input.managerName,
          phone: input.phone,
          address: input.address,
          description: input.description,
        },
      });

    if (response) {
      this.commonService.openSnackBar(formValue.id ? 'Cập nhật kho thành công' : 'Thêm kho thành công');
      this.dialog.closeAll();
      await this.onGetWarehouses(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError(formValue.id ? 'Cập nhật kho thất bại' : 'Thêm kho thất bại');
    }
  }

  onDeleteWarehouse(item: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xóa kho',
        message: `Bạn có chắc chắn muốn xóa kho "${item.name}" không?`,
        type: 'error',
        confirmText: 'Xóa',
        showActions: true,
      },
      width: this.dialogData.width,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        await this.onRemoveWarehouse(item);
      }
    });
  }

  async onRemoveWarehouse(item: any) {
    const response = await this.injector.get(ApiService).executeMutation(DELETE_WAREHOUSE, {
      id: item.id,
    });
    if (response) {
      this.commonService.openSnackBar('Xóa kho thành công');
      await this.onGetWarehouses(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Xóa kho thất bại');
    }
  }

  async onToggleStatus(item: any) {
    const action = item.isActive ? 'vô hiệu hóa' : 'kích hoạt';
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xác nhận',
        message: `Bạn có chắc chắn muốn ${action} kho "${item.name}" không?`,
        type: 'error',
        confirmText: 'Xác nhận',
        showActions: true,
      },
      width: this.dialogData.width,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(UPDATE_WAREHOUSE, {
          id: item.id,
          input: { isActive: !item.isActive },
        });
        if (response) {
          this.commonService.openSnackBar('Cập nhật trạng thái kho thành công');
          await this.onGetWarehouses(this.pagination.page + 1);
        } else {
          this.commonService.openSnackBarError('Cập nhật trạng thái kho thất bại');
        }
      }
    });
  }

  onCancel() {
    this.dialog.closeAll();
  }
}
