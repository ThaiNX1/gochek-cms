import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { BaseClass } from '../../commons/base.class';
import { GET_MODELS } from '../../commons/queries/device-type.query';
import { GET_DEVICE_ACTIVE_CODE } from '../../commons/queries/device.query';
import { ALL_PREFIX } from '../../commons/queries/generate-history.query';
import { GET_PARTNER_CREDENTIALS } from '../../commons/queries/partner-credential.query';
import { CREATE_VIETTEL_POST_ORDER, PRINT_VIETTEL_POST_ORDER } from '../../commons/queries/shipping.query';
import {
  CREATE_STOCK_BATCH,
  GET_STOCK_HISTORIES,
  GET_STOCK_BATCHES,
  GET_STOCK_OVERVIEW,
  SHIP_DEVICE,
  SHIP_DEVICE_BATCH,
  TRANSFER_DEVICE,
  TRANSFER_DEVICE_BATCH,
} from '../../commons/queries/stock.query';
import { GET_ACTIVE_WAREHOUSES } from '../../commons/queries/warehouse.query';
import {
  BatchLabelItem,
  PartnerCredential,
  PartnerEnvironment,
  PartnerKey,
  ShippingOrder,
  StockBatchResponse,
  StockEventType,
  StockOverviewResponse,
  Warehouse,
} from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';

