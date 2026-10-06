import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CreateDeviceTypeInput, CreateModelInput, NhanhProductMapping, PaginatedDeviceTypeResponse, PartnerCredential, SyncReport, UpdateDeviceTypeInput, UpdateModelInput, UpsertNhanhProductMappingInput } from '../../commons/types';
import { CREATE_DEVICE_TYPE, CREATE_MODEL, DELETE_DEVICE_TYPE, GET_DEVICE_TYPES, GET_NHANH_PRODUCTS, GET_NHANH_PRODUCT_MAPPINGS, REMOVE_MODEL, SYNC_NHANH_PRODUCTS, UPDATE_DEVICE_TYPE, UPDATE_MODEL, UPSERT_NHANH_PRODUCT_MAPPING } from '../../commons/queries/device-type.query';
import { UPLOAD_FILE } from '../../commons/queries/common.query';
import { GET_NHANH_CREDENTIALS } from '../../commons/queries/partner-credential.query';
import { TableColumnType } from '../../core/constants/enum';
import { PageEvent } from '@angular/material/paginator';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DirectiveModule } from '../../shared/directive.module';
import { takeUntil } from 'rxjs';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { constant } from '../../core/constants/constant';
import { AutocompleteSearchComponent } from '../../shared/components/autocomplete-search/autocomplete-search.component';

