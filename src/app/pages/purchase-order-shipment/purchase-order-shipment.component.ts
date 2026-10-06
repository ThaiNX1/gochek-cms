import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PageEvent } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { DirectiveModule } from '../../shared/directive.module';
import { PermissionEnum, TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import {
  GET_PURCHASE_ORDER_SHIPMENTS,
  GET_PURCHASE_ORDER_BATCHES,
  CREATE_PURCHASE_ORDER_SHIPMENT,
  UPDATE_PURCHASE_ORDER_SHIPMENT,
  DELETE_PURCHASE_ORDER_SHIPMENT,
  UPDATE_PURCHASE_ORDER_SHIPMENT_STATUS,
  RECEIVE_PURCHASE_ORDER_SHIPMENT,
} from '../../commons/queries/purchase-order.query';
import { GET_WAREHOUSES } from '../../commons/queries/warehouse.query';
import { DialogNotificationComponent } from '../../shared/components/dialog-notification/dialog-notification.component';
import {
  CreatePurchaseOrderShipmentInput,
  PurchaseOrderBatchStatus,
  PurchaseOrderShipmentStatus,
  UpdatePurchaseOrderShipmentInput,
} from '../../commons/types';

interface ShipmentBatchOption {
  id: string;
  batchCode: string;
  poNumber: string;
  purchaseOrderId: string;
  orderedQuantity: number;
  generatedQuantity: number;
  modelCode: string;
  modelName: string;
  status: PurchaseOrderBatchStatus;
}

@Component({
  selector: 'app-purchase-order-shipment',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
    SelectSearchComponent,
  ],
  templateUrl: './purchase-order-shipment.component.html',
  styleUrl: './purchase-order-shipment.component.scss'
})
export class PurchaseOrderShipmentComponent extends BaseClass {
  @ViewChild('expandedRowTemplate') expandedRowTemplate!: TemplateRef<any>;
  @ViewChild('deleteNotification') deleteNotification!: TemplateRef<any>;
  @ViewChild('createDrawerContent') createDrawerContent!: TemplateRef<any>;

  override PermissionEnum = PermissionEnum;
  override filterForm!: FormGroup;
  createForm!: FormGroup;
  selectedShipment: any = null;
  isEditMode = false;

