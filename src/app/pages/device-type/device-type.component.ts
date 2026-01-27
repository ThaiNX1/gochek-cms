import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PaginatedDeviceTypeResponse } from '../../commons/types';
import { CREATE_DEVICE_TYPE, CREATE_MODEL, GET_DEVICE_TYPES, UPDATE_DEVICE_TYPE } from '../../commons/queries/device-type.query';
import { TableColumnType } from '../../core/constants/enum';
import { PageEvent } from '@angular/material/paginator';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DirectiveModule } from '../../shared/directive.module';
import { takeUntil } from 'rxjs';

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
  ],
  templateUrl: './device-type.component.html',
  styleUrl: './device-type.component.scss'
})
export class DeviceTypeComponent extends BaseClass {
  deviceTypeForm!: FormGroup;
  modelForm!: FormGroup;
  @ViewChild('deviceTypeDialogContent') deviceTypeDialogContent!: TemplateRef<any>;
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
      warrantyMonth: new FormControl(''),
    });
    this.modelForm = new FormGroup({
      deviceTypeId: new FormControl(''),
      deviceTypeName: new FormControl({ value: '', disabled: true }),
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      isActive: new FormControl(true),
    });
    await this.onGetDeviceType();
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
    console.log(event);
  }

  onAddEditDeviceType(item: any = null) {
    if (item) {
      this.deviceTypeForm.patchValue({
        id: item.id,
        name: item.name,
        code: item.code,
        warrantyMonth: item.warrantyMonth,
      });
    } else {
      this.deviceTypeForm.reset();
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
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xóa loại thiết bị',
        confirmText: 'Xóa',
        message: 'Bạn có chắc chắn muốn xóa loại thiết bị này không?',
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
    const response = this.deviceTypeForm.get('id')?.value
      ? await this.injector.get(ApiService).executeMutation(UPDATE_DEVICE_TYPE, {
        id: this.deviceTypeForm.get('id')?.value,
        input: {
          name: this.deviceTypeForm.get('name')?.value,
          code: this.deviceTypeForm.get('code')?.value,
          warrantyMonth: this.deviceTypeForm.get('warrantyMonth')?.value,
        },
      })
      : await this.injector.get(ApiService).executeMutation(CREATE_DEVICE_TYPE, {
        input: {
          name: this.deviceTypeForm.get('name')?.value,
          code: this.deviceTypeForm.get('code')?.value,
          warrantyMonth: this.deviceTypeForm.get('warrantyMonth')?.value,
        },
      });
    if (response) {
      this.commonService.openSnackBar(this.deviceTypeForm.get('id')?.value ? 'Cập nhật loại thiết bị thành công' : 'Thêm loại thiết bị thành công');
      this.dialog.closeAll();
      await this.onGetDeviceType();
    } else {
      this.commonService.openSnackBarError(this.deviceTypeForm.get('id')?.value ? 'Cập nhật loại thiết bị thất bại' : 'Thêm loại thiết bị thất bại');
    }
  }

  onRemoveDeviceType(item: any) {
    this.dataSource = this.dataSource.filter(d => d.id !== item.id);
    // const response = await this.injector.get(ApiService).executeMutation(DELETE_DEVICE_TYPE, {
  }

  onCancel() {
    this.dialog.closeAll();
  }

  onAddModel(deviceType: any) {
    this.modelForm.reset();
    this.modelForm.patchValue({
      deviceTypeId: deviceType.id,
      deviceTypeName: deviceType.name,
      isActive: true,
    });
    this.dialogData.type = 'model';
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Thêm model',
        type: 'model',
        confirmText: 'Thêm',
        showActions: false,
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.deviceTypeDialogContent;
  }

  async saveModel() {
    this.modelForm.markAllAsTouched();
    if (this.modelForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const response = await this.injector.get(ApiService).executeMutation(CREATE_MODEL, {
      input: {
        deviceTypeId: this.modelForm.get('deviceTypeId')?.value,
        name: this.modelForm.get('name')?.value,
        code: this.modelForm.get('code')?.value,
        description: this.modelForm.get('description')?.value || '',
        isActive: this.modelForm.get('isActive')?.value,
      },
    });
    if (response) {
      this.commonService.openSnackBar('Thêm model thành công');
      await this.onGetDeviceType();
      this.dialog.closeAll();
    } else {
      this.commonService.openSnackBarError('Thêm model thất bại');
    }
  }
}
