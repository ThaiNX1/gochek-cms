import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { BaseClass } from '../../commons/base.class';
import { GET_DEVICE_TYPES, GET_MODELS } from '../../commons/queries/device-type.query';
import { ASSIGN_DEVICE_TO_ORGANIZATION, GET_DEVICES, IMPORT_DEVICE, REMOVE_DEVICE_FROM_ORGANIZATION, SUBSCRIBE_IMPORT_DEVICE_PROGRESS, UPDATE_DEVICE } from '../../commons/queries/device.query';
import { GET_ORGANIZATIONS } from '../../commons/queries/organization.query';
import { Device, DeviceStateEnum, PaginatedDeviceResponse, PaginatedDeviceTypeResponse, PaginatedOrganizationResponse } from '../../commons/types';
import { constant } from '../../core/constants/constant';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { DialogNotificationComponent } from '../../shared/components/dialog-notification/dialog-notification.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { SelectSearchComponent } from "../../shared/components/select-search/select-search.component";
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { format } from 'date-fns';
@Component({
  selector: 'app-device',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
    ReactiveFormsModule,
    SelectSearchComponent,
    MatMenuModule
  ],
  templateUrl: './device.component.html',
  styleUrl: './device.component.scss'
})
export class DeviceComponent extends BaseClass {
  statusList: any[] = constant.deviceStatusList;
  organizationList: any[] = [];
  deviceTypeList: any[] = [];
  deviceTypeEditList: any[] = [];
  modelEditList: any[] = [];
  orgSearchQuery = GET_ORGANIZATIONS;
  deviceTypeSearchQuery = GET_DEVICE_TYPES;
  modelSearchQuery = GET_MODELS;
  importDeviceForm!: FormGroup;
  DeviceStateEnum = DeviceStateEnum

  @ViewChild('assignOrganizationDialogContent') assignOrganizationDialogContent!: TemplateRef<any>;
  assignOrganizationForm!: FormGroup;

  @ViewChild('editDeviceDialogContent') editDeviceDialogContent!: TemplateRef<any>;
  editDeviceForm!: FormGroup;

