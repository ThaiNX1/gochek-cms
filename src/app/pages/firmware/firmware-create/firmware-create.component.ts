import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseClass } from '../../../commons/base.class';
import { GET_DEVICE_TYPES, GET_MODELS } from '../../../commons/queries/device-type.query';
import { CREATE_FIRMWARE, GET_FIRMWARE_BY_ID, UPDATE_FIRMWARE } from '../../../commons/queries/firmware.query';
import { CreateFirmwareInput, Firmware, FirmwareTypeEnum, PaginatedDeviceTypeResponse } from '../../../commons/types';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from '../../../core/material.module';
import { SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';
import { DirectiveModule } from '../../../shared/directive.module';
import { constant } from '../../../core/constants/constant';
import { UPLOAD_FILE } from '../../../commons/queries/common.query';

@Component({
  selector: 'app-firmware-create',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule,
    DirectiveModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    SelectSearchComponent
  ],
  templateUrl: './firmware-create.component.html',
  styleUrl: './firmware-create.component.scss'
})
export class FirmwareCreateComponent extends BaseClass {
  queryParams: any;
  firmwareForm!: FormGroup;
  deviceTypes!: FormArray;
  models!: FormArray;
  deviceTypeSearchQuery = GET_DEVICE_TYPES;
  deviceTypeList: any[] = [];
  modelSearchQuery = GET_MODELS;
  modelList: any[] = [];
  firmwareTypeList = [
    { name: 'ESP', value: FirmwareTypeEnum.ESP_FIRMWARE },
    { name: 'RA', value: FirmwareTypeEnum.RA_FIRMWARE },
  ]
  constructor() {
    super();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.firmwareForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      version: new FormControl('', [Validators.required]),
      filePath: new FormControl(''),
      fileName: new FormControl(''),
      releaseNotes: new FormControl(''),
      description: new FormControl(''),
      type: new FormControl(null, [Validators.required]),
      deviceTypeId: new FormControl(null),
      deviceTypes: new FormArray([]),
      modelId: new FormControl(null),
      models: new FormArray([]),
      firmwareFile: new FormControl(null),
      md5: new FormControl(null),
    });
    this.deviceTypes = this.firmwareForm.get('deviceTypes') as FormArray;
    this.models = this.firmwareForm.get('models') as FormArray;
    this.injector.get(ActivatedRoute).params.subscribe(async (params: any) => {
      this.queryParams = params;
      if (params.id && params.id !== 'create') {
        await this.getFirmWare(params.id);
      }
    });
    await this.onGetDeviceType();
  }

  async getFirmWare(id: string) {
    const response = await this.injector.get(ApiService).executeQuery<Firmware>(GET_FIRMWARE_BY_ID, {
      id: id,
    });
    this.firmwareForm.patchValue({
      id: response?.firmware?.id,
      name: response?.firmware?.name,
      version: response?.firmware?.version,
      filePath: response?.firmware?.filePath,
      releaseNotes: response?.firmware?.releaseNotes,
      description: response?.firmware?.description,
      type: response?.firmware?.type,
      firmwareFile: null,
      md5: null,
    });
    this.deviceTypes.clear();
    response?.firmware?.deviceTypes?.forEach((deviceType: any) => {
      this.deviceTypes.push(new FormGroup({
        id: new FormControl(deviceType.id),
        name: new FormControl(deviceType.name),
        code: new FormControl(deviceType.code),
        switchCount: new FormControl(deviceType.switchCount),
      }));
    });
    this.models.clear();
    response?.firmware?.models?.forEach((model: any) => {
      this.models.push(new FormGroup({
        id: new FormControl(model.id),
        name: new FormControl(model.name),
        code: new FormControl(model.code),
        deviceTypeId: new FormControl(model.deviceTypeId),
      }));
    });
  }

  async onGetDeviceType() {
    const responses = await Promise.all([
      this.injector.get(ApiService).executeQuery<PaginatedDeviceTypeResponse>(GET_DEVICE_TYPES, {
        pagination: {
          page: 1,
          size: 20,
        },
      }),
      this.injector.get(ApiService).executeQuery<PaginatedDeviceTypeResponse>(GET_MODELS, {
        pagination: {
          page: 1,
          size: 20,
        },
      }),
    ]);
    this.deviceTypeList = responses[0]?.deviceTypes?.data || [];
    this.modelList = responses[1]?.models?.data || [];
  }

  onRemoveDeviceType(index: number) {
    const deviceType = this.deviceTypes.controls[index].value;
    this.models.controls.forEach((model: any) => {
      if (model.value.deviceTypeId === deviceType.id) {
        this.models.removeAt(this.models.controls.indexOf(model));
      }
    });
    this.deviceTypes.removeAt(index);
  }

  onSelectDeviceType(event: any) {
    const checked = this.deviceTypes.controls.find((deviceType: any) => deviceType.value.id === event.id);
    if (checked) {
      return;
    }
    this.deviceTypes.push(new FormGroup({
      id: new FormControl(event.id),
      name: new FormControl(event.name),
      code: new FormControl(event.code),
      switchCount: new FormControl(event.switchCount),
    }));
    this.firmwareForm.get('deviceTypeId')?.reset();
  }

  onSelectModel(event: any) {
    const checked = this.models.controls.find((model: any) => model.value.id === event.id);

    if (checked) {
      return;
    }
    this.models.push(new FormGroup({
      id: new FormControl(event.id),
      name: new FormControl(event.name),
      code: new FormControl(event.code),
      deviceTypeId: new FormControl(event.deviceTypeId),
    }));
    this.firmwareForm.get('modelId')?.reset();
  }

  onRemoveModel(index: number) {
    this.models.removeAt(index);
  }

  onSelectFirmwareFile(event: any) {
    const file = event.target.files[0];
    this.firmwareForm.get('firmwareFile')?.setValue(file);
    // const [type, model, version, env, md5] = file.name.split('.')?.[0]?.split('_');
    // this.firmwareForm.get('md5')?.setValue(md5);
    // this.firmwareForm.get('type')?.setValue(type);
    // this.firmwareForm.get('version')?.setValue(version);
  }

  async onSave() {
    this.firmwareForm.markAllAsTouched();
    if (this.firmwareForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    let input: any = {
      name: this.firmwareForm.get('name')?.value,
      version: this.firmwareForm.get('version')?.value,
      description: this.firmwareForm.get('description')?.value,
      releaseNotes: this.firmwareForm.get('releaseNotes')?.value,
      type: this.firmwareForm.get('type')?.value,
      deviceTypeIds: this.deviceTypes.getRawValue()?.map((deviceType: any) => deviceType.id) || [],
      modelIds: this.models.getRawValue()?.map((model: any) => model.id) || [],
    }
    if (this.firmwareForm.get('firmwareFile')?.value) {
      if (!this.firmwareForm.get('md5')?.value) {
        this.commonService.openSnackBarError('Vui lòng nhập mã md5');
        return;
      }
      const response = await this.injector.get(ApiService).executeMutation(UPLOAD_FILE, {
        file: this.firmwareForm.get('firmwareFile')?.value,
        folder: constant.fileFolder.firmwares,
        md5: this.firmwareForm.get('md5')?.value,
      });

      if (response?.uploadFile) {
        this.firmwareForm.get('filePath')?.setValue(response.uploadFile?.basePath);
        this.firmwareForm.get('fileName')?.setValue(this.firmwareForm.get('firmwareFile')?.value?.name);
        input = {
          ...input,
          filePath: response.uploadFile?.basePath,
          fileName: this.firmwareForm.get('firmwareFile')?.value?.name,
          md5: response.uploadFile?.md5 || this.firmwareForm.get('md5')?.value,
        }
      } else {
        this.commonService.openSnackBarError('Lỗi khi upload file. Kiểm tra file hoặc md5');
        return;
      }
    }
    const response = this.firmwareForm.value?.id
      ? await this.injector.get(ApiService).executeMutation(UPDATE_FIRMWARE, {
        id: this.firmwareForm.value?.id,
        input: input,
      })
      : await this.injector.get(ApiService).executeMutation(CREATE_FIRMWARE, {
        input: input,
      });
    if (response?.updateFirmware || response?.createFirmware) {
      this.commonService.openSnackBar(`${this.firmwareForm.value?.id ? 'Cập nhật' : 'Thêm'} firmware thành công`);
      this.injector.get(Router).navigate(['/firmware']);
    }
  }
}
