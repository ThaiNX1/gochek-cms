import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { BaseClass } from '../../commons/base.class';
import { GET_DEVICE_ACTIVE_CODE } from '../../commons/queries/device.query';
import { GET_PARTNER_CREDENTIALS } from '../../commons/queries/partner-credential.query';
import {
  CREATE_VIETTEL_POST_ORDER,
  PRINT_VIETTEL_POST_ORDER,
  UPDATE_SHIPPING_STATUS,
} from '../../commons/queries/shipping.query';
import { GET_STOCK_HISTORIES } from '../../commons/queries/stock.query';
import { GET_ACTIVE_WAREHOUSES } from '../../commons/queries/warehouse.query';
import {
  BatchLabelItem,
  PaginatedStockHistoryResponse,
  PartnerCredential,
  PartnerEnvironment,
  PartnerKey,
  ShippingStatusEnum,
  ShippingOrder,
  StockEventType,
  Warehouse,
} from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatStepperModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule,
    TableComponent,
    DirectiveModule,
  ],
  templateUrl: './stock-history.component.html',
  styleUrl: './stock-history.component.scss',
})
export class StockHistoryComponent extends BaseClass {
  @ViewChild('shipDeviceDrawerContent') shipDeviceDrawerContent!: TemplateRef<any>;

