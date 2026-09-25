import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { BaseClass } from '../../../commons/base.class';
import { ApiService } from '../../../core/services/api.service';
import { SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';
import {
  CREATE_PURCHASE_ORDER,
  CREATE_PURCHASE_ORDER_SHIPMENT,
  CANCEL_PURCHASE_ORDER,
  COMPLETE_PURCHASE_ORDER,
  DELETE_PURCHASE_ORDER_SHIPMENT,
  GET_PURCHASE_ORDER,
  GET_PURCHASE_ORDER_NUMBERS,
  GET_PURCHASE_ORDER_SHIPMENT_CODES,
  GET_MODELS_FOR_SELECT,
  GET_SUPPLIERS_FOR_SELECT,
  RECEIVE_PURCHASE_ORDER_SHIPMENT,
  UPDATE_PURCHASE_ORDER,
  UPDATE_PURCHASE_ORDER_BATCH_STATUS,
  UPDATE_PURCHASE_ORDER_SHIPMENT,
  UPDATE_PURCHASE_ORDER_SHIPMENT_STATUS,
} from '../../../commons/queries/purchase-order.query';
import { GET_ACTIVE_WAREHOUSES } from '../../../commons/queries/warehouse.query';
import { ALL_PREFIX } from '../../../commons/queries/generate-history.query';
import {
  PurchaseOrderBatchStatus,
  PurchaseOrderShipmentStatus,
  PurchaseOrderStatus,
} from '../../../commons/types';
import { DirectiveModule } from '../../../shared/directive.module';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { DialogNotificationComponent } from '../../../shared/components/dialog-notification/dialog-notification.component';

interface ProductRow {
  id?: string;
  modelId: string;
  modelName: string;
  modelCode: string;
  version: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

interface BatchRow {
  id?: string;
  batchCode: string;
  orderedQuantity: number;
  generatedQuantity?: number;
  plannedProductionDate: string;
  serialPrefix: string;
  note: string;
  status?: PurchaseOrderBatchStatus;
  itemId?: string;
  productIndex: number;
}

interface ShipmentRow {
  ids?: string[];
  shipmentCode: string;
  quantity: number;
  expectedShipDate: string;
  expectedArrivalDate: string;
  carrier: string;
  trackingNumber: string;
  status: PurchaseOrderShipmentStatus;
  receivingWarehouseId: string;
  receivingWarehouseName?: string;
  batchIndexes: number[];
}

@Component({
  selector: 'app-purchase-order-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    RouterModule,
    SelectSearchComponent,
    DirectiveModule,
  ],
  templateUrl: './purchase-order-create.component.html',
  styleUrl: './purchase-order-create.component.scss'
})
export class PurchaseOrderCreateComponent extends BaseClass implements OnInit {
  PurchaseOrderStatus = PurchaseOrderStatus;

  @ViewChild('batchDrawerContent') batchDrawerContent!: TemplateRef<any>;
  @ViewChild('shipmentDrawerContent') shipmentDrawerContent!: TemplateRef<any>;
  @ViewChild('cancelPoNotification') cancelPoNotification!: TemplateRef<any>;
  @ViewChild('completePoDialogContent') completePoDialogContent!: TemplateRef<any>;

  poForm!: FormGroup;
  batchForm!: FormGroup;
  shipmentForm!: FormGroup;
  completePoForm!: FormGroup;
  orderDateMax: Date | null = null;
  requestedDeliveryDateMin: Date | null = null;
  expectedShipDateMax: Date | null = null;
  expectedArrivalDateMin: Date | null = null;
  batches: BatchRow[] = [];
  shipments: ShipmentRow[] = [];
  editingBatchIndex: number | null = null;
  editingShipmentIndex: number | null = null;

  supplierOptions: any[] = [];
  modelOptions: any[] = [];
  warehouseList: any[] = [];
  prefixStrList: string[] = [];

  shipmentStatusOptions = [
    { value: PurchaseOrderShipmentStatus.PLANNED, label: 'Đã lên kế hoạch' },
    { value: PurchaseOrderShipmentStatus.READY_TO_SHIP, label: 'Sẵn sàng xuất' },
    { value: PurchaseOrderShipmentStatus.SHIPPED, label: 'Đã xuất' },
    { value: PurchaseOrderShipmentStatus.IN_TRANSIT, label: 'Đang vận chuyển' },
    { value: PurchaseOrderShipmentStatus.DELIVERED, label: 'Đã nhận hàng' },
    { value: PurchaseOrderShipmentStatus.CANCELLED, label: 'Đã hủy' },
  ];

  isEditMode = false;
  poId: string | null = null;
  poData: any = null;
  updatingBatchId: string | null = null;
  selectedBatchIds = new Set<string>();
  selectedShipmentIndexes: number[] = [];
  batchRandomLetters: string = '';
  shipmentRandomLetters: string = '';

  get canEditPurchaseOrder(): boolean {
    return !this.isEditMode || this.poData?.status === 'DRAFT';
  }

  get showProductionProgress(): boolean {
    return this.isEditMode && !!this.poData?.status && this.poData.status !== 'DRAFT';
  }

  get canMoveBatchesToProduction(): boolean {
    return this.poData?.status === 'CONFIRMED' || this.poData?.status === 'IN_PRODUCTION';
  }

  get canShowCancelPurchaseOrderAction(): boolean {
    return this.isEditMode && this.poData?.status === PurchaseOrderStatus.CONFIRMED;
  }

  get canShowCompletePurchaseOrderAction(): boolean {
    return this.isEditMode && this.poData?.status === PurchaseOrderStatus.IN_PRODUCTION;
  }

  getPoStatusLabel(status: string | undefined): string {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'Nháp';
      case PurchaseOrderStatus.PENDING_APPROVAL: return 'Chờ duyệt';
      case PurchaseOrderStatus.CONFIRMED: return 'Đã xác nhận';
      case PurchaseOrderStatus.IN_PRODUCTION: return 'Đang sản xuất';
      case PurchaseOrderStatus.COMPLETED: return 'Hoàn thành';
      case PurchaseOrderStatus.CANCELLED: return 'Đã hủy';
      default: return status || '-';
    }
  }

  getPoStatusClass(status: string | undefined): string {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'bg-gray-50 text-gray-600 border-gray-200';
      case PurchaseOrderStatus.PENDING_APPROVAL: return 'bg-orange-50 text-orange-600 border-orange-200';
      case PurchaseOrderStatus.CONFIRMED: return 'bg-blue-50 text-blue-600 border-blue-200';
      case PurchaseOrderStatus.IN_PRODUCTION: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case PurchaseOrderStatus.COMPLETED: return 'bg-green-50 text-green-600 border-green-200';
      case PurchaseOrderStatus.CANCELLED: return 'bg-red-50 text-red-500 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  getPoStatusIcon(status: string | undefined): string {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'edit_note';
      case PurchaseOrderStatus.PENDING_APPROVAL: return 'pending_actions';
      case PurchaseOrderStatus.CONFIRMED: return 'verified';
      case PurchaseOrderStatus.IN_PRODUCTION: return 'precision_manufacturing';
      case PurchaseOrderStatus.COMPLETED: return 'task_alt';
      case PurchaseOrderStatus.CANCELLED: return 'cancel';
      default: return 'help_outline';
    }
  }

  get selectedBatches(): BatchRow[] {
    return this.batches.filter(batch => !!batch.id && this.selectedBatchIds.has(batch.id));
  }

  get selectedBatchStatus(): PurchaseOrderBatchStatus | null {
    return this.selectedBatches.length
      ? (this.selectedBatches[0].status || null)
      : null;
  }

  get canSelectSelectedBatchesForProduction(): boolean {
    return this.selectedBatches.length > 0
      && this.selectedBatches.every(batch => this.canSelectBatchForProduction(batch));
  }

  get canSelectSelectedBatchesForProductionCompleted(): boolean {
    return this.selectedBatches.length > 0
      && this.selectedBatches.every(batch => this.canSelectBatchForProductionCompleted(batch));
  }

  readonly batchSteps: { key: PurchaseOrderBatchStatus; label: string }[] = [
    { key: PurchaseOrderBatchStatus.DRAFT, label: 'Nháp' },
    { key: PurchaseOrderBatchStatus.CREATED, label: 'Đã tạo' },
    { key: PurchaseOrderBatchStatus.IN_PRODUCTION, label: 'Sản xuất' },
    { key: PurchaseOrderBatchStatus.PRODUCTION_COMPLETED, label: 'Hoàn thành SX' },
    { key: PurchaseOrderBatchStatus.IN_TRANSIT, label: 'Vận chuyển' },
    { key: PurchaseOrderBatchStatus.RECEIVED, label: 'Chờ nhập kho' },
    { key: PurchaseOrderBatchStatus.WAREHOUSED, label: 'Đã nhập kho' },
  ];

  readonly shipmentSteps: { key: PurchaseOrderShipmentStatus; label: string }[] = [
    { key: PurchaseOrderShipmentStatus.PLANNED, label: 'Kế hoạch' },
    { key: PurchaseOrderShipmentStatus.READY_TO_SHIP, label: 'Sẵn sàng' },
    { key: PurchaseOrderShipmentStatus.SHIPPED, label: 'Đã xuất' },
    { key: PurchaseOrderShipmentStatus.IN_TRANSIT, label: 'Vận chuyển' },
    { key: PurchaseOrderShipmentStatus.DELIVERED, label: 'Đã nhận' },
  ];

  GET_MODELS_FOR_SELECT = GET_MODELS_FOR_SELECT;
  GET_SUPPLIERS_FOR_SELECT = GET_SUPPLIERS_FOR_SELECT;

  currencyOptions = [
    { value: 'CNY', label: 'CNY' },
    { value: 'USD', label: 'USD' },
    { value: 'VND', label: 'VND' },
    { value: 'EUR', label: 'EUR' },
  ];

  paymentTermOptions = [
    { value: 'NET_30', label: 'Net 30' },
    { value: 'NET_60', label: 'Net 60' },
    { value: 'NET_90', label: 'Net 90' },
    { value: 'COD', label: 'COD' },
    { value: 'PREPAID', label: 'Trả trước' },
    { value: 'PARTIAL', label: 'Trả một phần' },
  ];

  constructor() {
    super();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.initForm();
    await Promise.all([this.loadSuppliers(), this.loadWarehouses(), this.loadModels(), this.loadPrefixList()]);

    // Check if edit mode
    const route = this.injector.get(ActivatedRoute);
    this.poId = route.snapshot.paramMap.get('id');
    if (this.poId && this.poId !== 'create') {
      this.isEditMode = true;
      await this.loadPurchaseOrder(this.poId);
    } else {
      await this.setGeneratedPoNumber();
    }
  }

  async loadWarehouses() {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_ACTIVE_WAREHOUSES);
    this.warehouseList = response?.activeWarehouses ?? [];
  }

  async loadPrefixList() {
    const response = await this.injector.get(ApiService).executeQuery<any>(ALL_PREFIX);
    this.prefixStrList = (response?.allPrefix ?? [])
      .map((item: any) => item.prefix)
      .filter(Boolean)
      .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i); // unique
  }

  initForm() {
    const orderDateControl = new FormControl<Date | null>(null, [Validators.required]);
    const requestedDeliveryDateControl = new FormControl<Date | null>(null);

    this.poForm = new FormGroup({
      poNumber: new FormControl('', [Validators.required]),
      supplierId: new FormControl('', [Validators.required]),
      currency: new FormControl('CNY'),
      orderDate: orderDateControl,
      requestedDeliveryDate: requestedDeliveryDateControl,
      paymentTerms: new FormControl(''),
      factoryContact: new FormControl(''),
      projectNote: new FormControl(''),
      products: new FormArray([]),
    }, { validators: this.deliveryDateAfterOrderDateValidator });

    orderDateControl.valueChanges.subscribe(orderDate => {
      this.requestedDeliveryDateMin = this.shiftDate(orderDate, 1);
      requestedDeliveryDateControl.updateValueAndValidity({ emitEvent: false });
    });
    requestedDeliveryDateControl.valueChanges.subscribe(requestedDeliveryDate => {
      this.orderDateMax = this.shiftDate(requestedDeliveryDate, -1);
      orderDateControl.updateValueAndValidity({ emitEvent: false });
    });
    this.batchForm = new FormGroup({
      productIndex: new FormControl<number | null>(null, [Validators.required]),
      batchCode: new FormControl('', [Validators.required]),
      orderedQuantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      plannedProductionDate: new FormControl<Date | string | null>(null),
      serialPrefix: new FormControl(''),
      note: new FormControl(''),
    });
    this.completePoForm = new FormGroup({
      actualProcessedQuantity: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/),
      ]),
    });
    const expectedShipDateControl = new FormControl<Date | string | null>(null);
    const expectedArrivalDateControl = new FormControl<Date | string | null>(null);
    this.shipmentForm = new FormGroup({
      shipmentCode: new FormControl('', [Validators.required]),
      batchIndexes: new FormControl<number[]>([], [Validators.required, Validators.minLength(1)]),
      status: new FormControl(PurchaseOrderShipmentStatus.PLANNED, [Validators.required]),
      receivingWarehouseId: new FormControl('', [Validators.required]),
      carrier: new FormControl(''),
      trackingNumber: new FormControl(''),
      expectedShipDate: expectedShipDateControl,
      expectedArrivalDate: expectedArrivalDateControl,
    }, { validators: this.arrivalDateNotBeforeShipDateValidator });

    expectedShipDateControl.valueChanges.subscribe(expectedShipDate => {
      this.expectedArrivalDateMin = this.normalizeDate(expectedShipDate);
      expectedArrivalDateControl.updateValueAndValidity({ emitEvent: false });
    });
    expectedArrivalDateControl.valueChanges.subscribe(expectedArrivalDate => {
      this.expectedShipDateMax = this.normalizeDate(expectedArrivalDate);
      expectedShipDateControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private readonly deliveryDateAfterOrderDateValidator: ValidatorFn = (
    form: AbstractControl
  ): ValidationErrors | null => {
    const orderDate = this.normalizeDate(form.get('orderDate')?.value);
    const requestedDeliveryDate = this.normalizeDate(form.get('requestedDeliveryDate')?.value);

    if (!orderDate || !requestedDeliveryDate) {
      return null;
    }

    return requestedDeliveryDate.getTime() > orderDate.getTime()
      ? null
      : { deliveryDateNotAfterOrderDate: true };
  };

  private readonly arrivalDateNotBeforeShipDateValidator: ValidatorFn = (
    form: AbstractControl
  ): ValidationErrors | null => {
    const expectedShipDate = this.normalizeDate(form.get('expectedShipDate')?.value);
    const expectedArrivalDate = this.normalizeDate(form.get('expectedArrivalDate')?.value);

    if (!expectedShipDate || !expectedArrivalDate) {
      return null;
    }

    return expectedArrivalDate.getTime() >= expectedShipDate.getTime()
      ? null
      : { arrivalDateBeforeShipDate: true };
  };

  private shiftDate(value: Date | string | null, days: number): Date | null {
    const date = this.normalizeDate(value);
    if (!date) {
      return null;
    }

    date.setDate(date.getDate() + days);
    return date;
  }

  private normalizeDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }

  get productFormArray(): FormArray {
    return this.poForm.get('products') as FormArray;
  }

  get products(): ProductRow[] {
    return this.productFormArray.getRawValue() as ProductRow[];
  }

  private createProductForm(product?: Partial<ProductRow>): FormGroup {
    return new FormGroup({
      id: new FormControl(product?.id ?? ''),
      modelId: new FormControl(product?.modelId ?? '', [Validators.required]),
      modelName: new FormControl(product?.modelName ?? ''),
      modelCode: new FormControl(product?.modelCode ?? ''),
      version: new FormControl(product?.version ?? ''),
      quantity: new FormControl(product?.quantity ?? null, [Validators.required, Validators.min(1)]),
      unitPrice: new FormControl(product?.unitPrice ?? null, [Validators.min(0)]),
      lineTotal: new FormControl(product?.lineTotal ?? null),
    });
  }

  async loadSuppliers() {
    const response = await this.injector.get(ApiService).executeQuery(
      GET_SUPPLIERS_FOR_SELECT,
      { pagination: { page: 1, size: 100, keyword: '' } }
    );
    this.supplierOptions = response?.suppliers?.data?.map((s: any) => ({
      value: s.id,
      label: s.name,
      ...s,
    })) ?? [];
  }

  async loadModels() {
    const response = await this.injector.get(ApiService).executeQuery(
      GET_MODELS_FOR_SELECT,
      { pagination: { page: 1, size: 100, keyword: '' } }
    );
    this.modelOptions = response?.models?.data?.map((model: any) => ({
      ...model,
      value: model.id,
      label: model.name,
    })) ?? [];
  }

  async loadPurchaseOrder(id: string) {
    const response = await this.injector.get(ApiService).executeQuery(
      GET_PURCHASE_ORDER,
      { id }
    );
    const po = response?.purchaseOrder;
    if (!po) {
      this.commonService.openSnackBarError('Không tìm thấy đơn đặt hàng');
      this.injector.get(Router).navigate(['/purchase-order']);
      return;
    }
    this.poData = po;
    this.selectedBatchIds.clear();

    // Patch form
    this.poForm.patchValue({
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      currency: po.currency,
      orderDate: po.orderDate ? new Date(po.orderDate) : null,
      requestedDeliveryDate: po.requestedDeliveryDate ? new Date(po.requestedDeliveryDate) : null,
      paymentTerms: po.paymentTerms || '',
      factoryContact: po.factoryContact || '',
      projectNote: po.projectNote || '',
    });

    // Load items
    this.productFormArray.clear();
    (po.items || []).forEach((item: any) => {
      const itemModel = item.model || {
        id: item.modelId,
        name: item.modelName,
        code: item.modelCode,
      };
      if (itemModel.id && !this.modelOptions.some(model => model.id === itemModel.id)) {
        this.modelOptions = [
          ...this.modelOptions,
          {
            ...itemModel,
            value: itemModel.id,
            label: itemModel.name,
          },
        ];
      }

      this.productFormArray.push(this.createProductForm({
        id: item.id,
        modelId: item.modelId || itemModel.id,
        modelName: item.modelName || itemModel.name,
        modelCode: item.modelCode || itemModel.code,
        version: item.version || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      }));
    });

    // Load batches from their parent items. Fall back to the legacy top-level list.
    const products = this.products;
    const itemBatches = (po.items || []).flatMap((item: any, productIndex: number) =>
      (item.batches || []).map((batch: any) => ({
        ...batch,
        itemId: batch.itemId || item.id,
        productIndex,
      }))
    );
    const batchSource = itemBatches.length
      ? itemBatches
      : (po.batches || []).map((batch: any) => ({
        ...batch,
        productIndex: Math.max(products.findIndex(product => product.id === batch.itemId), 0),
      }));

    this.batches = batchSource.map((batch: any) => ({
      id: batch.id,
      batchCode: batch.batchCode,
      orderedQuantity: batch.orderedQuantity,
      generatedQuantity: batch.generatedQuantity || 0,
      plannedProductionDate: batch.plannedProductionDate || '',
      serialPrefix: batch.serialPrefix || '',
      note: batch.note || '',
      status: batch.status || PurchaseOrderBatchStatus.DRAFT,
      itemId: batch.itemId,
      productIndex: batch.productIndex,
    }));

    // Load shipments - map shipmentBatches[].batchId to batchIndexes
    const batchIdToIndex = new Map<string, number>();
    this.batches.forEach((batch, index) => {
      if (batch.id) batchIdToIndex.set(batch.id, index);
    });
    this.shipments = (po.shipments || []).map((ship: any) => {
      const receivingWarehouseName = ship.warehouse?.name
        || this.getShipmentNoteValue(ship.note, 'Kho nhận');
      const receivingWarehouse = this.warehouseList.find(
        warehouse => warehouse.id === ship.warehouseId || warehouse.name === receivingWarehouseName
      );

      // Resolve batch indexes from shipmentBatches[]
      const shipmentBatches = ship.shipmentBatches || [];
      const batchIndexes = shipmentBatches
        .map((sb: any) => batchIdToIndex.get(sb.batchId))
        .filter((idx: number | undefined): idx is number => idx !== undefined);

      return {
        ids: ship.id ? [ship.id] : [],
        shipmentCode: ship.shipmentCode,
        quantity: ship.quantity,
        expectedShipDate: ship.expectedShipDate || '',
        expectedArrivalDate: ship.expectedArrivalDate || '',
        carrier: ship.carrier || '',
        trackingNumber: ship.trackingNumber || '',
        status: ship.status || PurchaseOrderShipmentStatus.PLANNED,
        receivingWarehouseId: ship.warehouseId || receivingWarehouse?.id || '',
        receivingWarehouseName,
        batchIndexes,
      } as ShipmentRow;
    });
  }

  // ============ Products ============
  addProduct() {
    this.productFormArray.push(this.createProductForm());
  }

  removeProduct(index: number) {
    if (this.batches.some(batch => batch.productIndex === index)) {
      this.commonService.openSnackBarError('Vui lòng xóa batch/lot của sản phẩm trước');
      return;
    }

    this.productFormArray.removeAt(index);
    this.batches = this.batches.map(batch => ({
      ...batch,
      productIndex: batch.productIndex > index ? batch.productIndex - 1 : batch.productIndex,
    }));
  }

  onProductModelSelected(event: any, index: number) {
    const productForm = this.productFormArray.at(index) as FormGroup;
    if (event) {
      productForm.patchValue({
        modelId: event.id || event.value,
        modelName: event.name || event.label,
        modelCode: event.code || '',
      });
    } else {
      productForm.patchValue({ modelId: '', modelName: '', modelCode: '' });
    }
  }

  updateProductLineTotal(index: number) {
    const productForm = this.productFormArray.at(index) as FormGroup;
    const quantity = Number(productForm.get('quantity')?.value || 0);
    const unitPriceValue = productForm.get('unitPrice')?.value;
    const unitPrice = unitPriceValue === null || unitPriceValue === '' ? null : Number(unitPriceValue);
    productForm.get('lineTotal')?.setValue(quantity > 0 && unitPrice !== null ? quantity * unitPrice : null);
  }

  onProductQuantityInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const quantity = digits ? Number(digits) : null;
    const productForm = this.productFormArray.at(index) as FormGroup;

    productForm.get('quantity')?.setValue(quantity, { emitEvent: false });
    input.value = quantity === null
      ? ''
      : quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.updateProductLineTotal(index);
  }

  // ============ Batches ============
  addBatch() {
    if (!this.products.some(product => product.modelId)) {
      this.commonService.openSnackBarError('Vui lòng thêm sản phẩm trước khi thêm batch/lot');
      return;
    }

    this.editingBatchIndex = null;
    const firstProductIndex = this.products.findIndex(product => product.modelId);
    this.batchForm.reset({
      productIndex: firstProductIndex,
      batchCode: this.generateNextBatchCode(),
      orderedQuantity: null,
      plannedProductionDate: null,
      serialPrefix: '',
      note: '',
    });
    this.openBatchDrawer('Thêm batch/lot');
  }

  editBatch(index: number) {
    const batch = this.batches[index];
    this.editingBatchIndex = index;
    this.batchForm.reset({
      ...batch,
      plannedProductionDate: batch.plannedProductionDate ? new Date(batch.plannedProductionDate) : null,
    });
    this.openBatchDrawer('Cập nhật batch/lot');
  }

  private openBatchDrawer(title: string) {
    this.commonService.openRightSlideNav({
      title,
      content: this.batchDrawerContent,
      width: '720px',
      onClose: () => this.onBatchDrawerClosed(),
    });
  }

  saveBatch() {
    this.batchForm.markAllAsTouched();
    if (this.batchForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin batch/lot bắt buộc');
      return;
    }

    const value = this.batchForm.getRawValue();
    const batchCode = value.batchCode.trim();
    const duplicated = this.batches.some((batch, index) =>
      index !== this.editingBatchIndex && batch.batchCode.trim().toLowerCase() === batchCode.toLowerCase()
    );
    if (duplicated) {
      this.commonService.openSnackBarError('Mã batch/lot đã tồn tại trong danh sách');
      return;
    }

    // Giữ nguyên id/itemId nếu đang chỉnh sửa batch đã tồn tại (được backend trả về khi load PO)
    const currentBatch = this.editingBatchIndex === null
      ? null
      : this.batches[this.editingBatchIndex];

    const batch: BatchRow = {
      id: currentBatch?.id,
      itemId: currentBatch?.itemId,
      productIndex: Number(value.productIndex),
      batchCode,
      orderedQuantity: Number(value.orderedQuantity),
      plannedProductionDate: value.plannedProductionDate instanceof Date
        ? this.formatDate(value.plannedProductionDate)
        : value.plannedProductionDate || '',
      serialPrefix: value.serialPrefix?.trim() || '',
      note: value.note?.trim() || '',
    };

    // KHÔNG gọi CREATE/UPDATE batch API tại đây.
    // Danh sách batches sẽ được gửi kèm qua input.items[].batches
    // khi bấm "Lưu PO" (createPurchaseOrder / updatePurchaseOrder).
    if (this.editingBatchIndex === null) {
      this.batches.push(batch);
    } else {
      this.batches[this.editingBatchIndex] = batch;
    }
    this.commonService.closeRightSlideNav();
  }

  removeBatch(index: number) {
    // KHÔNG gọi DELETE batch API. Batches sẽ được đồng bộ khi save PO.
    this.batches.splice(index, 1);
  }

  getBatchProductLabel(batch: BatchRow): string {
    const product = this.products[batch.productIndex];
    if (!product) return '-';
    return `${product.modelName || product.modelCode}${product.version ? ' - ' + product.version : ''}`;
  }

  private getBatchStepIndex(status?: PurchaseOrderBatchStatus): number {
    return this.batchSteps.findIndex(step => step.key === status);
  }

  getBatchStepState(batchStatus: PurchaseOrderBatchStatus | undefined, stepIndex: number): 'completed' | 'current' | 'pending' {
    if (batchStatus === PurchaseOrderBatchStatus.CANCELLED) return 'pending';
    const currentIndex = this.getBatchStepIndex(batchStatus);
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  }

  getBatchStepCircleClass(batchStatus: PurchaseOrderBatchStatus | undefined, stepIndex: number): string {
    return this.getBatchStepState(batchStatus, stepIndex) === 'pending'
      ? 'bg-gray-300 border-gray-300'
      : 'bg-green-500 border-green-500';
  }

  getBatchStepLineClass(batchStatus: PurchaseOrderBatchStatus | undefined, stepIndex: number): string {
    if (batchStatus === PurchaseOrderBatchStatus.CANCELLED) return 'bg-gray-200';
    return stepIndex < this.getBatchStepIndex(batchStatus) ? 'bg-green-500' : 'bg-gray-200';
  }

  getBatchStepLabelClass(batchStatus: PurchaseOrderBatchStatus | undefined, stepIndex: number): string {
    return this.getBatchStepState(batchStatus, stepIndex) === 'pending'
      ? 'text-gray-500'
      : 'text-green-700 font-semibold';
  }

  isBatchCancelled(status?: PurchaseOrderBatchStatus): boolean {
    return status === PurchaseOrderBatchStatus.CANCELLED;
  }

  isBatchSelected(batch: BatchRow): boolean {
    return !!batch.id && this.selectedBatchIds.has(batch.id);
  }

  isBatchSelectionDisabled(batch: BatchRow): boolean {
    if (!batch.id || this.updatingBatchId) {
      return true;
    }
    return !!this.selectedBatchStatus
      && batch.status !== this.selectedBatchStatus;
  }

  toggleBatchSelection(batch: BatchRow, checked: boolean): void {
    if (!batch.id) {
      return;
    }

    if (checked) {
      if (this.isBatchSelectionDisabled(batch)) {
        return;
      }
      this.selectedBatchIds.add(batch.id);
    } else {
      this.selectedBatchIds.delete(batch.id);
    }
  }

  clearBatchSelection(): void {
    this.selectedBatchIds.clear();
  }

  editSelectedBatch(): void {
    if (this.selectedBatches.length !== 1) {
      return;
    }
    const selectedId = this.selectedBatches[0].id;
    const index = this.batches.findIndex(batch => batch.id === selectedId);
    if (index >= 0) {
      this.editBatch(index);
    }
  }

  removeSelectedBatches(): void {
    const selectedIndexes = this.batches
      .map((batch, index) => ({ batch, index }))
      .filter(({ batch }) => !!batch.id && this.selectedBatchIds.has(batch.id))
      .map(({ index }) => index)
      .sort((a, b) => b - a);

    selectedIndexes.forEach(index => this.removeBatch(index));
    this.clearBatchSelection();
  }

  canSelectBatchForProduction(batch: BatchRow): boolean {
    return this.canMoveBatchesToProduction
      && !!batch.id
      && batch.status === PurchaseOrderBatchStatus.CREATED;
  }

  canSelectBatchForProductionCompleted(batch: BatchRow): boolean {
    return this.isEditMode
      && !!batch.id
      && batch.status === PurchaseOrderBatchStatus.IN_PRODUCTION;
  }

  async selectSelectedBatchesForProduction(): Promise<void> {
    const selectedBatches = [...this.selectedBatches];
    if (!this.canSelectSelectedBatchesForProduction || this.updatingBatchId) {
      return;
    }

    const batchIds = selectedBatches
      .map(batch => batch.id)
      .filter((id): id is string => !!id);
    this.updatingBatchId = batchIds[0];

    try {
      const response = await this.injector.get(ApiService).executeMutation<any>(
        UPDATE_PURCHASE_ORDER_BATCH_STATUS,
        {
          ids: batchIds,
          status: PurchaseOrderBatchStatus.IN_PRODUCTION,
        }
      );
      const updatedBatches = response?.updatePurchaseOrderBatchStatus || [];
      const updatedBatchById = new Map<string, any>(
        updatedBatches.map((batch: any) => [batch.id, batch])
      );

      selectedBatches.forEach(batch => {
        const updatedBatch = batch.id ? updatedBatchById.get(batch.id) : null;
        if (updatedBatch) {
          batch.status = updatedBatch.status;
          batch.generatedQuantity = updatedBatch.generatedQuantity ?? batch.generatedQuantity;
        }
      });

      if (updatedBatches.length !== selectedBatches.length) {
        this.commonService.openSnackBarError(
          `Chỉ chuyển được ${updatedBatches.length}/${selectedBatches.length} batch sang sản xuất`
        );
        return;
      }

      this.commonService.openSnackBar(`Đã chọn ${updatedBatches.length} batch để sản xuất`);

      // Reload PO để cập nhật trạng thái mới (backend có thể tự chuyển PO sang IN_PRODUCTION)
      if (this.poId) {
        await this.loadPurchaseOrder(this.poId);
      }
    } catch {
      this.commonService.openSnackBarError('Chuyển các batch sang sản xuất thất bại');
    } finally {
      this.updatingBatchId = null;
      this.clearBatchSelection();
    }
  }

  isBatchProductionCompleted(batch: BatchRow): boolean {
    return batch.status === PurchaseOrderBatchStatus.PRODUCTION_COMPLETED;
  }

  async selectSelectedBatchesForProductionCompleted(): Promise<void> {
    const selectedBatches = [...this.selectedBatches];
    if (!this.canSelectSelectedBatchesForProductionCompleted || this.updatingBatchId) {
      return;
    }

    const batchIds = selectedBatches
      .map(batch => batch.id)
      .filter((id): id is string => !!id);
    this.updatingBatchId = batchIds[0];

    try {
      const response = await this.injector.get(ApiService).executeMutation<any>(
        UPDATE_PURCHASE_ORDER_BATCH_STATUS,
        {
          ids: batchIds,
          status: PurchaseOrderBatchStatus.PRODUCTION_COMPLETED,
        }
      );
      const updatedBatches = response?.updatePurchaseOrderBatchStatus || [];
      const updatedBatchById = new Map<string, any>(
        updatedBatches.map((batch: any) => [batch.id, batch])
      );

      selectedBatches.forEach(batch => {
        const updatedBatch = batch.id ? updatedBatchById.get(batch.id) : null;
        if (updatedBatch) {
          batch.status = updatedBatch.status;
          batch.generatedQuantity = updatedBatch.generatedQuantity ?? batch.generatedQuantity;
        }
      });

      if (updatedBatches.length !== selectedBatches.length) {
        this.commonService.openSnackBarError(
          `Chỉ cập nhật được ${updatedBatches.length}/${selectedBatches.length} batch`
        );
        return;
      }

      this.commonService.openSnackBar(`Đã hoàn thành sản xuất ${updatedBatches.length} batch`);

      if (this.poId) {
        await this.loadPurchaseOrder(this.poId);
      }
    } catch {
      this.commonService.openSnackBarError('Cập nhật trạng thái batch thất bại');
    } finally {
      this.updatingBatchId = null;
      this.clearBatchSelection();
    }
  }

  get canCreateShipment(): boolean {
    return this.isEditMode
      && this.poData?.status !== 'CANCELLED'
      && this.batches.some(batch => this.isBatchProductionCompleted(batch));
  }

  canSelectBatchForShipment(index: number): boolean {
    const currentSelection = this.shipmentForm.get('batchIndexes')?.value as number[] | null;
    return this.isBatchProductionCompleted(this.batches[index])
      || (this.editingShipmentIndex !== null && !!currentSelection?.includes(index));
  }

  cancelBatchDrawer() {
    this.commonService.closeRightSlideNav();
  }

  private onBatchDrawerClosed() {
    this.editingBatchIndex = null;
    this.batchForm.reset();
  }

  // ============ Shipments ============
  async addShipment() {
    if (!this.isEditMode || !this.poId) {
      this.commonService.openSnackBarError('Vận chuyển chỉ được tạo sau khi đơn đặt hàng và batch đã được lưu');
      return;
    }

    const completedBatchIndexes = this.batches
      .map((batch, index) => this.isBatchProductionCompleted(batch) ? index : -1)
      .filter(index => index >= 0);
    if (completedBatchIndexes.length === 0) {
      this.commonService.openSnackBarError('Chỉ có thể tạo vận chuyển khi batch đã hoàn thành sản xuất');
      return;
    }

    this.editingShipmentIndex = null;
    this.shipmentForm.get('batchIndexes')?.enable({ emitEvent: false });
    this.shipmentForm.reset({
      shipmentCode: await this.generateNextShipmentCode(),
      batchIndexes: [],
      status: PurchaseOrderShipmentStatus.PLANNED,
      receivingWarehouseId: '',
      carrier: '',
      trackingNumber: '',
      expectedShipDate: null,
      expectedArrivalDate: null,
    });
    this.openShipmentDrawer('Thêm vận chuyển');
  }

  editShipment(index: number) {
    const shipment = this.shipments[index];
    this.editingShipmentIndex = index;
    this.shipmentForm.reset({
      shipmentCode: shipment.shipmentCode,
      batchIndexes: [...shipment.batchIndexes],
      status: shipment.status || PurchaseOrderShipmentStatus.PLANNED,
      receivingWarehouseId: shipment.receivingWarehouseId || '',
      carrier: shipment.carrier || '',
      trackingNumber: shipment.trackingNumber || '',
      expectedShipDate: shipment.expectedShipDate ? new Date(shipment.expectedShipDate) : null,
      expectedArrivalDate: shipment.expectedArrivalDate ? new Date(shipment.expectedArrivalDate) : null,
    });
    this.shipmentForm.get('batchIndexes')?.disable({ emitEvent: false });
    this.openShipmentDrawer('Cập nhật vận chuyển');
  }

  private openShipmentDrawer(title: string) {
    this.commonService.openRightSlideNav({
      title,
      content: this.shipmentDrawerContent,
      width: '720px',
      onClose: () => this.onShipmentDrawerClosed(),
    });
  }

  async saveShipment() {
    this.shipmentForm.markAllAsTouched();
    if (this.shipmentForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin vận chuyển bắt buộc');
      return;
    }

    const value = this.shipmentForm.getRawValue();
    const batchIndexes = (value.batchIndexes || []) as number[];
    if (!batchIndexes.length) {
      this.commonService.openSnackBarError('Vui lòng chọn ít nhất 1 batch/lot');
      return;
    }

    if (this.editingShipmentIndex === null
      && batchIndexes.some(index => !this.isBatchProductionCompleted(this.batches[index]))) {
      this.commonService.openSnackBarError('Chỉ có thể tạo vận chuyển cho batch đã hoàn thành sản xuất');
      return;
    }

    if (!this.poId) {
      this.commonService.openSnackBarError('Không tìm thấy đơn đặt hàng để tạo vận chuyển');
      return;
    }

    const shipmentCode = value.shipmentCode.trim();
    const duplicated = this.shipments.some((ship, index) =>
      index !== this.editingShipmentIndex && ship.shipmentCode.trim().toLowerCase() === shipmentCode.toLowerCase()
    );
    if (duplicated) {
      this.commonService.openSnackBarError('Mã vận chuyển đã tồn tại trong danh sách');
      return;
    }

    // Auto-calc quantity from selected batches
    const quantity = batchIndexes.reduce((sum, idx) => sum + (this.batches[idx]?.orderedQuantity || 0), 0);
    const warehouse = this.warehouseList.find(w => w.id === value.receivingWarehouseId);

    const shipment: ShipmentRow = {
      ids: this.editingShipmentIndex === null
        ? []
        : this.shipments[this.editingShipmentIndex]?.ids,
      shipmentCode,
      batchIndexes,
      quantity,
      status: value.status as PurchaseOrderShipmentStatus,
      receivingWarehouseId: value.receivingWarehouseId,
      receivingWarehouseName: warehouse?.name || '',
      carrier: value.carrier?.trim() || '',
      trackingNumber: value.trackingNumber?.trim() || '',
      expectedShipDate: value.expectedShipDate instanceof Date
        ? this.formatDate(value.expectedShipDate)
        : value.expectedShipDate || '',
      expectedArrivalDate: value.expectedArrivalDate instanceof Date
        ? this.formatDate(value.expectedArrivalDate)
        : value.expectedArrivalDate || '',
    };

    const noteParts = [
      shipment.receivingWarehouseName ? `Kho nhận: ${shipment.receivingWarehouseName}` : '',
    ].filter(Boolean);
    const shipmentNote = noteParts.join(' | ') || null;
    const existingIds = shipment.ids || [];

    if (this.editingShipmentIndex !== null && existingIds.length > 0) {
      for (let index = 0; index < existingIds.length; index++) {
        const batchIndex = batchIndexes[index] ?? batchIndexes[0];
        const batch = this.batches[batchIndex];
        await this.injector.get(ApiService).executeMutation(
          UPDATE_PURCHASE_ORDER_SHIPMENT,
          {
            id: existingIds[index],
            input: {
              batches: batchIndexes.map(idx => ({
                batchId: this.batches[idx]?.id,
                quantity: Number(this.batches[idx]?.orderedQuantity || 0),
              })).filter(b => !!b.batchId),
              quantity: batchIndexes.reduce((sum, idx) => sum + Number(this.batches[idx]?.orderedQuantity || 0), 0),
              expectedShipDate: shipment.expectedShipDate || null,
              expectedArrivalDate: shipment.expectedArrivalDate || null,
              carrier: shipment.carrier || null,
              trackingNumber: shipment.trackingNumber || null,
              warehouseId: shipment.receivingWarehouseId || null,
              note: shipmentNote,
            },
          }
        );
      }

      const previousStatus = this.shipments[this.editingShipmentIndex]?.status;
      if (previousStatus !== shipment.status) {
        await this.updateShipmentStatuses(existingIds, shipment.status);
      }
    } else {
      // Tạo 1 shipment duy nhất với nhiều batch thông qua batches[]
      const batchesInput = batchIndexes
        .map(idx => ({
          batchId: this.batches[idx]?.id,
          quantity: Number(this.batches[idx]?.orderedQuantity || 0),
        }))
        .filter(b => !!b.batchId);

      const response = await this.injector.get(ApiService).executeMutation(
        CREATE_PURCHASE_ORDER_SHIPMENT,
        {
          input: {
            purchaseOrderId: this.poId,
            shipmentCode: shipment.shipmentCode,
            batches: batchesInput,
            expectedShipDate: shipment.expectedShipDate || null,
            expectedArrivalDate: shipment.expectedArrivalDate || null,
            carrier: shipment.carrier || null,
            trackingNumber: shipment.trackingNumber || null,
            warehouseId: shipment.receivingWarehouseId || null,
            note: shipmentNote,
          },
        }
      );

      const createdShipment = response?.createPurchaseOrderShipment;
      if (createdShipment?.id && shipment.status !== PurchaseOrderShipmentStatus.PLANNED) {
        await this.updateShipmentStatuses([createdShipment.id], shipment.status);
      }
    }

    const wasEditing = this.editingShipmentIndex !== null;
    this.commonService.closeRightSlideNav();
    await this.loadPurchaseOrder(this.poId);
    this.commonService.openSnackBar(
      wasEditing ? 'Cập nhật vận chuyển thành công' : 'Tạo vận chuyển thành công'
    );
  }

  async removeShipment(index: number) {
    const shipmentIds = this.shipments[index]?.ids || [];
    for (const id of shipmentIds) {
      await this.injector.get(ApiService).executeMutation(
        DELETE_PURCHASE_ORDER_SHIPMENT,
        { id }
      );
    }
    this.shipments.splice(index, 1);
    this.commonService.openSnackBar('Xóa vận chuyển thành công');
  }

  cancelShipmentDrawer() {
    this.commonService.closeRightSlideNav();
  }

  updatingShipmentIds: boolean = false;

  get selectedShipments(): ShipmentRow[] {
    return this.selectedShipmentIndexes.map(i => this.shipments[i]).filter(Boolean);
  }

  get selectedShipmentStatus(): PurchaseOrderShipmentStatus | null {
    const statuses = [...new Set(this.selectedShipments.map(s => s.status))];
    return statuses.length === 1 ? statuses[0] : null;
  }

  getNextShipmentStatus(currentStatus: PurchaseOrderShipmentStatus): PurchaseOrderShipmentStatus | null {
    const flow: Partial<Record<PurchaseOrderShipmentStatus, PurchaseOrderShipmentStatus>> = {
      [PurchaseOrderShipmentStatus.PLANNED]: PurchaseOrderShipmentStatus.READY_TO_SHIP,
      [PurchaseOrderShipmentStatus.READY_TO_SHIP]: PurchaseOrderShipmentStatus.SHIPPED,
      [PurchaseOrderShipmentStatus.SHIPPED]: PurchaseOrderShipmentStatus.IN_TRANSIT,
      [PurchaseOrderShipmentStatus.IN_TRANSIT]: PurchaseOrderShipmentStatus.DELIVERED,
    };
    return flow[currentStatus] ?? null;
  }

  getNextShipmentStatusLabel(status: PurchaseOrderShipmentStatus | null): string {
    const labels: Partial<Record<PurchaseOrderShipmentStatus, string>> = {
      [PurchaseOrderShipmentStatus.READY_TO_SHIP]: 'Sẵn sàng xuất',
      [PurchaseOrderShipmentStatus.SHIPPED]: 'Đã xuất',
      [PurchaseOrderShipmentStatus.IN_TRANSIT]: 'Đang vận chuyển',
      [PurchaseOrderShipmentStatus.DELIVERED]: 'Đã nhận hàng',
    };
    return status ? (labels[status] ?? status) : '';
  }

  get canAdvanceSelectedShipments(): boolean {
    if (!this.selectedShipmentIndexes.length || !this.selectedShipmentStatus) return false;
    return !!this.getNextShipmentStatus(this.selectedShipmentStatus);
  }

  get canCancelSelectedShipments(): boolean {
    if (!this.selectedShipmentIndexes.length) return false;
    return this.selectedShipments.every(s =>
      s.status === PurchaseOrderShipmentStatus.PLANNED
      || s.status === PurchaseOrderShipmentStatus.READY_TO_SHIP
    );
  }

  private async updateShipmentStatuses(
    shipmentIds: string[],
    status: PurchaseOrderShipmentStatus
  ): Promise<void> {
    const uniqueIds = [...new Set(shipmentIds)];
    await Promise.all(uniqueIds.map(id =>
      this.injector.get(ApiService).executeMutation(
        UPDATE_PURCHASE_ORDER_SHIPMENT_STATUS,
        { id, status }
      )
    ));
  }

  isShipmentSelected(index: number): boolean {
    return this.selectedShipmentIndexes.includes(index);
  }

  isShipmentSelectionDisabled(index: number): boolean {
    if (this.updatingShipmentIds) return true;
    if (!this.selectedShipmentIndexes.length) return false;
    // same-status constraint
    const current = this.shipments[index];
    const firstStatus = this.shipments[this.selectedShipmentIndexes[0]]?.status;
    return current?.status !== firstStatus;
  }

  toggleShipmentSelection(index: number, checked: boolean) {
    if (this.isShipmentSelectionDisabled(index) && checked) return;
    if (checked) {
      if (!this.selectedShipmentIndexes.includes(index)) {
        this.selectedShipmentIndexes = [...this.selectedShipmentIndexes, index];
      }
    } else {
      this.selectedShipmentIndexes = this.selectedShipmentIndexes.filter(i => i !== index);
    }
  }

  async cancelSelectedShipments() {
    if (!this.canCancelSelectedShipments) return;
    const allIds = this.selectedShipments.flatMap(s => s.ids || []);
    if (!allIds.length) return;
    this.updatingShipmentIds = true;
    try {
      await this.updateShipmentStatuses(allIds, PurchaseOrderShipmentStatus.CANCELLED);
      this.selectedShipmentIndexes = [];
      await this.loadPurchaseOrder(this.poId!);
      this.commonService.openSnackBar('Hủy vận chuyển thành công');
    } catch {
      this.commonService.openSnackBarError('Hủy vận chuyển thất bại');
    } finally {
      this.updatingShipmentIds = false;
    }
  }

  async advanceSelectedShipments() {
    if (!this.canAdvanceSelectedShipments || !this.selectedShipmentStatus) return;
    const nextStatus = this.getNextShipmentStatus(this.selectedShipmentStatus)!;
    const allIds = this.selectedShipments.flatMap(s => s.ids || []);
    if (!allIds.length) return;
    this.updatingShipmentIds = true;
    try {
      await this.updateShipmentStatuses(allIds, nextStatus);

      this.selectedShipmentIndexes = [];
      await this.loadPurchaseOrder(this.poId!);
      this.commonService.openSnackBar(`Chuyển trạng thái vận chuyển thành công`);
    } catch {
      this.commonService.openSnackBarError('Chuyển trạng thái vận chuyển thất bại');
    } finally {
      this.updatingShipmentIds = false;
    }
  }

  printSelectedLabels() {
    if (!this.selectedShipmentIndexes.length) {
      this.commonService.openSnackBarError('Vui lòng chọn ít nhất 1 vận chuyển để in nhãn');
      return;
    }
    for (const index of this.selectedShipmentIndexes) {
      this.printLabel(index);
    }
  }


  private onShipmentDrawerClosed() {
    this.editingShipmentIndex = null;
    this.shipmentForm.get('batchIndexes')?.enable({ emitEvent: false });
    this.shipmentForm.reset();
  }

  getShipmentBatchLabels(shipment: ShipmentRow): string {
    if (!shipment.batchIndexes?.length) return '-';
    return shipment.batchIndexes
      .map(idx => this.batches[idx]?.batchCode)
      .filter(Boolean)
      .join(', ');
  }

  getShipmentStatusLabel(status: PurchaseOrderShipmentStatus): string {
    return this.shipmentStatusOptions.find(opt => opt.value === status)?.label || status || '-';
  }

  private getShipmentNoteValue(note: string | null | undefined, label: string): string {
    const part = note?.split('|').map(value => value.trim()).find(value => value.startsWith(`${label}:`));
    return part?.slice(label.length + 1).trim() || '';
  }

  private getShipmentStepIndex(status?: PurchaseOrderShipmentStatus): number {
    return this.shipmentSteps.findIndex(step => step.key === status);
  }

  getShipmentStepState(status: PurchaseOrderShipmentStatus | undefined, stepIndex: number): 'completed' | 'current' | 'pending' {
    if (status === PurchaseOrderShipmentStatus.CANCELLED) return 'pending';
    const currentIndex = this.getShipmentStepIndex(status);
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  }

  getShipmentStepCircleClass(status: PurchaseOrderShipmentStatus | undefined, stepIndex: number): string {
    return this.getShipmentStepState(status, stepIndex) === 'pending'
      ? 'bg-gray-300 border-gray-300'
      : 'bg-green-500 border-green-500';
  }

  getShipmentStepLineClass(status: PurchaseOrderShipmentStatus | undefined, stepIndex: number): string {
    if (status === PurchaseOrderShipmentStatus.CANCELLED) return 'bg-gray-200';
    return stepIndex < this.getShipmentStepIndex(status) ? 'bg-green-500' : 'bg-gray-200';
  }

  getShipmentStepLabelClass(status: PurchaseOrderShipmentStatus | undefined, stepIndex: number): string {
    return this.getShipmentStepState(status, stepIndex) === 'pending'
      ? 'text-gray-500'
      : 'text-green-700 font-semibold';
  }

  isShipmentCancelled(status?: PurchaseOrderShipmentStatus): boolean {
    return status === PurchaseOrderShipmentStatus.CANCELLED;
  }

  private hasInProductionBatch(): boolean {
    return this.batches.some(batch => batch.status === PurchaseOrderBatchStatus.IN_PRODUCTION);
  }

  private hasShipmentNotReceivedAtWarehouse(): boolean {
    return this.shipments.some(
      shipment => shipment.status !== PurchaseOrderShipmentStatus.DELIVERED
    );
  }

  private getCancelPurchaseOrderValidationMessage(): string | null {
    if (this.poData?.status !== PurchaseOrderStatus.DRAFT
      && this.poData?.status !== PurchaseOrderStatus.CONFIRMED) {
      return 'Chỉ có thể hủy PO ở trạng thái nháp hoặc đã xác nhận';
    }
    if (this.hasInProductionBatch()) {
      return 'Không thể hủy PO khi còn batch đang sản xuất';
    }
    if (this.hasShipmentNotReceivedAtWarehouse()) {
      return 'Không thể hủy PO khi còn shipment chưa nhập kho';
    }
    return null;
  }

  private getCompletePurchaseOrderValidationMessage(): string | null {
    if (this.poData?.status !== PurchaseOrderStatus.IN_PRODUCTION) {
      return 'Chỉ có thể hoàn thành PO đang sản xuất';
    }
    if (this.hasInProductionBatch()) {
      return 'Không thể hoàn thành PO khi còn batch đang sản xuất';
    }
    if (this.hasShipmentNotReceivedAtWarehouse()) {
      return 'Không thể hoàn thành PO khi còn shipment chưa nhập kho';
    }
    return null;
  }

  onOpenCancelPurchaseOrderDialog(): void {
    const validationMessage = this.getCancelPurchaseOrderValidationMessage();
    if (validationMessage) {
      this.commonService.openSnackBarError(validationMessage);
      return;
    }

    const dialogRef = this.injector.get(MatDialog).open(DialogNotificationComponent, {
      disableClose: true,
      data: {
        title: 'Xác nhận hủy đơn đặt hàng',
        confirmText: 'Hủy PO',
        cancelText: 'Đóng',
      },
    });
    dialogRef.componentInstance.content = this.cancelPoNotification;
    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (!result || !this.poId) return;

      const response = await this.injector.get(ApiService).executeMutation<any>(
        CANCEL_PURCHASE_ORDER,
        { id: this.poId }
      );
      if (!response?.cancelPurchaseOrder) {
        this.commonService.openSnackBarError('Hủy đơn đặt hàng thất bại');
        return;
      }

      this.poData = { ...this.poData, ...response.cancelPurchaseOrder };
      this.commonService.openSnackBar('Hủy đơn đặt hàng thành công');
    });
  }

  onOpenCompletePurchaseOrderDialog(): void {
    const validationMessage = this.getCompletePurchaseOrderValidationMessage();
    if (validationMessage) {
      this.commonService.openSnackBarError(validationMessage);
      return;
    }

    this.completePoForm.reset({ actualProcessedQuantity: null });
    const dialogRef = this.injector.get(MatDialog).open(DialogComponent, {
      data: {
        title: `Hoàn thành PO: ${this.poData?.poNumber || ''}`,
        confirmText: 'Hoàn thành',
        showActions: false,
      },
      width: '520px',
    });
    dialogRef.componentInstance.content = this.completePoDialogContent;
  }

  closePurchaseOrderActionDialog(): void {
    this.injector.get(MatDialog).closeAll();
  }

  async onConfirmCompletePurchaseOrder(): Promise<void> {
    this.completePoForm.markAllAsTouched();
    const actualProcessedQuantity = Number(this.completePoForm.value.actualProcessedQuantity);
    if (this.completePoForm.invalid || !Number.isInteger(actualProcessedQuantity) || actualProcessedQuantity < 0) {
      this.commonService.openSnackBarError('Số lượng thực tế phải là số nguyên không âm');
      return;
    }

    const validationMessage = this.getCompletePurchaseOrderValidationMessage();
    if (validationMessage) {
      this.commonService.openSnackBarError(validationMessage);
      return;
    }
    if (!this.poId) return;

    const response = await this.injector.get(ApiService).executeMutation<any>(
      COMPLETE_PURCHASE_ORDER,
      { id: this.poId, actualProcessedQuantity }
    );
    if (!response?.completePurchaseOrder) {
      this.commonService.openSnackBarError('Hoàn thành đơn đặt hàng thất bại');
      return;
    }

    this.poData = { ...this.poData, ...response.completePurchaseOrder };
    this.commonService.openSnackBar('Hoàn thành đơn đặt hàng thành công');
    this.closePurchaseOrderActionDialog();
  }

  // ============ Save ============
  async onSave() {
    this.poForm.markAllAsTouched();

    if (this.poForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    if (this.products.length === 0) {
      this.commonService.openSnackBarError('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    // Validate products
    for (let i = 0; i < this.products.length; i++) {
      if (!this.products[i].modelId) {
        this.commonService.openSnackBarError(`Sản phẩm dòng ${i + 1}: chưa chọn sản phẩm`);
        return;
      }
      if (!this.products[i].quantity || this.products[i].quantity <= 0) {
        this.commonService.openSnackBarError(`Sản phẩm dòng ${i + 1}: số lượng không hợp lệ`);
        return;
      }
    }

    // Validate batches
    for (let i = 0; i < this.batches.length; i++) {
      if (!this.batches[i].batchCode) {
        this.commonService.openSnackBarError(`Batch dòng ${i + 1}: chưa nhập mã batch`);
        return;
      }
      if (!this.batches[i].orderedQuantity || this.batches[i].orderedQuantity <= 0) {
        this.commonService.openSnackBarError(`Batch dòng ${i + 1}: số lượng không hợp lệ`);
        return;
      }
    }

    // Validate shipments
    for (let i = 0; i < this.shipments.length; i++) {
      if (!this.shipments[i].shipmentCode) {
        this.commonService.openSnackBarError(`Vận chuyển dòng ${i + 1}: chưa có mã vận chuyển`);
        return;
      }
      if (!this.shipments[i].batchIndexes?.length) {
        this.commonService.openSnackBarError(`Vận chuyển dòng ${i + 1}: chưa chọn batch/lot`);
        return;
      }
    }

    const formValue = this.poForm.value;
    const orderDate = formValue.orderDate instanceof Date
      ? this.formatDate(formValue.orderDate)
      : formValue.orderDate;
    const requestedDeliveryDate = formValue.requestedDeliveryDate instanceof Date
      ? this.formatDate(formValue.requestedDeliveryDate)
      : formValue.requestedDeliveryDate || null;

    // Build items với batches nested theo productIndex
    const itemsWithBatches = this.products.map((p, productIndex) => ({
      modelId: p.modelId,
      quantity: Number(p.quantity),
      unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
      version: p.version || null,
      batches: this.batches
        .filter(batch => batch.productIndex === productIndex)
        .map(batch => ({
          batchCode: batch.batchCode,
          orderedQuantity: Number(batch.orderedQuantity),
          plannedProductionDate: batch.plannedProductionDate || null,
          serialPrefix: batch.serialPrefix || null,
          note: batch.note || null,
        })),
    }));

    const input: any = {
      poNumber: formValue.poNumber,
      supplierId: formValue.supplierId,
      currency: formValue.currency || 'CNY',
      orderDate: orderDate,
      requestedDeliveryDate: requestedDeliveryDate,
      paymentTerms: formValue.paymentTerms || null,
      factoryContact: formValue.factoryContact || null,
      projectNote: formValue.projectNote || null,
      items: itemsWithBatches,
    };

    if (this.isEditMode && this.poId) {
      if (!this.canEditPurchaseOrder) {
        this.commonService.openSnackBarError('Chỉ đơn đặt hàng ở trạng thái nháp mới được chỉnh sửa');
        return;
      }

      const { poNumber: _poNumber, ...updateInput } = input;
      const updateResponse = await this.injector.get(ApiService).executeMutation(
        UPDATE_PURCHASE_ORDER,
        { id: this.poId, input: updateInput }
      );

      if (!updateResponse?.updatePurchaseOrder) {
        this.commonService.openSnackBarError('Cập nhật đơn đặt hàng thất bại');
        return;
      }

      this.commonService.openSnackBar('Cập nhật đơn đặt hàng thành công');
      this.injector.get(Router).navigate(['/purchase-order']);
      return;
    }

    // Step 1: Create PO together with each product's batches/lots (nested)
    const poResponse = await this.injector.get(ApiService).executeMutation(
      CREATE_PURCHASE_ORDER,
      { input }
    );

    if (!poResponse?.createPurchaseOrder) {
      this.commonService.openSnackBarError('Tạo đơn đặt hàng thất bại');
      return;
    }

    const createdPo = poResponse.createPurchaseOrder as any;
    const newPoId = createdPo.id;
    this.commonService.openSnackBar('Tạo đơn đặt hàng thành công');

    // Batches are already created by createPurchaseOrder. Fetch their IDs only when shipments need linking.
    const createdBatchIds: (string | null)[] = new Array(this.batches.length).fill(null);
    if (this.shipments.length > 0) {
      const poDetailResponse = await this.injector.get(ApiService).executeQuery(
        GET_PURCHASE_ORDER,
        { id: newPoId }
      );
      const poDetail = poDetailResponse?.purchaseOrder as any;

      const batchIdByCode = new Map<string, string>(
        (poDetail?.batches || []).map((batch: any) => [batch.batchCode, batch.id])
      );
      this.batches.forEach((batch, index) => {
        createdBatchIds[index] = batchIdByCode.get(batch.batchCode) || null;
      });

      // Each UI shipment with N batches becomes N shipments in backend.
      for (const shipment of this.shipments) {
        const batchIndexes = shipment.batchIndexes || [];
        const noteParts = [
          shipment.status ? `Trạng thái: ${this.getShipmentStatusLabel(shipment.status)}` : '',
          shipment.receivingWarehouseName ? `Kho nhận: ${shipment.receivingWarehouseName}` : '',
        ].filter(Boolean);
        const shipmentNote = noteParts.join(' | ') || null;

        for (const batchIdx of batchIndexes) {
          const linkedBatchId = createdBatchIds[batchIdx];
          const batchQuantity = this.batches[batchIdx]?.orderedQuantity || 0;
          const shipmentInput: any = {
            purchaseOrderId: newPoId,
            shipmentCode: batchIndexes.length > 1
              ? `${shipment.shipmentCode}-${this.batches[batchIdx]?.batchCode}`
              : shipment.shipmentCode,
            quantity: Number(batchQuantity),
            expectedShipDate: shipment.expectedShipDate || null,
            expectedArrivalDate: shipment.expectedArrivalDate || null,
            carrier: shipment.carrier || null,
            trackingNumber: shipment.trackingNumber || null,
            batchId: linkedBatchId,
            warehouseId: shipment.receivingWarehouseId || null,
            note: shipmentNote,
          };

          const shipmentResponse = await this.injector.get(ApiService).executeMutation(
            CREATE_PURCHASE_ORDER_SHIPMENT,
            { input: shipmentInput }
          );
          const createdShipmentId = shipmentResponse?.createPurchaseOrderShipment?.id;
          if (createdShipmentId && shipment.status !== PurchaseOrderShipmentStatus.PLANNED) {
            await this.updateShipmentStatuses([createdShipmentId], shipment.status);
          }
        }
      }
    }

    this.injector.get(Router).navigate(['/purchase-order']);
  }

  onCancel() {
    this.injector.get(Router).navigate(['/purchase-order']);
  }

  override ngOnDestroy(): void {
    this.commonService.closeRightSlideNav();
    super.ngOnDestroy();
  }

  private async setGeneratedPoNumber(): Promise<void> {
    const prefix = this.getDatedCodePrefix('PO');
    const response = await this.injector.get(ApiService).executeQuery(
      GET_PURCHASE_ORDER_NUMBERS,
      { pagination: { page: 1, size: 1000, keyword: prefix } }
    );
    const existingCodes = response?.purchaseOrders?.data?.map((item: any) => item.poNumber) ?? [];
    this.poForm.get('poNumber')?.setValue(this.getNextSequenceCode(prefix, existingCodes));
  }

  private generateNextBatchCode(): string {
    if (!this.batchRandomLetters) {
      // Try to extract from existing batches to maintain sequence in edit mode
      const existingFormatBatch = this.batches.find(b => b.batchCode && b.batchCode.match(/^BAT-\d{8}[A-Z]{3}-\d{3}$/));
      if (existingFormatBatch) {
        this.batchRandomLetters = existingFormatBatch.batchCode.substring(12, 15);
      } else {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomStr = '';
        for (let i = 0; i < 3; i++) {
          randomStr += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        this.batchRandomLetters = randomStr;
      }
    }

    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const dateStr = `${day}${month}${year}`;

    const prefix = `BAT-${dateStr}${this.batchRandomLetters}-`;
    const existingBatches = this.batches.map(b => b.batchCode);
    return this.getNextSequenceCode(prefix, existingBatches);
  }

  printLabel(index: number) {
    const shipment = this.shipments[index];
    if (shipment && this.poData) {
      // Map batches to include product and model info
      const enrichedBatches = this.batches
        .filter((_, i) => shipment.batchIndexes.includes(i))
        .map(b => {
          const product = this.products[b.productIndex];
          return {
            ...b,
            product: product?.modelName || product?.modelCode || '-',
            modelCode: product?.modelCode || '-'
          };
        });

      // Collect necessary data to pass to print-label
      const printData = {
        poData: this.poData,
        shipment: shipment,
        batches: enrichedBatches,
        totalPoQty: this.batches.reduce((sum, b) => sum + (b.orderedQuantity || 0), 0)
      };

      // Generate a unique ID for this print session to support multiple tabs if needed
      const printId = `print_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(printId, JSON.stringify(printData));

      const url = this.injector.get(Router).serializeUrl(
        this.injector.get(Router).createUrlTree(['/print-label'], {
          queryParams: { session: printId }
        })
      );
      window.open(url, '_blank');
    } else {
       this.commonService.openSnackBarError('Vui lòng tải đầy đủ dữ liệu PO trước khi in nhãn');
    }
  }

  private async generateNextShipmentCode(): Promise<string> {
    if (!this.shipmentRandomLetters) {
      const existingFormatShipment = this.shipments.find(s => s.shipmentCode && s.shipmentCode.match(/^SHP-\d{8}[A-Z]{3}-\d{3}$/));
      if (existingFormatShipment) {
        this.shipmentRandomLetters = existingFormatShipment.shipmentCode.substring(12, 15);
      } else {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomStr = '';
        for (let i = 0; i < 3; i++) {
          randomStr += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        this.shipmentRandomLetters = randomStr;
      }
    }

    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const dateStr = `${day}${month}${year}`;

    const prefix = `SHP-${dateStr}${this.shipmentRandomLetters}-`;
    const existingCodes = this.shipments.map(shipment => shipment.shipmentCode);
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.injector.get(ApiService).executeQuery(
        GET_PURCHASE_ORDER_SHIPMENT_CODES,
        { pagination: { page, size: 100 } }
      );
      const result = response?.purchaseOrders;
      existingCodes.push(
        ...(result?.data || []).flatMap((purchaseOrder: any) =>
          (purchaseOrder.shipments || []).map((shipment: any) => shipment.shipmentCode)
        )
      );
      totalPages = Math.max(Number(result?.pagination?.totalPages || 1), 1);
      page++;
    } while (page <= totalPages);

    return this.getNextSequenceCode(prefix, existingCodes);
  }

  private getDatedCodePrefix(type: 'PO' | 'BAT' | 'SHP', date: Date = new Date()): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${type}-${day}${month}${year}-`;
  }

  private getNextSequenceCode(prefix: string, existingCodes: string[]): string {
    const maxSequence = existingCodes.reduce((max, code) => {
      if (!code?.startsWith(prefix)) return max;
      const sequence = Number(code.slice(prefix.length).match(/^\d+/)?.[0]);
      return Number.isInteger(sequence) ? Math.max(max, sequence) : max;
    }, 0);
    return `${prefix}${(maxSequence + 1).toString().padStart(3, '0')}`;
  }

  private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  }
}
