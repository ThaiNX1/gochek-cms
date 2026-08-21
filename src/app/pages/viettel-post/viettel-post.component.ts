import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { BaseClass } from '../../commons/base.class';
import { GET_SHIPPING_ORDERS, UPDATE_SHIPPING_STATUS } from '../../commons/queries/shipping.query';
import { GET_ACTIVE_WAREHOUSES } from '../../commons/queries/warehouse.query';
import { PaginatedShippingOrderResponse, ShippingStatusEnum, Warehouse } from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';

@Component({
  selector: 'app-viettel-post',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TableComponent,
    DirectiveModule,
  ],
  templateUrl: './viettel-post.component.html',
  styleUrl: './viettel-post.component.scss',
})
export class ViettelPostComponent extends BaseClass {
  @ViewChild('shippingStatusDialogContent') shippingStatusDialogContent!: TemplateRef<any>;

  warehouses: Warehouse[] = [];
  shippingStatusForm!: FormGroup;
  statusOptions = [
    { value: ShippingStatusEnum.PENDING, name: 'Chờ xử lý' },
    { value: ShippingStatusEnum.PICKED_UP, name: 'Đã lấy hàng' },
    { value: ShippingStatusEnum.IN_TRANSIT, name: 'Đang vận chuyển' },
    { value: ShippingStatusEnum.OUT_FOR_DELIVERY, name: 'Đang giao hàng' },
    { value: ShippingStatusEnum.DELIVERED, name: 'Đã giao' },
    { value: ShippingStatusEnum.FAILED, name: 'Giao thất bại' },
    { value: ShippingStatusEnum.RETURNED, name: 'Hoàn hàng' },
    { value: ShippingStatusEnum.CANCELLED, name: 'Đã hủy' },
  ];
  dialogData: DialogData = {
    title: 'Cập nhật trạng thái vận chuyển',
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
      { name: 'Mã đơn', field: 'orderNumber', className: 'min-w-[130px] max-w-[130px]' },
      { name: 'Mã vận đơn', field: 'trackingNumber', className: 'min-w-[140px] max-w-[140px]' },
      { name: 'Serial', field: 'serialNumber', className: 'min-w-[130px] max-w-[130px]' },
      { name: 'Kho xuất', field: 'fromWarehouseName', className: 'min-w-[160px] max-w-[160px]' },
      { name: 'Trạng thái', field: 'shippingStatusName', className: 'min-w-[130px] max-w-[130px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[140px] max-w-[140px]', type: TableColumnType.DATE_TIME },
      { name: 'Hành động', field: 'action', className: 'min-w-[120px] max-w-[120px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      trackingNumber: new FormControl(''),
      serialNumber: new FormControl(''),
      shippingStatus: new FormControl(''),
    });
    this.shippingStatusForm = new FormGroup({
      stockHistoryId: new FormControl('', [Validators.required]),
      trackingNumber: new FormControl(''),
      newStatus: new FormControl('', [Validators.required]),
      returnWarehouseId: new FormControl(''),
      location: new FormControl(''),
      note: new FormControl(''),
    });
    await Promise.all([
      this.onGetActiveWarehouses(),
      this.onGetShippingOrders(),
    ]);
  }

  async onGetActiveWarehouses() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_ACTIVE_WAREHOUSES);
    this.warehouses = response?.activeWarehouses ?? [];
  }

  async onGetShippingOrders(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_SHIPPING_ORDERS, {
      pagination: {
        page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
        trackingNumber: this.filterForm.value.trackingNumber ?? '',
        serialNumber: this.filterForm.value.serialNumber ?? '',
        shippingStatus: this.filterForm.value.shippingStatus || null,
      },
    });
    const shippingOrders = response?.shippingOrders as PaginatedShippingOrderResponse | undefined;
    this.dataSource = shippingOrders?.data?.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
      fromWarehouseName: this.getWarehouseName(item.stockHistory?.fromWarehouse, item.stockHistory?.fromWarehouseId),
      shippingStatusName: this.getShippingStatusName(item.shippingStatus),
    })) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (shippingOrders?.pagination?.page ?? 1) - 1,
      size: shippingOrders?.pagination?.size ?? 20,
      total: shippingOrders?.pagination?.total ?? 0,
    };
  }

  async onPageChange(event: PageEvent) {
    await this.onGetShippingOrders(event.pageIndex + 1);
  }

  onOpenUpdateStatusDialog(item: any) {
    if (!item.stockHistoryId) {
      this.commonService.openSnackBarError('Đơn vận chuyển chưa có lịch sử kho để cập nhật trạng thái');
      return;
    }

    this.shippingStatusForm.reset({
      stockHistoryId: item.stockHistoryId,
      trackingNumber: item.trackingNumber,
      newStatus: item.shippingStatus,
      returnWarehouseId: item.stockHistory?.fromWarehouseId ?? '',
    });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: this.dialogData,
      width: this.dialogData.width,
    });
    dialogRef.componentInstance.content = this.shippingStatusDialogContent;
  }

  async onUpdateShippingStatusSave() {
    this.shippingStatusForm.markAllAsTouched();
    if (this.shippingStatusForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const formValue = this.shippingStatusForm.value;
    const response = await this.injector.get(ApiService).executeMutation(UPDATE_SHIPPING_STATUS, {
      input: {
        stockHistoryId: formValue.stockHistoryId,
        trackingNumber: formValue.trackingNumber,
        newStatus: formValue.newStatus,
        returnWarehouseId: formValue.newStatus === ShippingStatusEnum.RETURNED ? formValue.returnWarehouseId || null : null,
        location: formValue.location,
        note: formValue.note,
      },
    });

    if (response?.updateShippingStatus) {
      this.commonService.openSnackBar('Cập nhật trạng thái vận chuyển thành công');
      this.dialog.closeAll();
      await this.onGetShippingOrders(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Cập nhật trạng thái vận chuyển thất bại');
    }
  }

  onOpenPrintUrl(item: any) {
    if (!item.printUrl) {
      this.commonService.openSnackBarError('Đơn vận chuyển chưa có link in');
      return;
    }

    window.open(item.printUrl, '_blank');
  }

  onCancel() {
    this.dialog.closeAll();
  }

  getWarehouseName(warehouse: Warehouse | null | undefined, warehouseId: string | null | undefined): string {
    if (warehouse) {
      return warehouse.code ? `${warehouse.name} (${warehouse.code})` : warehouse.name;
    }

    return warehouseId ?? '';
  }

  getShippingStatusName(status: ShippingStatusEnum): string {
    return this.statusOptions.find((item) => item.value === status)?.name ?? status;
  }

  get isReturnedStatus(): boolean {
    return this.shippingStatusForm?.value?.newStatus === ShippingStatusEnum.RETURNED;
  }
}