  @ViewChild('removeDeviceFromOrganizationDialogNotification') removeDeviceFromOrganizationDialogNotification!: TemplateRef<any>;
  removeDeviceFromOrganizationSelected: any = null;

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER, },
      { name: 'Tên thiết bị', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Loại thiết bị', field: 'deviceTypeName', className: 'min-w-[200px] max-w-[200px]' },
      // { name: 'Mã loại thiết bị', field: 'deviceTypeCode', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Model', field: 'modelCode', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Serial number', field: 'serialNumber', className: 'min-w-[100px] max-w-[100px]' },
      { name: 'Firmware version', field: 'firmwareVersion', className: 'min-w-[200px] max-w-[250px]', tdClassName: '!justify-start', templateCode: 'firmwareVersionColumnTemplate' },
      { name: 'Ota Message', field: 'otaMessage', className: 'min-w-[200px] max-w-[250px]', tdClassName: '!justify-start', templateCode: 'otaMessageColumnTemplate' },
      { name: 'Ngày kích hoạt', field: 'activeAt', className: 'min-w-[100px] max-w-[100px]', type: TableColumnType.DATE },
      { name: 'Ngày hết hạn', field: 'expiredAt', className: 'min-w-[100px] max-w-[100px]', type: TableColumnType.DATE },
      { name: 'Tình trạng', field: 'stateName', className: 'min-w-[150px] max-w-[150px]', templateCode: 'stateColumnTemplate' },
      { name: 'Trạng thái', field: 'statusName', className: 'min-w-[150px] max-w-[150px]', templateCode: 'statusColumnTemplate' },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ]
  }
  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      organizationId: new FormControl(''),
      deviceTypeId: new FormControl(''),
      status: new FormControl(''),
    });
    this.importDeviceForm = new FormGroup({
      deviceFile: new FormControl(null),
    });
    this.assignOrganizationForm = new FormGroup({
      deviceId: new FormControl('', [Validators.required]),
      organizationId: new FormControl('', [Validators.required])
    });
    this.editDeviceForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      serialNumber: new FormControl('', [Validators.required]),
      deviceTypeId: new FormControl('', [Validators.required]),
      modelId: new FormControl('', [Validators.required]),
      note: new FormControl(''),
    });
    this.onValueChange();
    await Promise.all([
      this.onGetDevice(),
      this.onGetDeviceType()
    ]);
  }

  onValueChange() {
    this.editDeviceForm.get('deviceTypeId')?.valueChanges.subscribe((value) => {
      const deviceType = this.deviceTypeList.find((item) => item.id === value);
      this.modelEditList = deviceType?.models ?? [];
      this.editDeviceForm.get('modelId')?.reset();
    })
  }

  async onGetDevice(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedDeviceResponse>(GET_DEVICES, {
      pagination: {
        page: page < 1 ? 1 : page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
        organizationId: this.filterForm.value.organizationId ?? '',
        deviceTypeId: this.filterForm.value.deviceTypeId ?? '',
      },
    });
    this.dataSource = response?.devices?.data?.reduce((acc: any, item: any, index: number) => {
      const otaMessageSplits: string[] = item?.otaMessage?.split(':') ?? [];
      let otaMessageText;
      if (otaMessageSplits?.length > 1) {
        const timestamp = Number(otaMessageSplits[0]);
        otaMessageText = !isNaN(timestamp) && timestamp > 0
          ? format(new Date(timestamp), 'dd/MM/yyyy HH:mm') + ' ' + otaMessageSplits.slice(1).join(':')
          : item?.otaMessage;
      } else {
        otaMessageText = item?.otaMessage;
      }
      acc.push({
        ...item,
        index: index + 1,
        deviceTypeName: item.deviceType?.name,
        deviceTypeCode: item.deviceType?.code,
        modelName: item.model?.name,
        modelCode: item.model?.code,
        organizationName: item.organization?.name,
        statusName: item.isActive ? 'Kích hoạt' : 'Chưa kích hoạt',
        otaMessageText
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.devices?.pagination?.page ?? 1) - 1,
      size: response?.devices?.pagination?.size ?? 20,
      total: response?.devices?.pagination?.total ?? 0
    }
  }

  async onGetDeviceType() {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedDeviceTypeResponse>(GET_DEVICE_TYPES, {
      pagination: {
        page: 1,
        size: 100,
      },
    });
    this.deviceTypeList = response?.deviceTypes?.data ?? [];
  }

  async onGetOrganization() {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedOrganizationResponse>(GET_ORGANIZATIONS, {
      pagination: {
        page: 1,
        size: 20,
      },
    });
    this.organizationList = response?.organizations?.data ?? [];
  }

  async onPageChange(event: PageEvent) {
    await this.onGetDevice(event.pageIndex + 1);
  }

  async onImportDevice(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const importId = `import_${new Date().getTime()}`;
      this.downloadService.triggerDownload(
        '',
        `Import thiết bị ${format(new Date(), 'ddMMyyy_HHmm')}`,
        SUBSCRIBE_IMPORT_DEVICE_PROGRESS,
        { exportId: importId },
        'importDeviceProgress'
      );
      setTimeout(() => {
        this.injector.get(ApiService).executeMutation<Device>(IMPORT_DEVICE,
          {
            file,
            importId
          }, true)
      }, 3000);
    }
  }

  async onEditDevice(item: any) {
    this.deviceTypeEditList = this.deviceTypeList;
    const deviceType = this.deviceTypeList.find((_item) => _item.id === item.deviceTypeId);
    this.modelEditList = deviceType?.models ?? [];
    this.editDeviceForm.patchValue({
      id: item.id,
      name: item.name,
      serialNumber: item.serialNumber,
      deviceTypeId: item.deviceTypeId,
      modelId: item.model?.id,
      note: item.note,
    });
    const dialogRef = this.injector.get(MatDialog).open(DialogComponent, {
      data: {
        title: 'Sửa thiết bị',
        type: 'default',
        confirmText: 'Sửa',
        showActions: false,
      },
      width: '600px'
    });
    dialogRef.componentInstance.content = this.editDeviceDialogContent;
  }

  async onSave() {
    const response = await this.injector.get(ApiService).executeMutation<Device>(UPDATE_DEVICE,
      {
        id: this.editDeviceForm.value.id,
        input: {
          name: this.editDeviceForm.value.name,
          serial: this.editDeviceForm.value.serialNumber,
          deviceTypeId: this.editDeviceForm.value.deviceTypeId,
          modelId: this.editDeviceForm.value.modelId,
          description: this.editDeviceForm.value.note,
        }
      })
    if (response) {
      this.commonService.openSnackBar('Sửa thiết bị thành công');
      this.dialog?.closeAll();
      const index = this.dataSource.findIndex((item) => item.id === this.editDeviceForm.value.id);
      if (index > -1) {
        this.dataSource[index] = {
          ...this.dataSource[index],
          name: response.updateDevice?.name,
          serialNumber: response.updateDevice?.serialNumber,
          deviceTypeId: response.updateDevice?.deviceTypeId,
          modelId: response.updateDevice?.modelId,
          note: response.updateDevice?.description,
          model: response.updateDevice?.model,
          deviceType: response.updateDevice?.deviceType,
          modelCode: response.updateDevice?.model?.code,
          deviceTypeCode: response.updateDevice?.deviceType?.code,
        };
      }
    } else {
      this.commonService.openSnackBarError('Sửa thiết bị thất bại');
    }
  }

  async onResetDevice(item: any) {
    this.removeDeviceFromOrganizationSelected = item;
    const dialogRef = this.injector.get(MatDialog).open(DialogNotificationComponent, {
      disableClose: true,
      data: {
        title: 'Xóa thiết bị khỏi tổ chức',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });
    dialogRef.componentInstance.content = this.removeDeviceFromOrganizationDialogNotification;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.injector.get(ApiService).executeMutation<Device>(REMOVE_DEVICE_FROM_ORGANIZATION,
          {
            deviceIds: [this.removeDeviceFromOrganizationSelected.id]
          }
        ).then(async response => {
          this.commonService.openSnackBar('Xóa thiết bị khỏi tổ chức thành công');
          await this.onGetDevice(this.dataSource.length === 1
            ? this.pagination.page - 1
            : this.pagination.page);
        }).catch(error => {
          this.commonService.openSnackBarError('Xóa thiết bị khỏi tổ chức thất bại');
        });
      }
    });
  }

  async onAssignOrganization(item: any) {
    this.assignOrganizationForm.reset();
    this.assignOrganizationForm.patchValue({
      organizationId: item.organizationId,
      deviceId: item.id,
    });
    const dialogRef = this.injector.get(MatDialog).open(DialogComponent, {
      disableClose: true,
      data: {
        title: 'Gán tổ chức',
        confirmText: 'Gán',
        cancelText: 'Hủy',
        showActions: false,
      }
    });
    dialogRef.componentInstance.content = this.assignOrganizationDialogContent;
  }

  async onAssignOrganizationSave() {
    this.assignOrganizationForm.markAllAsTouched();
    if (this.assignOrganizationForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const response = await this.injector.get(ApiService).executeMutation<Device>(ASSIGN_DEVICE_TO_ORGANIZATION,
      {
        ...this.assignOrganizationForm.value
      });
    if (response) {
      this.commonService.openSnackBar('Gán tổ chức thành công');
      this.onCancel();
      // const itemIndex = this.dataSource.findIndex(item => item.id === response.assignDeviceToOrganization.id);
      // this.dataSource[itemIndex] = response.assignDeviceToOrganization;
      await this.onGetDevice(this.pagination.page)
    }
  }

  onCancel() {
    this.injector.get(MatDialog).closeAll();
  }

  async onDeleteDevice(item: any) {
    this.assignOrganizationForm.patchValue({
      organizationId: item.organizationId,
      note: item.note,
    });
  }
}
