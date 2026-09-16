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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseClass } from '../../../commons/base.class';
import { ApiService } from '../../../core/services/api.service';
import { SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';
import {
  CREATE_PURCHASE_ORDER,
  CREATE_PURCHASE_ORDER_SHIPMENT,
  GET_PURCHASE_ORDER,
  GET_PURCHASE_ORDER_NUMBERS,
  GET_MODELS_FOR_SELECT,
  GET_SUPPLIERS_FOR_SELECT,
  UPDATE_PURCHASE_ORDER,
} from '../../../commons/queries/purchase-order.query';
import { GET_ACTIVE_WAREHOUSES } from '../../../commons/queries/warehouse.query';
import { DirectiveModule } from '../../../shared/directive.module';

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
  note: string;
  status?: string;
  itemId?: string;
  productIndex: number;
}

interface ShipmentRow {
  shipmentCode: string;
  quantity: number;
  expectedShipDate: string;
  expectedArrivalDate: string;
  carrier: string;
  trackingNumber: string;
  status: string;
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
    RouterModule,
    SelectSearchComponent,
    DirectiveModule,
  ],
  templateUrl: './purchase-order-create.component.html',
  styleUrl: './purchase-order-create.component.scss'
})
export class PurchaseOrderCreateComponent extends BaseClass implements OnInit {
  @ViewChild('batchDrawerContent') batchDrawerContent!: TemplateRef<any>;
  @ViewChild('shipmentDrawerContent') shipmentDrawerContent!: TemplateRef<any>;

  poForm!: FormGroup;
  batchForm!: FormGroup;
  shipmentForm!: FormGroup;
  orderDateMax: Date | null = null;
  requestedDeliveryDateMin: Date | null = null;
  batches: BatchRow[] = [];
  shipments: ShipmentRow[] = [];
  editingBatchIndex: number | null = null;
  editingShipmentIndex: number | null = null;

  supplierOptions: any[] = [];
  modelOptions: any[] = [];
  warehouseList: any[] = [];

  shipmentStatusOptions = [
    { value: 'PENDING', label: 'Chờ vận chuyển' },
    { value: 'IN_TRANSIT', label: 'Đang vận chuyển' },
    { value: 'ARRIVED', label: 'Đã đến kho' },
    { value: 'DELIVERED', label: 'Đã nhận hàng' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  isEditMode = false;
  poId: string | null = null;
  poData: any = null;

  get canEditPurchaseOrder(): boolean {
    return !this.isEditMode || this.poData?.status === 'DRAFT';
  }

  get showProductionProgress(): boolean {
    return this.isEditMode && !!this.poData?.status && this.poData.status !== 'DRAFT';
  }

  readonly batchSteps: { key: string; label: string }[] = [
    { key: 'DRAFT', label: 'Nháp' },
    { key: 'CREATED', label: 'Đã tạo' },
    { key: 'IN_PRODUCTION', label: 'Sản xuất' },
    { key: 'IN_TRANSIT', label: 'Vận chuyển' },
    { key: 'RECEIVED', label: 'Đã nhận' },
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
    await Promise.all([this.loadSuppliers(), this.loadWarehouses(), this.loadModels()]);

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
      note: new FormControl(''),
    });
    this.shipmentForm = new FormGroup({
      shipmentCode: new FormControl('', [Validators.required]),
      batchIndexes: new FormControl<number[]>([], [Validators.required, Validators.minLength(1)]),
      status: new FormControl('PENDING', [Validators.required]),
      receivingWarehouseId: new FormControl('', [Validators.required]),
      carrier: new FormControl(''),
      trackingNumber: new FormControl(''),
      expectedShipDate: new FormControl<Date | string | null>(null),
      expectedArrivalDate: new FormControl<Date | string | null>(null),
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
      note: batch.note || '',
      status: batch.status || 'DRAFT',
      itemId: batch.itemId,
      productIndex: batch.productIndex,
    }));