@Component({
  selector: 'app-device-type',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatAutocompleteModule,
    TableComponent,
    ReactiveFormsModule,
    DirectiveModule,
    NgxEditorModule,
    AutocompleteSearchComponent,
  ],
  templateUrl: './device-type.component.html',
  styleUrl: './device-type.component.scss'
})
export class DeviceTypeComponent extends BaseClass {
  deviceTypeForm!: FormGroup;
  modelForm!: FormGroup;
  deviceTypeImagePreview: string | null = null;
  modelImagePreview: string | null = null;
  readonly modelDescriptionEditor = new Editor();
  readonly modelDescriptionToolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4'] }],
    ['ordered_list', 'bullet_list'],
    ['blockquote', 'link'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  @ViewChild('deviceTypeDialogContent') deviceTypeDialogContent!: TemplateRef<any>;
  @ViewChild('syncNhanhProductsDialogContent') syncNhanhProductsDialogContent!: TemplateRef<any>;
  @ViewChild('nhanhProductMappingDialogContent') nhanhProductMappingDialogContent!: TemplateRef<any>;
  @ViewChild('modelDrawerContent') modelDrawerContent!: TemplateRef<any>;

  nhanhCredentials: PartnerCredential[] = [];
  isSyncingNhanhProducts = false;
  syncNhanhProductsForm = new FormGroup({
    partnerCredentialId: new FormControl('', [Validators.required]),
  });
  selectedMappingModel: { id: string; name: string; code: string } | null = null;
  nhanhProductMappings: NhanhProductMapping[] = [];
  // Map modelId → NhanhProductMapping[] dùng để hiển thị badge trong expanded row
  nhanhMappingByModelId = new Map<string, NhanhProductMapping[]>();
  nhanhProductOptions: NhanhProductOption[] = [];
  isLoadingNhanhMapping = false;
  isLoadingNhanhProducts = false;
  isSavingNhanhMapping = false;
  nhanhProductMappingForm = new FormGroup({
    partnerCredentialId: new FormControl('', [Validators.required]),
    nhanhProductId: new FormControl('', [Validators.required]),
  });
  dialogData: DialogData = {
    title: 'Thêm loại thiết bị',
    showActions: true,
    showCloseButton: true,
    width: '500px',
    align: 'center',
    type: 'default',
    confirmText: 'Lưu',
    cancelText: 'Hủy',
  }

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER, },
      { name: 'Tên loại thiết bị', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Hình ảnh', field: 'imageUrlCallback', className: 'min-w-[100px] max-w-[100px]', templateCode: 'deviceTypeImageColumnTemplate' },
      { name: 'Mã loại thiết bị', field: 'code', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Thời gian bảo hành (tháng)', field: 'warrantyMonth', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ]
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    this.deviceTypeForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      shortDescription: new FormControl(''),
      warrantyMonth: new FormControl(''),
      imageUrl: new FormControl(''),
      imageFile: new FormControl<File | null>(null),
    });
    this.modelForm = new FormGroup({
      id: new FormControl(''),
      deviceTypeId: new FormControl(''),
      deviceTypeName: new FormControl({ value: '', disabled: true }),
      deviceTypeWarrantyMonth: new FormControl<number | null>(null),
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      price: new FormControl(null, [Validators.min(0)]),
      discountPrice: new FormControl(null, [Validators.min(0)]),
      warrantyMonth: new FormControl<number | null>(null, [Validators.min(0)]),
      componentCount: new FormControl<number | null>(null, [Validators.min(0)]),
      attributes: new FormControl('', [jsonValidator]),
      imageUrl: new FormControl(''),
      imageFile: new FormControl<File | null>(null),
      isActive: new FormControl(true),
    });
    await this.onGetDeviceType();
  }

  override ngOnDestroy(): void {
    this.modelDescriptionEditor.destroy();
    super.ngOnDestroy();
  }

  async onGetDeviceType(page: number = 1) {
    const [deviceTypeResponse, mappingResponse] = await Promise.all([
      this.injector.get(ApiService).executeQuery<PaginatedDeviceTypeResponse>(GET_DEVICE_TYPES, {
        pagination: {
          page: page,
          size: 20,
          keyword: this.filterForm.value.keyword ?? '',
        },
      }),
      this.injector.get(ApiService).executeQuery<any>(GET_NHANH_PRODUCT_MAPPINGS, {}),
    ]);

    // Build map modelId → mappings
    const allMappings: NhanhProductMapping[] = mappingResponse?.nhanhProductMappings ?? [];
    this.nhanhMappingByModelId = new Map<string, NhanhProductMapping[]>();
    for (const mapping of allMappings) {
      if (!mapping.isActive) continue;
      const list = this.nhanhMappingByModelId.get(mapping.modelId) ?? [];
      list.push(mapping);
      this.nhanhMappingByModelId.set(mapping.modelId, list);
    }

    this.dataSource = deviceTypeResponse?.deviceTypes?.data?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        warrantyMonth: item.warrantyMonth || '-',
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (deviceTypeResponse?.deviceTypes?.pagination?.page ?? 1) - 1,
      size: deviceTypeResponse?.deviceTypes?.pagination?.size ?? 20,
      total: deviceTypeResponse?.deviceTypes?.pagination?.total ?? 0,
    };
  }

  getNhanhMappingsForModel(modelId: string): NhanhProductMapping[] {
    return this.nhanhMappingByModelId.get(modelId) ?? [];
  }

  private async reloadNhanhMappings(): Promise<void> {
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_NHANH_PRODUCT_MAPPINGS, {});
    const allMappings: NhanhProductMapping[] = response?.nhanhProductMappings ?? [];
    this.nhanhMappingByModelId = new Map<string, NhanhProductMapping[]>();
    for (const mapping of allMappings) {
      if (!mapping.isActive) continue;
      const list = this.nhanhMappingByModelId.get(mapping.modelId) ?? [];
      list.push(mapping);
      this.nhanhMappingByModelId.set(mapping.modelId, list);
    }
  }

  onPageChange(event: PageEvent) {
    this.onGetDeviceType(event.pageIndex + 1);
  }

  async onOpenSyncNhanhProductsDialog(): Promise<void> {
    this.syncNhanhProductsForm.reset();
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_NHANH_CREDENTIALS);
    this.nhanhCredentials = (response?.nhanhCredentials ?? [])
      .slice()
      .sort((first: PartnerCredential, second: PartnerCredential) =>
        first.environment.localeCompare(second.environment)
        || (first.businessId ?? '').localeCompare(second.businessId ?? '')
        || (first.appId ?? '').localeCompare(second.appId ?? ''));

    const defaultCredential = this.nhanhCredentials.find((credential) => credential.isActive);
    if (defaultCredential) {
      this.syncNhanhProductsForm.patchValue({ partnerCredentialId: defaultCredential.id });
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      data: {
        title: 'Đồng bộ sản phẩm Nhanh.vn',
        showActions: false,
        showCloseButton: false,
      },
      width: '520px',
    });
    dialogRef.componentInstance.content = this.syncNhanhProductsDialogContent;
  }

  async onSyncNhanhProducts(): Promise<void> {
    this.syncNhanhProductsForm.markAllAsTouched();
    if (this.syncNhanhProductsForm.invalid || this.isSyncingNhanhProducts) {
      this.commonService.openSnackBarError('Vui lòng chọn tài khoản Nhanh.vn');
      return;
    }

    this.isSyncingNhanhProducts = true;
    const response = await this.injector.get(ApiService).executeMutation<any>(SYNC_NHANH_PRODUCTS, {
      input: {
        partnerCredentialId: this.syncNhanhProductsForm.value.partnerCredentialId,
      },
    });
    this.isSyncingNhanhProducts = false;

    const report = response?.syncNhanhProducts as SyncReport | undefined;
    if (!report) {
      this.commonService.openSnackBarError('Đồng bộ sản phẩm Nhanh.vn thất bại');
      return;
    }

    this.dialog.closeAll();
    await this.onGetDeviceType();

    const summary = `${report.createdModels} model mới, ${report.createdDeviceTypes} loại thiết bị mới, ${report.updatedDeviceTypes} loại thiết bị cập nhật`;
    if (report.partial || report.failed > 0) {
      this.commonService.openSnackBarError(`Đồng bộ một phần: ${summary}, ${report.failed} lỗi`);
      return;
    }

    this.commonService.openSnackBar(`Đồng bộ thành công: ${summary}`);
  }

  onCancelSyncNhanhProducts(): void {
    if (!this.isSyncingNhanhProducts) {
      this.dialog.closeAll();
    }
  }

  async onOpenNhanhProductMapping(model: { id: string; name: string; code: string }): Promise<void> {
    this.selectedMappingModel = model;
    this.nhanhCredentials = [];
    this.nhanhProductMappings = [];
    this.nhanhProductOptions = [];
    this.nhanhProductMappingForm.reset();

    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      data: {
        title: 'Liên kết sản phẩm Nhanh.vn',
        showActions: false,
        showCloseButton: false,
      },
      width: '620px',
    });
    dialogRef.componentInstance.content = this.nhanhProductMappingDialogContent;

    this.isLoadingNhanhMapping = true;
    const [credentialResponse, mappingResponse] = await Promise.all([
      this.injector.get(ApiService).executeQuery(GET_NHANH_CREDENTIALS),
      this.injector.get(ApiService).executeQuery(GET_NHANH_PRODUCT_MAPPINGS, {
        input: { modelId: model.id },
      }),
    ]);
    this.nhanhCredentials = (credentialResponse?.nhanhCredentials ?? [])
      .slice()
      .sort((first: PartnerCredential, second: PartnerCredential) =>
        first.environment.localeCompare(second.environment)
        || (first.businessId ?? '').localeCompare(second.businessId ?? '')
        || (first.appId ?? '').localeCompare(second.appId ?? ''));
    this.nhanhProductMappings = mappingResponse?.nhanhProductMappings ?? [];

    const defaultCredential = this.nhanhCredentials.find((credential) =>
      credential.isActive
      && this.nhanhProductMappings.some((mapping) => mapping.partnerCredentialId === credential.id))
      ?? this.nhanhCredentials.find((credential) => credential.isActive);

    if (defaultCredential) {
      this.nhanhProductMappingForm.patchValue({ partnerCredentialId: defaultCredential.id });
      await this.onNhanhMappingCredentialChange(defaultCredential.id);
    }
    this.isLoadingNhanhMapping = false;
  }

  async onNhanhMappingCredentialChange(partnerCredentialId: string): Promise<void> {
    this.nhanhProductOptions = [];
    this.nhanhProductMappingForm.patchValue({ nhanhProductId: '' });
    if (!partnerCredentialId) return;

    this.isLoadingNhanhProducts = true;
    const response = await this.injector.get(ApiService).executeQuery(GET_NHANH_PRODUCTS, {
      input: { partnerCredentialId },
    });
    this.nhanhProductOptions = this.normalizeNhanhProducts(response?.nhanhProducts);
    this.isLoadingNhanhProducts = false;

    const currentMapping = this.getCurrentNhanhProductMapping(partnerCredentialId);
    if (currentMapping && this.nhanhProductOptions.some(p => p.id === currentMapping.nhanhProductId)) {
      this.nhanhProductMappingForm.patchValue({ nhanhProductId: currentMapping.nhanhProductId });
    }
  }

  async saveNhanhProductMapping(): Promise<void> {
    this.nhanhProductMappingForm.markAllAsTouched();
    if (this.nhanhProductMappingForm.invalid || !this.selectedMappingModel || this.isSavingNhanhMapping) {
      this.commonService.openSnackBarError('Vui lòng chọn đầy đủ tài khoản và sản phẩm Nhanh.vn');
      return;
    }

    const formValue = this.nhanhProductMappingForm.getRawValue();
    const selectedProduct = this.nhanhProductOptions.find((product) => product.id === formValue.nhanhProductId);
    if (!selectedProduct || !formValue.partnerCredentialId) {
      this.commonService.openSnackBarError('Sản phẩm Nhanh.vn đã chọn không hợp lệ');
      return;
    }

    const currentMapping = this.getCurrentNhanhProductMapping(formValue.partnerCredentialId);
    const input: UpsertNhanhProductMappingInput = {
      id: currentMapping?.id,
      modelId: this.selectedMappingModel.id,
      partnerCredentialId: formValue.partnerCredentialId,
      nhanhProductId: selectedProduct.id,
      productCode: selectedProduct.code || undefined,
      productName: selectedProduct.name || undefined,
      isActive: true,
    };

    this.isSavingNhanhMapping = true;
    const response = await this.injector.get(ApiService).executeMutation(UPSERT_NHANH_PRODUCT_MAPPING, { input });
    this.isSavingNhanhMapping = false;
    if (!response?.upsertNhanhProductMapping) {
      this.commonService.openSnackBarError('Liên kết sản phẩm Nhanh.vn thất bại');
      return;
    }

    this.commonService.openSnackBar('Liên kết sản phẩm Nhanh.vn thành công');
    this.dialog.closeAll();
    this.resetNhanhProductMapping();
    // Reload mappings để cập nhật badge trong expanded row
    await this.reloadNhanhMappings();
  }

  onCancelNhanhProductMapping(): void {
    if (this.isSavingNhanhMapping) return;
    this.dialog.closeAll();
    this.resetNhanhProductMapping();
  }

  get currentNhanhProductMapping(): NhanhProductMapping | undefined {
    return this.getCurrentNhanhProductMapping(this.nhanhProductMappingForm.value.partnerCredentialId ?? '');
  }

  private getCurrentNhanhProductMapping(partnerCredentialId: string): NhanhProductMapping | undefined {
    return this.nhanhProductMappings.find((mapping) => mapping.partnerCredentialId === partnerCredentialId);
  }

  private normalizeNhanhProducts(value: unknown): NhanhProductOption[] {
    if (!Array.isArray(value)) return [];

    return value.reduce<NhanhProductOption[]>((products, item) => {
      if (!item || typeof item !== 'object') return products;
      const product = item as Record<string, unknown>;
      const id = this.readNhanhProductValue(product, ['id', 'productId']);
      if (!id) return products;
      products.push({
        id,
        code: this.readNhanhProductValue(product, ['code', 'productCode', 'sku']),
        name: this.readNhanhProductValue(product, ['name', 'productName']),
      });
      return products;
    }, []).sort((first, second) =>
      first.code.localeCompare(second.code) || first.name.localeCompare(second.name));
  }

  private readNhanhProductValue(product: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = product[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (typeof value === 'number') return String(value);
    }
    return '';
  }

  private resetNhanhProductMapping(): void {
    this.selectedMappingModel = null;
    this.nhanhProductMappings = [];
    this.nhanhProductOptions = [];
    this.nhanhProductMappingForm.reset();
  }

  onAddEditDeviceType(item: any = null) {
    if (item) {
      this.deviceTypeForm.patchValue({
        id: item.id,
        name: item.name,
        code: item.code,
        shortDescription: item.shortDescription,
        warrantyMonth: item.warrantyMonth,
        imageUrl: item.imageUrl || '',
        imageFile: null,
      });
      this.deviceTypeImagePreview = item.imageUrlCallback || null;
    } else {
      this.deviceTypeForm.reset({
        id: '',
        imageUrl: '',
        imageFile: null,
      });
      this.deviceTypeImagePreview = null;
    }
    this.dialogData.type = 'default';
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: item ? 'Sửa loại thiết bị' : 'Thêm loại thiết bị',
        type: 'default',
        confirmText: item ? 'Cập nhật' : 'Thêm',
        showActions: false,
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.deviceTypeDialogContent;
  }

  onDeleteDeviceType(item: any) {
    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn xóa loại thiết bị ${item.name} không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xóa loại thiết bị',
        confirmText: 'Xóa',
        showActions: true,
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.deviceTypeDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(result => {
      if (result) {
        this.onRemoveDeviceType(item);
      }
    });
  }

  async saveNewDeviceType() {
    this.deviceTypeForm.markAllAsTouched();
    if (this.deviceTypeForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!(await this.uploadImage(this.deviceTypeForm, constant.fileFolder.deviceTypeImages))) return;
    const formValue = this.deviceTypeForm.getRawValue();
    const input: CreateDeviceTypeInput | UpdateDeviceTypeInput = {
      name: formValue.name,
      code: formValue.code,
      shortDescription: formValue.shortDescription || '',
      warrantyMonth: Number(formValue.warrantyMonth || 0),
      imageUrl: formValue.imageUrl || '',
    };
    const isEditing = Boolean(formValue.id);
    const response = isEditing
      ? await this.injector.get(ApiService).executeMutation(UPDATE_DEVICE_TYPE, {
        id: formValue.id,
        input,
      })
      : await this.injector.get(ApiService).executeMutation(CREATE_DEVICE_TYPE, { input });
    if (response) {
      this.commonService.openSnackBar(isEditing ? 'Cập nhật loại thiết bị thành công' : 'Thêm loại thiết bị thành công');
      this.dialog.closeAll();
      await this.onGetDeviceType();
    } else {
      this.commonService.openSnackBarError(isEditing ? 'Cập nhật loại thiết bị thất bại' : 'Thêm loại thiết bị thất bại');
    }
  }

  async onRemoveDeviceType(item: any) {
    const response = await this.injector.get(ApiService).executeMutation(DELETE_DEVICE_TYPE, {
      id: item.id,
    });
    if (response) {
      this.commonService.openSnackBar('Xóa loại thiết bị thành công');
      this.dialog.closeAll();
      await this.onGetDeviceType();
    } else {
      this.commonService.openSnackBarError('Xóa loại thiết bị thất bại');
    }
  }

  onCancel() {
    this.dialog.closeAll();
  }

  onAddModel(deviceType: any) {
    this.modelForm.reset({
      id: '',
      deviceTypeId: deviceType.id,
      deviceTypeName: deviceType.name,
      deviceTypeWarrantyMonth: deviceType.warrantyMonth ?? null,
      warrantyMonth: deviceType.warrantyMonth || null,
      componentCount: null,
      imageUrl: '',
      imageFile: null,
      isActive: true,
    });
    this.modelImagePreview = null;
    this.openModelDrawer('Thêm model');
  }

  onEditModel(deviceType: any, model: any) {
    this.modelForm.reset({
      id: model.id,
      deviceTypeId: deviceType.id,
      deviceTypeName: deviceType.name,
      deviceTypeWarrantyMonth: deviceType.warrantyMonth ?? null,
      name: model.name,
      code: model.code,
      description: model.description || '',
      price: model.price ?? null,
      discountPrice: model.discountPrice ?? null,
      warrantyMonth: model.warrantyMonth || deviceType.warrantyMonth || null,
      componentCount: model.componentCount ?? null,
      attributes: model.attributes ? JSON.stringify(model.attributes, null, 2) : '',
      imageUrl: model.imageUrl || '',
      imageFile: null,
      isActive: model.isActive,
    });
    this.modelImagePreview = model.imageUrlCallback || null;
    this.openModelDrawer('Sửa model');
  }

  private openModelDrawer(title: string) {
    this.commonService.openRightSlideNav({
      title,
      content: this.modelDrawerContent,
      width: '740px',
      onClose: () => this.modelForm.reset(),
    });
  }

  async saveModel() {
    this.modelForm.markAllAsTouched();
    if (this.modelForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!(await this.uploadImage(this.modelForm, constant.fileFolder.modelImages))) return;
    const formValue = this.modelForm.getRawValue();
    const input: CreateModelInput | UpdateModelInput = {
      deviceTypeId: formValue.deviceTypeId,
      name: formValue.name,
      code: formValue.code,
      description: formValue.description || '',
      price: this.toOptionalNumber(formValue.price),
      discountPrice: this.toOptionalNumber(formValue.discountPrice),
      warrantyMonth: this.toOptionalNumber(formValue.warrantyMonth || formValue.deviceTypeWarrantyMonth),
      componentCount: this.toOptionalNumber(formValue.componentCount),
      attributes: formValue.attributes ? JSON.parse(formValue.attributes) : undefined,
      imageUrl: formValue.imageUrl || '',
      isActive: formValue.isActive,
    };
    const isEditing = Boolean(formValue.id);
    const response = isEditing
      ? await this.injector.get(ApiService).executeMutation(UPDATE_MODEL, {
        id: formValue.id,
        input,
      })
      : await this.injector.get(ApiService).executeMutation(CREATE_MODEL, { input });
    if (response) {
      this.commonService.openSnackBar(isEditing ? 'Cập nhật model thành công' : 'Thêm model thành công');
      await this.onGetDeviceType();
      this.commonService.closeRightSlideNav();
    } else {
      this.commonService.openSnackBarError(isEditing ? 'Cập nhật model thất bại' : 'Thêm model thất bại');
    }
  }

  onCancelModel() {
    this.commonService.closeRightSlideNav();
  }

  onDeviceTypeImageChange(event: Event) {
    this.handleImageChange(event, this.deviceTypeForm, (preview) => {
      this.deviceTypeImagePreview = preview;
    });
  }

  onModelImageChange(event: Event) {
    this.handleImageChange(event, this.modelForm, (preview) => {
      this.modelImagePreview = preview;
    });
  }

  removeDeviceTypeImage() {
    this.deviceTypeImagePreview = null;
    this.deviceTypeForm.patchValue({ imageUrl: '', imageFile: null });
  }

  removeModelImage() {
    this.modelImagePreview = null;
    this.modelForm.patchValue({ imageUrl: '', imageFile: null });
  }

  private handleImageChange(event: Event, form: FormGroup, setPreview: (preview: string) => void) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.commonService.openSnackBarError('Vui lòng chọn file ảnh');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.commonService.openSnackBarError('Kích thước ảnh không được vượt quá 5MB');
      input.value = '';
      return;
    }
    form.get('imageFile')?.setValue(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private async uploadImage(form: FormGroup, folder: string): Promise<boolean> {
    const file = form.get('imageFile')?.value as File | null;
    if (!file) return true;
    try {
      const response = await this.injector.get(ApiService).executeMutation(UPLOAD_FILE, {
        file,
        folder,
      });
      if (response?.uploadFile) {
        form.get('imageUrl')?.setValue(response.uploadFile.basePath);
        return true;
      }
      this.commonService.openSnackBarError('Lỗi khi upload ảnh lên S3');
      return false;
    } catch {
      this.commonService.openSnackBarError('Lỗi khi upload ảnh lên S3');
      return false;
    }
  }

  private toOptionalNumber(value: unknown): number | undefined {
    return value === null || value === undefined || value === '' ? undefined : Number(value);
  }

  onDeleteModel(item: any, model: any) {
    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn xóa model "${model.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xóa model',
        confirmText: 'Xóa',
        showActions: true,
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.deviceTypeDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(REMOVE_MODEL, {
          id: model.id,
        })
        if (response) {
          this.commonService.openSnackBar('Xóa model thành công');
          const deviceType = this.dataSource.find((d: any) => d.id === item.id);
          if (deviceType) {
            deviceType.models = deviceType.models.filter((m: any) => m.id !== model.id);
          }
          this.dialog.closeAll();
        } else {
          this.commonService.openSnackBarError('Xóa model thất bại');
        }
      }
    });
  }
}

function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    JSON.parse(control.value);
    return null;
  } catch {
    return { invalidJson: true };
  }
}

interface NhanhProductOption {
  id: string;
  code: string;
  name: string;
}
