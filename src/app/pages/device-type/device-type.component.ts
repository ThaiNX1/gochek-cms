import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CreateDeviceTypeInput, CreateModelInput, PaginatedDeviceTypeResponse, UpdateDeviceTypeInput, UpdateModelInput } from '../../commons/types';
import { CREATE_DEVICE_TYPE, CREATE_MODEL, DELETE_DEVICE_TYPE, GET_DEVICE_TYPES, REMOVE_MODEL, UPDATE_DEVICE_TYPE, UPDATE_MODEL } from '../../commons/queries/device-type.query';
import { UPLOAD_FILE } from '../../commons/queries/common.query';
import { TableColumnType } from '../../core/constants/enum';
import { PageEvent } from '@angular/material/paginator';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DirectiveModule } from '../../shared/directive.module';
import { takeUntil } from 'rxjs';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { constant } from '../../core/constants/constant';

@Component({
  selector: 'app-device-type',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TableComponent,
    ReactiveFormsModule,
    DirectiveModule,
    NgxEditorModule,
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
  @ViewChild('modelDrawerContent') modelDrawerContent!: TemplateRef<any>;
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
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      price: new FormControl(null, [Validators.min(0)]),
      discountPrice: new FormControl(null, [Validators.min(0)]),
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
    const response = await this.injector.get(ApiService).executeQuery<PaginatedDeviceTypeResponse>(GET_DEVICE_TYPES, {
      pagination: {
        page: page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    });
    this.dataSource = response?.deviceTypes?.data?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        warrantyMonth: item.warrantyMonth || '-',
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.deviceTypes?.pagination?.page ?? 1) - 1,
      size: response?.deviceTypes?.pagination?.size ?? 20,
      total: response?.deviceTypes?.pagination?.total ?? 0,
    };
  }

  onPageChange(event: PageEvent) {
    this.onGetDeviceType(event.pageIndex + 1);
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
      name: model.name,
      code: model.code,
      description: model.description || '',
      price: model.price ?? null,
      discountPrice: model.discountPrice ?? null,
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