    // Load shipments - map single batchId to batchIndexes
    const batchIdToIndex = new Map<string, number>();
    this.batches.forEach((batch, index) => {
      if (batch.id) batchIdToIndex.set(batch.id, index);
    });
    // Group shipments by shipmentCode so multi-batch shipments consolidate
    const groupedShipments = new Map<string, ShipmentRow>();
    (po.shipments || []).forEach((ship: any) => {
      const key = ship.shipmentCode;
      const existing = groupedShipments.get(key);
      const batchIndex = ship.batchId ? batchIdToIndex.get(ship.batchId) : undefined;
      if (existing) {
        if (batchIndex !== undefined && !existing.batchIndexes.includes(batchIndex)) {
          existing.batchIndexes.push(batchIndex);
        }
      } else {
        groupedShipments.set(key, {
          shipmentCode: ship.shipmentCode,
          quantity: ship.quantity,
          expectedShipDate: ship.expectedShipDate || '',
          expectedArrivalDate: ship.expectedArrivalDate || '',
          carrier: ship.carrier || '',
          trackingNumber: ship.trackingNumber || '',
          status: ship.status || 'PENDING',
          receivingWarehouseId: '',
          receivingWarehouseName: '',
          batchIndexes: batchIndex !== undefined ? [batchIndex] : [],
        });
      }
    });
    this.shipments = Array.from(groupedShipments.values());
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

  private getBatchStepIndex(status?: string): number {
    const normalizedStatus = status === 'CREATE' ? 'CREATED' : status;
    return this.batchSteps.findIndex(step => step.key === normalizedStatus);
  }

  getBatchStepState(batchStatus: string | undefined, stepIndex: number): 'completed' | 'current' | 'pending' {
    if (batchStatus === 'CANCELLED') return 'pending';
    const currentIndex = this.getBatchStepIndex(batchStatus);
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  }

  getBatchStepCircleClass(batchStatus: string | undefined, stepIndex: number): string {
    return this.getBatchStepState(batchStatus, stepIndex) === 'pending'
      ? 'bg-gray-300 border-gray-300'
      : 'bg-green-500 border-green-500';
  }

  getBatchStepLineClass(batchStatus: string | undefined, stepIndex: number): string {
    if (batchStatus === 'CANCELLED') return 'bg-gray-200';
    return stepIndex < this.getBatchStepIndex(batchStatus) ? 'bg-green-500' : 'bg-gray-200';
  }

  getBatchStepLabelClass(batchStatus: string | undefined, stepIndex: number): string {
    return this.getBatchStepState(batchStatus, stepIndex) === 'pending'
      ? 'text-gray-500'
      : 'text-green-700 font-semibold';
  }

  isBatchCancelled(status?: string): boolean {
    return status === 'CANCELLED';
  }

  cancelBatchDrawer() {
    this.commonService.closeRightSlideNav();
  }

  private onBatchDrawerClosed() {
    this.editingBatchIndex = null;
    this.batchForm.reset();
  }

  // ============ Shipments ============
  addShipment() {
    if (this.batches.length === 0) {
      this.commonService.openSnackBarError('Vui lòng thêm batch/lot trước khi tạo shipment');
      return;
    }

    this.editingShipmentIndex = null;
    this.shipmentForm.reset({
      shipmentCode: '',
      batchIndexes: [],
      status: 'PENDING',
      receivingWarehouseId: '',
      carrier: '',
      trackingNumber: '',
      expectedShipDate: null,
      expectedArrivalDate: null,
    });
    this.openShipmentDrawer('Thêm shipment');
  }