type StockDrawerMode = 'create' | 'ship' | 'transfer';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatStepperModule,
    ReactiveFormsModule,
    RouterModule,
    SelectSearchComponent,
    TableComponent,
    DirectiveModule,
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent extends BaseClass {
  @ViewChild('createBatchDrawerContent') createBatchDrawerContent!: TemplateRef<any>;
  @ViewChild('shipDeviceDrawerContent') shipDeviceDrawerContent!: TemplateRef<any>;
  @ViewChild('transferDeviceDrawerContent') transferDeviceDrawerContent!: TemplateRef<any>;

  batchColumns = [
    { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
    { name: 'Kho', field: 'warehouseName', className: 'min-w-[150px] max-w-[150px]' },
    { name: 'Mã lô', field: 'batchCode', className: 'min-w-[120px] max-w-[120px]' },
    { name: 'Nhà cung cấp', field: 'supplier', className: 'min-w-[130px] max-w-[130px]' },
    { name: 'SL dự kiến', field: 'expectedQuantity', className: 'min-w-[100px] max-w-[100px]', type: TableColumnType.NUMBER },
    { name: 'Đã nhập', field: 'importedQuantity', className: 'min-w-[90px] max-w-[90px]', type: TableColumnType.NUMBER },
    { name: 'Tồn kho', field: 'remainingQuantity', className: 'min-w-[90px] max-w-[90px]', type: TableColumnType.NUMBER },
    { name: 'Đã xuất', field: 'shippedCount', className: 'min-w-[90px] max-w-[90px]', type: TableColumnType.NUMBER },
    { name: 'Serial đầu', field: 'startSerialNumber', className: 'min-w-[120px] max-w-[120px]' },
    { name: 'Serial cuối', field: 'endSerialNumber', className: 'min-w-[120px] max-w-[120px]' },
    { name: 'Ngày nhập', field: 'importedAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
  ];

  overview: StockOverviewResponse | null = null;
  warehouses: Warehouse[] = [];
  prefixStrList: string[] = [];
  modelList: any[] = [];
  modelSearchQuery = GET_MODELS;
  partnerCredentials: PartnerCredential[] = [];
  batchDataSource: any[] = [];
  batchPagination = {
    page: 0,
    size: 20,
    total: 0,
  };

  drawerMode: StockDrawerMode | null = null;
  createBatchForm!: FormGroup;
  shipDeviceForm!: FormGroup;
  shippingOrderForm!: FormGroup;
  transferDeviceForm!: FormGroup;
  shipStepCompleted = false;
  shippingStepCompleted = false;
  shipStepIndex = 0;
  shippedSerialNumbers: string[] = [];
  shippedStockHistoryIds = new Map<string, string>();
  createdShippingOrders: ShippingOrder[] = [];
  isShippingStock = false;
  isCreatingShippingOrder = false;
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

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      warehouseId: new FormControl(''),
    });
    this.createBatchForm = new FormGroup({
      warehouseId: new FormControl('', [Validators.required]),
      batchCode: new FormControl('', [Validators.required]),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      expectedQuantity: new FormControl(null, [Validators.required, Validators.min(1)]),
      actualQuantity: new FormControl(null, [Validators.required, Validators.min(1)]),
      supplier: new FormControl(''),
      modelId: new FormControl(''),
      note: new FormControl(''),
    });
    this.shipDeviceForm = new FormGroup({
      warehouseId: new FormControl('', [Validators.required]),
      serialNumbers: new FormControl('', [Validators.required]),
      note: new FormControl(''),
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
    this.transferDeviceForm = new FormGroup({
      fromWarehouseId: new FormControl('', [Validators.required]),
      toWarehouseId: new FormControl('', [Validators.required]),
      serialNumbers: new FormControl('', [Validators.required]),
      note: new FormControl(''),
    });

    await Promise.all([
      this.onGetActiveWarehouses(),
      this.getAllPrefix(),
      this.onGetModels(),
      this.canCreateShippingOrder ? this.onGetPartnerCredentials() : Promise.resolve(),
    ]);
    await this.onReload();
  }

  async onReload() {
    await Promise.all([
      this.onGetOverview(),
      this.onGetBatches(),
    ]);
  }

  async onGetOverview() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_STOCK_OVERVIEW, {
      warehouseId: this.getSelectedWarehouseId(),
    });
    this.overview = response?.stockOverview ?? null;
  }

  async onGetBatches() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_STOCK_BATCHES, {
      warehouseId: this.getSelectedWarehouseId(),
    });
    this.batchDataSource = response?.stockBatches?.map((item: StockBatchResponse, index: number) => ({
      ...item,
      index: index + 1,
    })) ?? [];
    this.batchPagination = {
      ...this.batchPagination,
      page: 0,
      size: this.batchDataSource.length || 20,
      total: this.batchDataSource.length,
    };
  }

  async onGetActiveWarehouses() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_ACTIVE_WAREHOUSES);
    this.warehouses = response?.activeWarehouses ?? [];
    const defaultWarehouseId = this.warehouses[0]?.id ?? '';
    this.createBatchForm.patchValue({ warehouseId: defaultWarehouseId });
    this.shipDeviceForm.patchValue({ warehouseId: defaultWarehouseId });
    this.transferDeviceForm.patchValue({
      fromWarehouseId: defaultWarehouseId,
      toWarehouseId: this.warehouses.find((warehouse) => warehouse.id !== defaultWarehouseId)?.id ?? '',
    });
  }

  async getAllPrefix() {
    const response = await this.injector.get(ApiService).executeQuery<any>(ALL_PREFIX);
    this.prefixStrList = response?.allPrefix?.reduce((prefixes: string[], item: any) => {
      if (item.prefix) prefixes.push(item.prefix);
      return prefixes;
    }, []) ?? [];
  }

  async onGetModels() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_MODELS, {
      pagination: {
        page: 1,
        size: 100,
      },
    });
    this.modelList = response?.models?.data ?? [];
  }

  async onGetPartnerCredentials() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_PARTNER_CREDENTIALS, {
      input: {
        partnerKey: PartnerKey.VIETTEL_POST,
        isActive: true,
      },
    });
    this.partnerCredentials = response?.partnerCredentials ?? [];
    const defaultCredential = this.partnerCredentials[0];
    if (defaultCredential) {
      this.shippingOrderForm.patchValue({
        partnerCredentialId: defaultCredential.id,
        environment: defaultCredential.environment,
      });
    }
  }

  getSelectedWarehouseId(): string | null {
    return this.filterForm?.value?.warehouseId || null;
  }

  get drawerTitle(): string {
    switch (this.drawerMode) {
      case 'create': return 'Nhập kho';
      case 'ship': return 'Xuất kho và vận chuyển';
      case 'transfer': return 'Chuyển kho';
      default: return '';
    }
  }

  onOpenCreateBatchDialog() {
    this.createBatchForm.reset({ warehouseId: this.warehouses[0]?.id ?? '' });
    this.openDrawer('create');
  }

  onOpenShipDeviceDialog() {
    const defaultCredential = this.partnerCredentials[0];
    this.shipDeviceForm.reset({ warehouseId: this.warehouses[0]?.id ?? '' });
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
    this.shipStepCompleted = false;
    this.shippingStepCompleted = false;
    this.shipStepIndex = 0;
    this.shippedSerialNumbers = [];
    this.shippedStockHistoryIds.clear();
    this.createdShippingOrders = [];
    this.openDrawer('ship');
  }

  onOpenTransferDeviceDialog() {
    const defaultWarehouseId = this.warehouses[0]?.id ?? '';
    this.transferDeviceForm.reset({
      fromWarehouseId: defaultWarehouseId,
      toWarehouseId: this.warehouses.find((warehouse) => warehouse.id !== defaultWarehouseId)?.id ?? '',
    });
    this.openDrawer('transfer');
  }

  private openDrawer(mode: StockDrawerMode) {
    this.drawerMode = mode;
    const contentByMode: Record<StockDrawerMode, TemplateRef<any>> = {
      create: this.createBatchDrawerContent,
      ship: this.shipDeviceDrawerContent,
      transfer: this.transferDeviceDrawerContent,
    };
    this.commonService.openRightSlideNav({
      title: this.drawerTitle,
      content: contentByMode[mode],
      width: '760px',
      onClose: () => this.onDrawerClosed(),
    });
  }

  onDrawerClosed() {
    this.drawerMode = null;
  }

  onPartnerCredentialSelected(credentialId: string) {
    const credential = this.partnerCredentials.find((item) => item.id === credentialId);
    if (credential) {
      this.shippingOrderForm.patchValue({ environment: credential.environment });
    }
  }

  async onCreateBatchSave() {
    this.createBatchForm.markAllAsTouched();
    if (this.createBatchForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const formValue = this.createBatchForm.value;
    const response = await this.injector.get(ApiService).executeMutation(CREATE_STOCK_BATCH, {
      input: {
        batchCode: formValue.batchCode,
        prefix: formValue.prefix,
        expectedQuantity: Number(formValue.expectedQuantity),
        actualQuantity: Number(formValue.actualQuantity),
        warehouseId: formValue.warehouseId,
        supplier: formValue.supplier,
        modelId: formValue.modelId,
        note: formValue.note,
      }
    });

    if (response?.createStockBatch) {
      this.commonService.openSnackBar('Nhập kho thành công');
      this.commonService.closeRightSlideNav();
      await this.onReload();
    } else {
      this.commonService.openSnackBarError('Nhập kho thất bại');
    }
  }

  async onShipDeviceSave() {
    this.shipDeviceForm.markAllAsTouched();
    if (this.shipDeviceForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const formValue = this.shipDeviceForm.value;
    const serialNumbers = this.parseSerialNumbers(formValue.serialNumbers);
    if (!serialNumbers.length) {
      this.commonService.openSnackBarError('Vui lòng nhập serial cần xuất kho');
      return;
    }

    const inputItem = (serialNumber: string) => ({
      serialNumber,
      warehouseId: formValue.warehouseId,
      trackingNumber: '',
      carrier: 'VIETTEL_POST',
      note: formValue.note,
    });

    this.isShippingStock = true;
    const response = serialNumbers.length === 1
      ? await this.injector.get(ApiService).executeMutation(SHIP_DEVICE, { input: inputItem(serialNumbers[0]) })
      : await this.injector.get(ApiService).executeMutation(SHIP_DEVICE_BATCH, {
        input: { items: serialNumbers.map(inputItem) }
      });
    this.isShippingStock = false;

    if (response?.shipDevice || response?.shipDeviceBatch) {
      this.shippedSerialNumbers = serialNumbers;
      await this.loadShippedStockHistoryIds(serialNumbers, formValue.warehouseId);
      this.shipStepCompleted = true;
      this.commonService.openSnackBar('Xuất kho thành công');
      await this.onReload();
      this.shipStepIndex = 1;
    } else {
      this.commonService.openSnackBarError('Xuất kho thất bại');
    }
  }

  async onCreateShippingOrders() {
    this.shippingOrderForm.markAllAsTouched();
    if (this.shippingOrderForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin lên đơn');
      return;
    }

    const formValue = this.shippingOrderForm.getRawValue();
    const createdSerials = new Set(this.createdShippingOrders.map((item) => item.serialNumber));
    const pendingSerials = this.shippedSerialNumbers.filter((serialNumber) => !createdSerials.has(serialNumber));
    this.isCreatingShippingOrder = true;

    const responses = await Promise.all(pendingSerials.map((serialNumber) =>
      this.injector.get(ApiService).executeMutation(CREATE_VIETTEL_POST_ORDER, {
        input: {
          partnerCredentialId: formValue.partnerCredentialId,
          environment: formValue.environment,
          serialNumber,
          stockHistoryId: this.shippedStockHistoryIds.get(serialNumber),
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
      })
    ));
    this.isCreatingShippingOrder = false;

    const createdOrders = responses.reduce<ShippingOrder[]>((orders, response, index) => {
      const order = response?.createViettelPostOrder;
      if (order) {
        orders.push({
          ...order,
          serialNumber: order.serialNumber || pendingSerials[index],
        });
      }
      return orders;
    }, []);
    this.createdShippingOrders = [...this.createdShippingOrders, ...createdOrders];

    if (this.createdShippingOrders.length !== this.shippedSerialNumbers.length) {
      this.commonService.openSnackBarError(
        `Đã lên ${this.createdShippingOrders.length}/${this.shippedSerialNumbers.length} đơn vận chuyển. Vui lòng thử lại.`
      );
      return;
    }

    this.shippingStepCompleted = true;
    this.commonService.openSnackBar('Lên đơn vận chuyển thành công');
    this.shipStepIndex = 2;
  }

  async onPrintShippingOrder(order: ShippingOrder) {
    if (order.printUrl) {
      window.open(order.printUrl, '_blank');
      return;
    }

    const printWindow = window.open('', '_blank');
    this.printingOrderId = order.id;
    const formValue = this.shippingOrderForm.getRawValue();
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

    this.createdShippingOrders = this.createdShippingOrders.map((item) =>
      item.id === printedOrder.id ? { ...item, ...printedOrder } : item);
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

  async onTransferDeviceSave() {
    this.transferDeviceForm.markAllAsTouched();
    if (this.transferDeviceForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const formValue = this.transferDeviceForm.value;
    if (formValue.fromWarehouseId === formValue.toWarehouseId) {
      this.commonService.openSnackBarError('Kho nguồn và kho đích phải khác nhau');
      return;
    }

    const serialNumbers = this.parseSerialNumbers(formValue.serialNumbers);
    if (!serialNumbers.length) {
      this.commonService.openSnackBarError('Vui lòng nhập serial cần chuyển kho');
      return;
    }

    const inputItem = (serialNumber: string) => ({
      serialNumber,
      fromWarehouseId: formValue.fromWarehouseId,
      toWarehouseId: formValue.toWarehouseId,
      note: formValue.note,
    });
    const response = serialNumbers.length === 1
      ? await this.injector.get(ApiService).executeMutation(TRANSFER_DEVICE, { input: inputItem(serialNumbers[0]) })
      : await this.injector.get(ApiService).executeMutation(TRANSFER_DEVICE_BATCH, {
        input: { items: serialNumbers.map(inputItem) }
      });

    if (response?.transferDevice || response?.transferDeviceBatch) {
      this.commonService.openSnackBar('Chuyển kho thành công');
      this.commonService.closeRightSlideNav();
      await this.onReload();
    } else {
      this.commonService.openSnackBarError('Chuyển kho thất bại');
    }
  }

  onFinishShipping() {
    this.commonService.closeRightSlideNav();
  }

  onCancel() {
    this.commonService.closeRightSlideNav();
  }

  override ngOnDestroy(): void {
    this.commonService.closeRightSlideNav();
    super.ngOnDestroy();
  }

  private async loadShippedStockHistoryIds(serialNumbers: string[], warehouseId: string) {
    const responses = await Promise.all(serialNumbers.map((serialNumber) =>
      this.injector.get(ApiService).executeQuery<any>(GET_STOCK_HISTORIES, {
        pagination: {
          page: 1,
          size: 1,
          serialNumber,
          eventType: StockEventType.STOCK_OUT,
          fromWarehouseId: warehouseId,
        },
      })
    ));

    responses.forEach((response, index) => {
      const stockHistory = response?.stockHistories?.data?.[0];
      const stockHistoryId = stockHistory?.id;
      if (stockHistoryId) {
        this.shippedStockHistoryIds.set(serialNumbers[index], stockHistoryId);
      }
    });
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

  private parseSerialNumbers(value: string): string[] {
    return [...new Set((value ?? '')
      .split(/\r?\n|,/)
      .map((item: string) => item.trim())
      .filter(Boolean))];
  }
}