  warehouseList: any[] = [];
  batchOptions: ShipmentBatchOption[] = [];
  filteredBatchOptions: ShipmentBatchOption[] = [];
  batchSearchControl = new FormControl<string | ShipmentBatchOption>('');
  shipmentStatusList = [
    { value: PurchaseOrderShipmentStatus.PLANNED, label: 'Đã lên kế hoạch' },
    { value: PurchaseOrderShipmentStatus.READY_TO_SHIP, label: 'Sẵn sàng xuất' },
    { value: PurchaseOrderShipmentStatus.SHIPPED, label: 'Đã xuất' },
    { value: PurchaseOrderShipmentStatus.IN_TRANSIT, label: 'Đang vận chuyển' },
    { value: PurchaseOrderShipmentStatus.DELIVERED, label: 'Đã nhận hàng' },
    { value: PurchaseOrderShipmentStatus.CANCELLED, label: 'Đã hủy' },
  ];

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Mã giao hàng', field: 'shipmentCode', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Mã PO', field: 'poNumber', className: 'min-w-[160px] max-w-[160px]' },
      { name: 'Nhà cung cấp', field: 'supplierName', className: 'min-w-[180px] max-w-[180px]' },
      { name: 'Kho nhận', field: 'warehouseName', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Số lượng', field: 'quantity', className: 'text-center min-w-[100px] max-w-[100px]', type: TableColumnType.NUMBER },
      { name: 'Ngày giao dự kiến', field: 'expectedShipDate', className: 'min-w-[150px] max-w-[150px]', type: TableColumnType.DATE },
      { name: 'Ngày nhận dự kiến', field: 'expectedArrivalDate', className: 'min-w-[150px] max-w-[150px]', type: TableColumnType.DATE },
      { name: 'Mã vận đơn', field: 'trackingNumber', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Trạng thái', field: 'statusName', className: 'min-w-[150px] max-w-[150px]', templateCode: 'statusColumnTemplate' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[150px] max-w-[150px]', type: TableColumnType.DATE },
      { name: 'Hành động', field: 'action', className: 'min-w-[150px] max-w-[150px]', templateCode: 'actionColumnTemplate' },
    ];
  }
  
  override ngOnDestroy(): void {
    this.commonService.closeRightSlideNav();
    super.ngOnDestroy();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      status: new FormControl(''),
      warehouseId: new FormControl(''),
    });

    this.createForm = new FormGroup({
      id: new FormControl(''),
      shipmentCode: new FormControl('', [Validators.required]),
      warehouseId: new FormControl('', [Validators.required]),
      expectedShipDate: new FormControl(''),
      expectedArrivalDate: new FormControl(''),
      carrier: new FormControl(''),
      trackingNumber: new FormControl(''),
      note: new FormControl(''),
      status: new FormControl(PurchaseOrderShipmentStatus.PLANNED, [Validators.required]),
      batches: new FormArray([], [Validators.required, Validators.minLength(1)]),
    });

    // Debounce search: khi người dùng nhập text thì gọi API tìm kiếm
    this.batchSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(value => {
      // Chỉ gọi API khi value là string (người dùng nhập tay),
      // không gọi khi value là object (vừa chọn 1 option từ dropdown)
      if (typeof value === 'string') {
        const keyword = value.trim();
        this.searchBatchOptions(keyword);
      }
    });

    await this.loadWarehouses();
    await this.onGetData();
  }

  get shipmentBatchesFormArray(): FormArray {
    return this.createForm.get('batches') as FormArray;
  }

  displayBatchOption = (batch: ShipmentBatchOption | string | null): string =>
    typeof batch === 'string' ? batch : batch?.batchCode ?? '';

  private createShipmentBatchGroup(
    batch: ShipmentBatchOption,
    actualQuantity: number | null = null
  ): FormGroup {
    return new FormGroup({
      batchId: new FormControl(batch.id, [Validators.required]),
      batchCode: new FormControl(batch.batchCode),
      poNumber: new FormControl(batch.poNumber),
      orderedQuantity: new FormControl(batch.orderedQuantity),
      modelCode: new FormControl(batch.modelCode),
      modelName: new FormControl(batch.modelName),
      quantity: new FormControl(actualQuantity ?? batch.orderedQuantity, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
      ]),
    });
  }

  async loadBatchOptions(keyword: string = ''): Promise<void> {
    const selectedBatchIds = new Set(
      this.shipmentBatchesFormArray?.controls.map(c => c.get('batchId')?.value) ?? []
    );

    const response = await this.injector.get(ApiService).executeQuery(
      GET_PURCHASE_ORDER_BATCHES,
      {
        filter: {
          page: 1,
          size: 10,
          status: PurchaseOrderBatchStatus.PRODUCTION_COMPLETED,
          keyword: keyword || undefined,
        }
      }
    );

    this.batchOptions = (response?.purchaseOrderBatches?.data ?? []).map((batch: any) => ({
      id: batch.id,
      batchCode: batch.batchCode,
      poNumber: batch.purchaseOrder?.poNumber ?? '-',
      purchaseOrderId: batch.purchaseOrderId ?? '',
      orderedQuantity: Number(batch.orderedQuantity ?? 0),
      generatedQuantity: Number(batch.generatedQuantity ?? 0),
      modelCode: batch.item?.modelCode ?? '',
      modelName: batch.item?.modelName ?? '',
      status: batch.status,
    }));

    // Loại bỏ batch đã được chọn
    this.filteredBatchOptions = this.batchOptions.filter(
      batch => !selectedBatchIds.has(batch.id)
    );
  }

  // Gọi API tìm kiếm khi người dùng nhập text
  private async searchBatchOptions(keyword: string): Promise<void> {
    await this.loadBatchOptions(keyword);
  }

  // Chỉ filter local từ batchOptions hiện có, không gọi API
  private filterBatchOptions(): void {
    const selectedBatchIds = new Set(
      this.shipmentBatchesFormArray?.controls.map(c => c.get('batchId')?.value) ?? []
    );
    this.filteredBatchOptions = this.batchOptions.filter(
      batch => !selectedBatchIds.has(batch.id)
    );
  }

  onBatchSelected(batch: ShipmentBatchOption): void {
    // Kiểm tra trùng
    if (!batch || this.shipmentBatchesFormArray.controls.some(c => c.get('batchId')?.value === batch.id)) {
      return;
    }

    this.shipmentBatchesFormArray.push(this.createShipmentBatchGroup(batch));
    // Reset input không emit event để tránh trigger valueChanges → gọi API
    this.batchSearchControl.setValue('', { emitEvent: false });
    // Chỉ filter local, không gọi API
    this.filterBatchOptions();
  }

  removeSelectedBatch(index: number): void {
    this.shipmentBatchesFormArray.removeAt(index);
    // Chỉ filter local để cập nhật lại dropdown, không gọi API
    this.filterBatchOptions();
  }

  private clearSelectedBatches(): void {
    this.shipmentBatchesFormArray.clear();
    this.batchOptions = [];
    this.filteredBatchOptions = [];
    this.batchSearchControl.setValue('', { emitEvent: false });
  }

  async loadWarehouses() {
    const response = await this.injector.get(ApiService).executeQuery(
      GET_WAREHOUSES,
      { pagination: { page: 1, size: 1000 } }
    );
    this.warehouseList = response?.warehouses?.data ?? [];
  }

  async onGetData(page: number = 1) {
    const statusValue = this.filterForm.value.status;
    const response = await this.injector.get(ApiService).executeQuery(
      GET_PURCHASE_ORDER_SHIPMENTS,
      {
        pagination: {
          page: page < 1 ? 1 : page,
          size: 20,
          keyword: this.filterForm.value.keyword ?? '',
          warehouseId: this.filterForm.value.warehouseId ?? '',
          ...(statusValue ? { status: statusValue } : {}),
        },
      }
    );

    this.dataSource = response?.purchaseOrderShipments?.data?.reduce((acc: any, item: any, index: number) => {
      const currentPage = response?.purchaseOrderShipments?.pagination?.page ?? 1;
      acc.push({
        ...item,
        index: (currentPage - 1) * 20 + index + 1,
        poNumber: 'N/A', // Backend không expose purchaseOrder relation
        supplierName: 'N/A', // Backend không expose purchaseOrder relation
        warehouseName: item.warehouse?.name ?? '',
        statusName: this.getStatusLabel(item.status),
      });
      return acc;
    }, []) ?? [];

    this.pagination = {
      ...this.pagination,
      page: (response?.purchaseOrderShipments?.pagination?.page ?? 1) - 1,
      size: response?.purchaseOrderShipments?.pagination?.size ?? 20,
      total: response?.purchaseOrderShipments?.pagination?.total ?? 0,
    };
  }

  getStatusLabel(status: string): string {
    const found = this.shipmentStatusList.find(s => s.value === status);
    return found?.label ?? status;
  }

  getBatchStatusLabel(status: string | undefined): string {
    switch (status) {
      case PurchaseOrderBatchStatus.DRAFT:               return 'Nháp';
      case PurchaseOrderBatchStatus.CREATED:             return 'Đã tạo';
      case PurchaseOrderBatchStatus.IN_PRODUCTION:       return 'Đang sản xuất';
      case PurchaseOrderBatchStatus.PRODUCTION_COMPLETED: return 'Hoàn thành SX';
      case PurchaseOrderBatchStatus.IN_TRANSIT:          return 'Đang vận chuyển';
      case PurchaseOrderBatchStatus.RECEIVED:            return 'Chờ nhập kho';
      case PurchaseOrderBatchStatus.WAREHOUSED:          return 'Đã nhập kho';
      case PurchaseOrderBatchStatus.CANCELLED:           return 'Đã hủy';
      default: return status ?? 'N/A';
    }
  }

  getBatchStatusClass(status: string | undefined): string {
    switch (status) {
      case PurchaseOrderBatchStatus.DRAFT:               return 'bg-gray-100 text-gray-600';
      case PurchaseOrderBatchStatus.CREATED:             return 'bg-blue-100 text-blue-700';
      case PurchaseOrderBatchStatus.IN_PRODUCTION:       return 'bg-yellow-100 text-yellow-700';
      case PurchaseOrderBatchStatus.PRODUCTION_COMPLETED: return 'bg-teal-100 text-teal-700';
      case PurchaseOrderBatchStatus.IN_TRANSIT:          return 'bg-purple-100 text-purple-700';
      case PurchaseOrderBatchStatus.RECEIVED:            return 'bg-orange-100 text-orange-700';
      case PurchaseOrderBatchStatus.WAREHOUSED:          return 'bg-green-100 text-green-700';
      case PurchaseOrderBatchStatus.CANCELLED:           return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  groupBatchesByPO(shipmentBatches: any[]): { poNumber: string; batches: any[] }[] {
    const map = new Map<string, any[]>();
    for (const sb of shipmentBatches) {
      const poNumber = sb.purchaseOrder?.poNumber ?? sb.batch?.purchaseOrder?.poNumber ?? 'N/A';
      if (!map.has(poNumber)) {
        map.set(poNumber, []);
      }
      map.get(poNumber)!.push(sb);
    }
    return Array.from(map.entries()).map(([poNumber, batches]) => ({ poNumber, batches }));
  }

  onPageChange(event: PageEvent) {
    this.pagination.page = event.pageIndex;
    this.pagination.size = event.pageSize;
    this.onGetData(event.pageIndex + 1);
  }

  async onOpenCreateSidenav(): Promise<void> {
    this.isEditMode = false;
    this.selectedShipment = null;
    this.createForm.get('shipmentCode')?.enable({ emitEvent: false });
    this.createForm.get('status')?.enable({ emitEvent: false });
    this.clearSelectedBatches();
    this.createForm.reset({
      status: PurchaseOrderShipmentStatus.PLANNED,
      shipmentCode: this.generateShipmentCode(),
    });
    // Load batch ban đầu (không có keyword)
    await this.loadBatchOptions();
    this.commonService.openRightSlideNav({
      title: 'Tạo đơn giao hàng mới',
      content: this.createDrawerContent,
    });
  }

  private generateShipmentCode(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const nanoid = Array.from({ length: 8 }, () =>
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(
        Math.floor(Math.random() * 36)
      )
    ).join('');
    return `SHP-${dd}${mm}${yy}-${nanoid}`;
  }

  async onEdit(item: any): Promise<void> {
    this.isEditMode = true;
    this.selectedShipment = item;
    this.createForm.get('shipmentCode')?.disable({ emitEvent: false });
    this.createForm.get('status')?.disable({ emitEvent: false });
    this.clearSelectedBatches();
    this.createForm.patchValue({
      id: item.id,
      shipmentCode: item.shipmentCode,
      warehouseId: item.warehouseId,
      expectedShipDate: item.expectedShipDate ? new Date(item.expectedShipDate) : null,
      expectedArrivalDate: item.expectedArrivalDate ? new Date(item.expectedArrivalDate) : null,
      carrier: item.carrier ?? '',
      trackingNumber: item.trackingNumber ?? '',
      note: item.note ?? '',
      status: item.status,
    });

    // Load batch options trước để có data cho dropdown
    await this.loadBatchOptions();

    (item.shipmentBatches ?? []).forEach((shipmentBatch: any) => {
      const batchData = shipmentBatch.batch ?? {};
      const batchOption = this.batchOptions.find(batch => batch.id === shipmentBatch.batchId) ?? {
        id: shipmentBatch.batchId,
        batchCode: batchData.batchCode ?? '-',
        poNumber: shipmentBatch.purchaseOrder?.poNumber ?? '-',
        purchaseOrderId: shipmentBatch.purchaseOrderId ?? batchData.purchaseOrderId ?? '',
        orderedQuantity: Number(batchData.orderedQuantity ?? 0),
        generatedQuantity: Number(batchData.generatedQuantity ?? 0),
        modelCode: batchData.item?.modelCode ?? '',
        modelName: batchData.item?.modelName ?? '',
        status: batchData.status,
      };
      this.shipmentBatchesFormArray.push(
        this.createShipmentBatchGroup(batchOption, Number(shipmentBatch.quantity ?? 0))
      );
    });
    this.filterBatchOptions();
    this.commonService.openRightSlideNav({
      title: 'Chỉnh sửa đơn giao hàng',
      content: this.createDrawerContent,
    });
  }

  onCancel() {
    this.commonService.closeRightSlideNav();
  }

  async onSave() {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const formValue = this.createForm.getRawValue();
    const batches = (formValue.batches ?? []).map((batch: any) => ({
      batchId: batch.batchId,
      quantity: Number(batch.quantity),
    }));
    const commonInput: UpdatePurchaseOrderShipmentInput = {
      warehouseId: formValue.warehouseId,
      expectedShipDate: formValue.expectedShipDate ? new Date(formValue.expectedShipDate).toISOString() : null,
      expectedArrivalDate: formValue.expectedArrivalDate ? new Date(formValue.expectedArrivalDate).toISOString() : null,
      carrier: formValue.carrier ?? '',
      trackingNumber: formValue.trackingNumber ?? '',
      note: formValue.note ?? '',
      batches,
    };

    let response;
    if (this.isEditMode && formValue.id) {
      response = await this.injector.get(ApiService).executeMutation(
        UPDATE_PURCHASE_ORDER_SHIPMENT,
        { id: formValue.id, input: commonInput }
      );
    } else {
      const input: CreatePurchaseOrderShipmentInput = {
        ...commonInput,
        shipmentCode: formValue.shipmentCode,
        status: formValue.status,
        batches,
      };
      response = await this.injector.get(ApiService).executeMutation(
        CREATE_PURCHASE_ORDER_SHIPMENT,
        { input }
      );
    }

    if (response) {
      this.commonService.openSnackBar(this.isEditMode ? 'Cập nhật thành công' : 'Tạo mới thành công');
      this.commonService.closeRightSlideNav();
      await this.onGetData(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError(this.isEditMode ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
    }
  }

  onDelete(item: any) {
    this.selectedShipment = item;
    const dialogRef = this.injector.get(MatDialog).open(DialogNotificationComponent, {
      disableClose: true,
      data: {
        title: 'Xác nhận xóa',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });
    dialogRef.componentInstance.content = this.deleteNotification;
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(
          DELETE_PURCHASE_ORDER_SHIPMENT,
          { id: item.id }
        );
        if (response) {
          this.commonService.openSnackBar('Xóa đơn giao hàng thành công');
          await this.onGetData(
            this.dataSource.length === 1 && this.pagination.page > 0
              ? this.pagination.page
              : this.pagination.page + 1
          );
        } else {
          this.commonService.openSnackBarError('Xóa đơn giao hàng thất bại');
        }
      }
    });
  }

  async onUpdateStatus(item: any, status: string) {
    const response = await this.injector.get(ApiService).executeMutation(
      UPDATE_PURCHASE_ORDER_SHIPMENT_STATUS,
      { id: item.id, status }
    );
    if (response) {
      this.commonService.openSnackBar('Cập nhật trạng thái thành công');
      await this.onGetData(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Cập nhật trạng thái thất bại');
    }
  }

  async onReceiveShipment(item: any) {
    const response = await this.injector.get(ApiService).executeMutation(
      RECEIVE_PURCHASE_ORDER_SHIPMENT,
      {
        input: {
          shipmentId: item.id,
          warehouseId: item.warehouseId,
        }
      }
    );
    if (response) {
      this.commonService.openSnackBar('Nhận hàng thành công');
      await this.onGetData(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Nhận hàng thất bại');
    }
  }
}