  editShipment(index: number) {
    const shipment = this.shipments[index];
    this.editingShipmentIndex = index;
    this.shipmentForm.reset({
      shipmentCode: shipment.shipmentCode,
      batchIndexes: [...shipment.batchIndexes],
      status: shipment.status || 'PENDING',
      receivingWarehouseId: shipment.receivingWarehouseId || '',
      carrier: shipment.carrier || '',
      trackingNumber: shipment.trackingNumber || '',
      expectedShipDate: shipment.expectedShipDate ? new Date(shipment.expectedShipDate) : null,
      expectedArrivalDate: shipment.expectedArrivalDate ? new Date(shipment.expectedArrivalDate) : null,
    });
    this.openShipmentDrawer('Cập nhật shipment');
  }

  private openShipmentDrawer(title: string) {
    this.commonService.openRightSlideNav({
      title,
      content: this.shipmentDrawerContent,
      width: '720px',
      onClose: () => this.onShipmentDrawerClosed(),
    });
  }

  saveShipment() {
    this.shipmentForm.markAllAsTouched();
    if (this.shipmentForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin shipment bắt buộc');
      return;
    }

    const value = this.shipmentForm.getRawValue();
    const batchIndexes = (value.batchIndexes || []) as number[];
    if (!batchIndexes.length) {
      this.commonService.openSnackBarError('Vui lòng chọn ít nhất 1 batch/lot');
      return;
    }

    const shipmentCode = value.shipmentCode.trim();
    const duplicated = this.shipments.some((ship, index) =>
      index !== this.editingShipmentIndex && ship.shipmentCode.trim().toLowerCase() === shipmentCode.toLowerCase()
    );
    if (duplicated) {
      this.commonService.openSnackBarError('Mã shipment đã tồn tại trong danh sách');
      return;
    }

    // Auto-calc quantity from selected batches
    const quantity = batchIndexes.reduce((sum, idx) => sum + (this.batches[idx]?.orderedQuantity || 0), 0);
    const warehouse = this.warehouseList.find(w => w.id === value.receivingWarehouseId);

    const shipment: ShipmentRow = {
      shipmentCode,
      batchIndexes,
      quantity,
      status: value.status,
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

    if (this.editingShipmentIndex === null) {
      this.shipments.push(shipment);
    } else {
      this.shipments[this.editingShipmentIndex] = shipment;
    }
    this.commonService.closeRightSlideNav();
  }

  removeShipment(index: number) {
    this.shipments.splice(index, 1);
  }

  cancelShipmentDrawer() {
    this.commonService.closeRightSlideNav();
  }

  private onShipmentDrawerClosed() {
    this.editingShipmentIndex = null;
    this.shipmentForm.reset();
  }

  getShipmentBatchLabels(shipment: ShipmentRow): string {
    if (!shipment.batchIndexes?.length) return '-';
    return shipment.batchIndexes
      .map(idx => this.batches[idx]?.batchCode)
      .filter(Boolean)
      .join(', ');
  }

  getShipmentStatusLabel(status: string): string {
    return this.shipmentStatusOptions.find(opt => opt.value === status)?.label || status || '-';
  }

  getShipmentStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
      case 'ARRIVED': return 'bg-cyan-100 text-cyan-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        this.commonService.openSnackBarError(`Shipment dòng ${i + 1}: chưa nhập mã shipment`);
        return;
      }
      if (!this.shipments[i].batchIndexes?.length) {
        this.commonService.openSnackBarError(`Shipment dòng ${i + 1}: chưa chọn batch/lot`);
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
            note: shipmentNote,
          };

          await this.injector.get(ApiService).executeMutation(
            CREATE_PURCHASE_ORDER_SHIPMENT,
            { input: shipmentInput }
          );
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
    const prefix = this.getDatedCodePrefix('BAT');
    return this.getNextSequenceCode(prefix, this.batches.map(batch => batch.batchCode));
  }

  private getDatedCodePrefix(type: 'PO' | 'BAT', date: Date = new Date()): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${type}-${day}${month}${year}-`;
  }

  private getNextSequenceCode(prefix: string, existingCodes: string[]): string {
    const maxSequence = existingCodes.reduce((max, code) => {
      if (!code?.startsWith(prefix)) return max;
      const sequence = Number(code.slice(prefix.length));
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