  readonly ShippingStatusEnum = ShippingStatusEnum;
  override columns = [
    { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
    { name: 'Thời gian', field: 'eventAt', className: 'min-w-[140px] max-w-[140px]', type: TableColumnType.DATE_TIME },
    { name: 'Loại', field: 'eventTypeName', className: 'min-w-[120px] max-w-[120px]' },
    { name: 'Kho', field: 'warehouseName', className: 'min-w-[150px] max-w-[150px]' },
    { name: 'Kho nguồn', field: 'fromWarehouseName', className: 'min-w-[150px] max-w-[150px]' },
    { name: 'Kho đích', field: 'toWarehouseName', className: 'min-w-[150px] max-w-[150px]' },
    { name: 'Serial', field: 'serialNumber', className: 'min-w-[130px] max-w-[130px]' },
    { name: 'Số lượng', field: 'quantity', className: 'min-w-[90px] max-w-[90px]', type: TableColumnType.NUMBER },
    { name: 'Mã vận đơn', field: 'trackingNumber', className: 'min-w-[140px] max-w-[140px]' },
    { name: 'Trạng thái VC', field: 'shippingStatusName', className: 'min-w-[130px] max-w-[130px]' },
    { name: 'Ghi chú', field: 'note', className: 'min-w-[180px] max-w-[180px]' },
    {
      name: 'Hành động',
      field: 'action',
      className: 'min-w-[130px] max-w-[130px]',
      tdClassName: 'bg-white',
      templateCode: 'actionColumnTemplate',
      stickyEnd: true,
    },
  ];
  historyDataSource: any[] = [];
  historyPagination = {
    page: 0,
    size: 20,
    total: 0,
  };
  warehouses: Warehouse[] = [];
  partnerCredentials: PartnerCredential[] = [];
  shippingOrderForm!: FormGroup;
  selectedHistoryItem: any | null = null;
  createdShippingOrder: ShippingOrder | null = null;
  shippingStepCompleted = false;
  shippingStepIndex = 0;
  isCreatingShippingOrder = false;
  cancellingHistoryId: string | null = null;
  printingHistoryId: string | null = null;
  printingOrderId: string | null = null;
  printingSerialLabel: string | null = null;
  printingActiveCodeLabel: string | null = null;
  readonly canCreateShippingOrder = this.hasPermission([
    this.PermissionEnum.VIETTEL_POST_CREATE_ORDER,
    this.PermissionEnum.VIETTEL_POST_MANAGE,
  ]);
  readonly canPrintShippingOrder = this.hasPermission([
    this.PermissionEnum.VIETTEL_POST_PRINT_ORDER,
    this.PermissionEnum.VIETTEL_POST_MANAGE,
  ]);
  eventTypes = [
    { value: StockEventType.STOCK_IN, name: 'Nhập kho' },
    { value: StockEventType.STOCK_OUT, name: 'Xuất kho' },
    { value: StockEventType.STOCK_TRANSFER, name: 'Chuyển kho' },
    { value: StockEventType.STOCK_ADJUST, name: 'Điều chỉnh' },
  ];

  readonly shippingStatusOptions = [
    { value: ShippingStatusEnum.PENDING, name: 'Chờ xử lý' },
    { value: ShippingStatusEnum.PICKED_UP, name: 'Đã lấy hàng' },
    { value: ShippingStatusEnum.IN_TRANSIT, name: 'Đang vận chuyển' },
    { value: ShippingStatusEnum.OUT_FOR_DELIVERY, name: 'Đang giao hàng' },
    { value: ShippingStatusEnum.DELIVERED, name: 'Đã giao hàng' },
    { value: ShippingStatusEnum.FAILED, name: 'Giao hàng thất bại' },
    { value: ShippingStatusEnum.RETURNED, name: 'Đã hoàn hàng' },
    { value: ShippingStatusEnum.CANCELLED, name: 'Đã hủy' },
  ];

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      batchCode: new FormControl(''),
      serialNumber: new FormControl(''),
      eventType: new FormControl(''),
      warehouseId: new FormControl(''),
      fromWarehouseId: new FormControl(''),
      toWarehouseId: new FormControl(''),
    });
    this.shippingOrderForm = new FormGroup({
      partnerCredentialId: new FormControl('', [Validators.required]),
      environment: new FormControl(PartnerEnvironment.PROD, [Validators.required]),
      receiverFullName: new FormControl('', [Validators.required]),
      receiverPhone: new FormControl('', [Validators.required]),
      receiverAddress: new FormControl('', [Validators.required]),
      productName: new FormControl('Thiết bị GoChek', [Validators.required]),
      productPrice: new FormControl(0, [Validators.required, Validators.min(0)]),
      productWeight: new FormControl(500, [Validators.required, Validators.min(1)]),
      orderService: new FormControl('VCN', [Validators.required]),
      orderPayment: new FormControl(1, [Validators.required, Validators.min(1)]),
      moneyCollection: new FormControl(0, [Validators.required, Validators.min(0)]),
      orderNote: new FormControl(''),
    });
    await Promise.all([
      this.onGetActiveWarehouses(),
      this.onGetHistories(),
      this.canCreateShippingOrder || this.canPrintShippingOrder
        ? this.onGetPartnerCredentials()
        : Promise.resolve(),
    ]);
  }

  async onGetActiveWarehouses() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_ACTIVE_WAREHOUSES);
    this.warehouses = response?.activeWarehouses ?? [];
  }

  async onGetPartnerCredentials() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_PARTNER_CREDENTIALS, {
      input: {
        partnerKey: PartnerKey.VIETTEL_POST,
        isActive: true,
      },
    });
    this.partnerCredentials = response?.partnerCredentials ?? [];
  }

  async onGetHistories(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_STOCK_HISTORIES, {
      pagination: {
        page: page < 1 ? 1 : page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
        batchCode: this.filterForm.value.batchCode ?? '',
        serialNumber: this.filterForm.value.serialNumber ?? '',
        eventType: this.filterForm.value.eventType || null,
        warehouseId: this.filterForm.value.warehouseId || null,
        fromWarehouseId: this.filterForm.value.fromWarehouseId || null,
        toWarehouseId: this.filterForm.value.toWarehouseId || null,
      },
    });
    const histories = response?.stockHistories as PaginatedStockHistoryResponse | undefined;
    this.historyDataSource = histories?.data?.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
      eventTypeName: this.getStockEventTypeName(item.eventType),
      warehouseName: this.getWarehouseName(item.warehouse, item.warehouseId),
      fromWarehouseName: this.getWarehouseName(item.fromWarehouse, item.fromWarehouseId),
      toWarehouseName: this.getWarehouseName(item.toWarehouse, item.toWarehouseId),
      shippingStatusName: this.getShippingStatusName(item.shippingStatus),
    })) ?? [];
    this.historyPagination = {
      ...this.historyPagination,
      page: (histories?.pagination?.page ?? 1) - 1,
      size: histories?.pagination?.size ?? 20,
      total: histories?.pagination?.total ?? 0,
    };
  }

  async onHistoryPageChange(event: PageEvent) {
    await this.onGetHistories(event.pageIndex + 1);
  }

  onOpenShipDeviceDrawer(item: any) {
    if (!item.id || !item.serialNumber) {
      this.commonService.openSnackBarError('Lịch sử xuất kho chưa có đủ thông tin serial');
      return;
    }

    const defaultCredential = this.partnerCredentials[0];
    this.selectedHistoryItem = item;
    this.createdShippingOrder = null;
    this.shippingStepCompleted = false;
    this.shippingStepIndex = 0;
    this.shippingOrderForm.reset({
      partnerCredentialId: defaultCredential?.id ?? '',
      environment: defaultCredential?.environment ?? PartnerEnvironment.PROD,
      productName: 'Thiết bị GoChek',
      productPrice: 0,
      productWeight: 500,
      orderService: 'VCN',
      orderPayment: 1,
      moneyCollection: 0,
    });
    this.commonService.openRightSlideNav({
      title: 'Lên đơn và in tem',
      content: this.shipDeviceDrawerContent,
      width: '760px',
      onClose: () => this.onShippingDrawerClosed(),
    });
  }

  onPartnerCredentialSelected(credentialId: string) {
    const credential = this.partnerCredentials.find((item) => item.id === credentialId);
    if (credential) {
      this.shippingOrderForm.patchValue({ environment: credential.environment });
    }
  }

  async onCreateShippingOrderSave() {
    this.shippingOrderForm.markAllAsTouched();
    if (this.shippingOrderForm.invalid || !this.selectedHistoryItem) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin lên đơn');
      return;
    }

    const formValue = this.shippingOrderForm.getRawValue();
    this.isCreatingShippingOrder = true;
    const response = await this.injector.get(ApiService).executeMutation(CREATE_VIETTEL_POST_ORDER, {
      input: {
        partnerCredentialId: formValue.partnerCredentialId,
        environment: formValue.environment,
        serialNumber: this.selectedHistoryItem.serialNumber,
        stockHistoryId: this.selectedHistoryItem.id,
        receiverFullName: formValue.receiverFullName?.trim(),
        receiverPhone: formValue.receiverPhone?.trim(),
        receiverAddress: formValue.receiverAddress?.trim(),
        productName: formValue.productName?.trim(),
        productPrice: Number(formValue.productPrice),
        productQuantity: 1,
        productWeight: Number(formValue.productWeight),
        orderService: formValue.orderService?.trim(),
        orderPayment: Number(formValue.orderPayment),
        moneyCollection: Number(formValue.moneyCollection),
        orderNote: formValue.orderNote,
        checkUnique: true,
      },
    });
    this.isCreatingShippingOrder = false;

    const createdOrder = response?.createViettelPostOrder;
    if (createdOrder) {
      this.createdShippingOrder = {
        ...createdOrder,
        serialNumber: createdOrder.serialNumber || this.selectedHistoryItem.serialNumber,
      };
      this.shippingStepCompleted = true;
      this.shippingStepIndex = 1;
      this.commonService.openSnackBar('Tạo đơn vận chuyển thành công');
      await this.onGetHistories(this.historyPagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Tạo đơn vận chuyển thất bại');
    }
  }

  async onCancelShippingOrder(item: any) {
    if (!item.id || !confirm(`Bạn có chắc chắn muốn hủy đơn của serial ${item.serialNumber || ''}?`)) {
      return;
    }

    this.cancellingHistoryId = item.id;
    const response = await this.injector.get(ApiService).executeMutation(UPDATE_SHIPPING_STATUS, {
      input: {
        stockHistoryId: item.id,
        trackingNumber: item.trackingNumber,
        newStatus: ShippingStatusEnum.CANCELLED,
        note: 'Hủy đơn từ lịch sử kho',
      },
    });
    this.cancellingHistoryId = null;

    if (response?.updateShippingStatus) {
      this.commonService.openSnackBar('Hủy đơn thành công');
      await this.onGetHistories(this.historyPagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Hủy đơn thất bại');
    }
  }

  async onPrintShippingLabel(item: any) {
    if (!item.trackingNumber) {
      this.commonService.openSnackBarError('Đơn vận chuyển chưa có mã vận đơn để in');
      return;
    }

    const printWindow = window.open('', '_blank');
    const credential = this.partnerCredentials[0];
    this.printingHistoryId = item.id;
    const response = await this.injector.get(ApiService).executeMutation(PRINT_VIETTEL_POST_ORDER, {
      input: {
        trackingNumber: item.trackingNumber,
        partnerCredentialId: credential?.id,
        environment: credential?.environment ?? PartnerEnvironment.PROD,
      },
    });
    this.printingHistoryId = null;

    const printedOrder = response?.printViettelPostOrder;
    if (!printedOrder?.printUrl) {
      printWindow?.close();
      this.commonService.openSnackBarError('In tem vận chuyển thất bại');
      return;
    }

    if (printWindow) {
      printWindow.location.href = printedOrder.printUrl;
    } else {
      window.open(printedOrder.printUrl, '_blank');
    }
  }

  async onPrintShippingOrder(order: ShippingOrder) {
    if (order.printUrl) {
      window.open(order.printUrl, '_blank');
      return;
    }

    const printWindow = window.open('', '_blank');
    const formValue = this.shippingOrderForm.getRawValue();
    this.printingOrderId = order.id;
    const response = await this.injector.get(ApiService).executeMutation(PRINT_VIETTEL_POST_ORDER, {
      input: {
        shippingOrderId: order.id,
        trackingNumber: order.trackingNumber,
        partnerCredentialId: formValue.partnerCredentialId,
        environment: formValue.environment,
      },
    });
    this.printingOrderId = null;

    const printedOrder = response?.printViettelPostOrder;
    if (!printedOrder?.printUrl) {
      printWindow?.close();
      this.commonService.openSnackBarError('In mã đơn thất bại');
      return;
    }

    this.createdShippingOrder = { ...order, ...printedOrder };
    if (printWindow) {
      printWindow.location.href = printedOrder.printUrl;
    } else {
      window.open(printedOrder.printUrl, '_blank');
    }
  }

  onPrintSerialLabel(serialNumber: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.commonService.openSnackBarError('Trình duyệt đã chặn cửa sổ in tem serial');
      return;
    }

    this.printingSerialLabel = serialNumber;
    this.renderSerialLabel(printWindow, serialNumber);
    this.printingSerialLabel = null;
  }

  async onPrintActiveCodeLabel(serialNumber: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.commonService.openSnackBarError('Trình duyệt đã chặn cửa sổ in tem active code');
      return;
    }

    this.printingActiveCodeLabel = serialNumber;
    const response = await this.injector.get(ApiService).executeQuery<{ deviceActiveCode: BatchLabelItem }>(
      GET_DEVICE_ACTIVE_CODE,
      { serialNumber },
    );
    this.printingActiveCodeLabel = null;

    const label = response?.deviceActiveCode;
    if (!label?.activeCode) {
      printWindow.close();
      this.commonService.openSnackBarError('Không tìm thấy active code của thiết bị');
      return;
    }

    this.renderActiveCodeLabel(printWindow, label);
  }

  onFinishShipping() {
    this.commonService.closeRightSlideNav();
  }

  onCancelDrawer() {
    this.commonService.closeRightSlideNav();
  }

  onShippingDrawerClosed() {
    this.selectedHistoryItem = null;
    this.createdShippingOrder = null;
    this.shippingStepCompleted = false;
    this.shippingStepIndex = 0;
  }

  override ngOnDestroy(): void {
    this.commonService.closeRightSlideNav();
    super.ngOnDestroy();
  }

  getWarehouseName(warehouse: Warehouse | null | undefined, warehouseId: string | null | undefined): string {
    if (warehouse) {
      return warehouse.code ? `${warehouse.name} (${warehouse.code})` : warehouse.name;
    }

    return warehouseId ?? '';
  }

  getStockEventTypeName(eventType: StockEventType): string {
    switch (eventType) {
      case StockEventType.STOCK_IN:
        return 'Nhập kho';
      case StockEventType.STOCK_OUT:
        return 'Xuất kho';
      case StockEventType.STOCK_TRANSFER:
        return 'Chuyển kho';
      case StockEventType.STOCK_ADJUST:
        return 'Điều chỉnh';
      default:
        return eventType;
    }
  }

  getShippingStatusName(status: ShippingStatusEnum | null | undefined): string {
    if (!status) return '';
    return this.shippingStatusOptions.find((item) => item.value === status)?.name ?? status;
  }

  private renderSerialLabel(printWindow: Window, serialNumberValue: string) {
    const serialNumber = this.escapeHtml(serialNumberValue);
    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Tem serial - ${serialNumber}</title>
          <style>
            @page { size: 60mm 35mm; margin: 0; }
            * { box-sizing: border-box; }
            body {
              width: 60mm;
              height: 35mm;
              margin: 0;
              padding: 4mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 4mm;
              color: #111827;
              font-family: Arial, sans-serif;
            }
            .title { font-size: 11pt; font-weight: 700; text-align: center; }
            .value { max-width: 100%; font-size: 14pt; font-weight: 700; overflow-wrap: anywhere; text-align: center; }
          </style>
        </head>
        <body>
          <div class="title">SERIAL</div>
          <div class="value">${serialNumber}</div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private renderActiveCodeLabel(printWindow: Window, label: BatchLabelItem) {
    const serialNumber = this.escapeHtml(label.serialNumber);
    const activeCode = this.escapeHtml(label.activeCode);
    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Tem active code - ${serialNumber}</title>
          <style>
            @page { size: 60mm 35mm; margin: 0; }
            * { box-sizing: border-box; }
            body {
              width: 60mm;
              height: 35mm;
              margin: 0;
              padding: 4mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 3mm;
              color: #111827;
              font-family: Arial, sans-serif;
            }
            .title { font-size: 10pt; font-weight: 700; text-align: center; }
            .value { max-width: 100%; font-size: 14pt; font-weight: 700; overflow-wrap: anywhere; text-align: center; }
            .serial { max-width: 100%; color: #4b5563; font-size: 8pt; overflow-wrap: anywhere; text-align: center; }
          </style>
        </head>
        <body>
          <div class="title">ACTIVE CODE</div>
          <div class="value">${activeCode}</div>
          <div class="serial">Serial: ${serialNumber}</div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private escapeHtml(value: string): string {
    return (value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
