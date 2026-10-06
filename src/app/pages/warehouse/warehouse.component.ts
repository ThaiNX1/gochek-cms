import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { takeUntil } from 'rxjs';
import { BaseClass } from '../../commons/base.class';
import { GET_NHANH_CREDENTIALS } from '../../commons/queries/partner-credential.query';
import { CONFIGURE_WAREHOUSE_NHANH, CREATE_WAREHOUSE, DELETE_WAREHOUSE, GET_NHANH_DEPOTS, GET_WAREHOUSES, UPDATE_WAREHOUSE } from '../../commons/queries/warehouse.query';
import { NhanhDepotResponse, PaginatedWarehouseResponse, PartnerCredential, Warehouse } from '../../commons/types';
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
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
    TableComponent,
    DirectiveModule,
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss',
})
export class WarehouseComponent extends BaseClass {
  @ViewChild('warehouseDialogContent') warehouseDialogContent!: TemplateRef<any>;
  @ViewChild('syncNhanhWarehouseDialogContent') syncNhanhWarehouseDialogContent!: TemplateRef<any>;

  warehouseForm!: FormGroup;
  warehouseOptions: Warehouse[] = [];
  nhanhCredentials: PartnerCredential[] = [];
  nhanhDepots: NhanhDepotResponse[] = [];
  selectedWarehouse: Warehouse | null = null;
  isLoadingNhanhDepots = false;
  isSyncingNhanhWarehouse = false;
  syncNhanhWarehouseForm = new FormGroup({
    warehouseId: new FormControl('', [Validators.required]),
    partnerCredentialId: new FormControl('', [Validators.required]),
    nhanhDepotId: new FormControl('', [Validators.required]),
  });
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
      { name: 'Tên kho', field: 'name', className: 'min-w-[200px] max-w-[200px]', tdClassName: '!h-auto min-h-[60px] py-2', templateCode: 'warehouseNameColumnTemplate' },
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

  async onOpenSyncNhanhWarehouseDialog(warehouse?: Warehouse): Promise<void> {
    this.selectedWarehouse = null;
    this.warehouseOptions = [];
    this.nhanhDepots = [];
    this.syncNhanhWarehouseForm.reset();

    const [credentialResponse, warehouseResponse] = await Promise.all([
      this.injector.get(ApiService).executeQuery<any>(GET_NHANH_CREDENTIALS),
      this.injector.get(ApiService).executeQuery<any>(GET_WAREHOUSES, {
        pagination: { page: 1, size: 100 },
      }),
    ]);
    this.nhanhCredentials = (credentialResponse?.nhanhCredentials ?? [])
      .slice()
      .sort((first: PartnerCredential, second: PartnerCredential) =>
        first.environment.localeCompare(second.environment)
        || (first.businessId ?? '').localeCompare(second.businessId ?? '')
        || (first.appId ?? '').localeCompare(second.appId ?? ''));
    this.warehouseOptions = warehouseResponse?.warehouses?.data ?? [];
    if (warehouse && !this.warehouseOptions.some((item) => item.id === warehouse.id)) {
      this.warehouseOptions.unshift(warehouse);
    }

    const defaultWarehouse = warehouse ?? this.warehouseOptions[0];
    if (defaultWarehouse) {
      await this.onSyncWarehouseSelectionChange(defaultWarehouse.id);
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      data: {
        title: warehouse ? `Đồng bộ kho "${warehouse.name}" với Nhanh.vn` : 'Đồng bộ kho với Nhanh.vn',
        showActions: false,
        showCloseButton: false,
      },
      width: '560px',
    });
    dialogRef.componentInstance.content = this.syncNhanhWarehouseDialogContent;
  }

  async onSyncWarehouseSelectionChange(warehouseId: string): Promise<void> {
    this.selectedWarehouse = this.warehouseOptions.find((warehouse) => warehouse.id === warehouseId) ?? null;
    this.nhanhDepots = [];
    this.syncNhanhWarehouseForm.patchValue({
      warehouseId,
      partnerCredentialId: '',
      nhanhDepotId: '',
    });
    if (!this.selectedWarehouse) {
      return;
    }

    const defaultCredential = this.nhanhCredentials.find((credential) =>
      credential.id === this.selectedWarehouse?.nhanhPartnerCredentialId && credential.isActive)
      ?? this.nhanhCredentials.find((credential) => credential.isActive);
    if (defaultCredential) {
      const preferredDepotId = defaultCredential.id === this.selectedWarehouse.nhanhPartnerCredentialId
        ? this.selectedWarehouse.nhanhDepotId ?? undefined
        : undefined;
      await this.onNhanhCredentialChange(defaultCredential.id, preferredDepotId);
    }
  }

  async onNhanhCredentialChange(partnerCredentialId: string, preferredDepotId?: string): Promise<void> {
    this.syncNhanhWarehouseForm.patchValue({
      partnerCredentialId,
      nhanhDepotId: '',
    });
    this.nhanhDepots = [];
    if (!partnerCredentialId) {
      return;
    }

    this.isLoadingNhanhDepots = true;
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_NHANH_DEPOTS, {
      input: { partnerCredentialId },
    });
    this.isLoadingNhanhDepots = false;
    this.nhanhDepots = (response?.nhanhDepots ?? [])
      .slice()
      .sort((first: NhanhDepotResponse, second: NhanhDepotResponse) => first.name.localeCompare(second.name));

    const selectedDepot = this.nhanhDepots.find((depot) => depot.id === preferredDepotId)
      ?? this.nhanhDepots[0];
    if (selectedDepot) {
      this.syncNhanhWarehouseForm.patchValue({ nhanhDepotId: selectedDepot.id });
    }
  }

  async onSyncNhanhWarehouse(): Promise<void> {
    this.syncNhanhWarehouseForm.markAllAsTouched();
    if (!this.selectedWarehouse || this.syncNhanhWarehouseForm.invalid || this.isSyncingNhanhWarehouse) {
      this.commonService.openSnackBarError('Vui lòng chọn đầy đủ tài khoản và kho Nhanh.vn');
      return;
    }

    const formValue = this.syncNhanhWarehouseForm.getRawValue();
    const selectedDepot = this.nhanhDepots.find((depot) => depot.id === formValue.nhanhDepotId);
    this.isSyncingNhanhWarehouse = true;
    const response = await this.injector.get(ApiService).executeMutation<any>(CONFIGURE_WAREHOUSE_NHANH, {
      input: {
        warehouseId: this.selectedWarehouse.id,
        partnerCredentialId: formValue.partnerCredentialId,
        nhanhDepotId: formValue.nhanhDepotId,
      },
    });
    this.isSyncingNhanhWarehouse = false;

    if (!response?.configureWarehouseNhanh) {
      this.commonService.openSnackBarError('Đồng bộ kho với Nhanh.vn thất bại');
      return;
    }

    const warehouseName = this.selectedWarehouse.name;
    this.dialog.closeAll();
    this.selectedWarehouse = null;
    await this.onGetWarehouses(this.pagination.page + 1);
    this.commonService.openSnackBar(`Đã liên kết kho "${warehouseName}" với "${selectedDepot?.name ?? formValue.nhanhDepotId}"`);
  }

  onCancelSyncNhanhWarehouse(): void {
    if (!this.isSyncingNhanhWarehouse) {
      this.selectedWarehouse = null;
      this.dialog.closeAll();
    }
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
