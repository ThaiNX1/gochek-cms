import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseClass } from '../../../commons/base.class';
import { GET_DEVICE_TYPES } from '../../../commons/queries/device-type.query';
import { CREATE_FIRMWARE, GET_FIRMWARE_BY_ID, UPDATE_FIRMWARE } from '../../../commons/queries/firmware.query';
import { CreateFirmwareInput, Firmware, PaginatedDeviceTypeResponse } from '../../../commons/types';
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
  deviceTypeSearchQuery = GET_DEVICE_TYPES;
  deviceTypeList: any[] = [];
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
      deviceTypeId: new FormControl(null),
      deviceTypes: new FormArray([]),
      firmwareFile: new FormControl(null),
      md5: new FormControl(null, [Validators.required]),
    });
    this.deviceTypes = this.firmwareForm.get('deviceTypes') as FormArray;
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
      firmwareFile: null,
      md5: response?.firmware?.md5,
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
  }

  async onGetDeviceType() {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedDeviceTypeResponse>(GET_DEVICE_TYPES, {
      pagination: {
        page: 1,
        size: 20,
      },
    });
    this.deviceTypeList = response?.deviceTypes?.data || [];
  }

  onRemoveDeviceType(index: number) {
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

  onSelectFirmwareFile(event: any) {
    const file = event.target.files[0];
    this.firmwareForm.get('firmwareFile')?.setValue(file);
  }

  async onSave() {
    this.firmwareForm.markAllAsTouched();
    if (this.firmwareForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (this.firmwareForm.get('firmwareFile')?.value) {

      const response = await this.injector.get(ApiService).executeMutation(UPLOAD_FILE, {
        file: this.firmwareForm.get('firmwareFile')?.value,
        folder: constant.fileFolder.firmwares,
      });

      if (response?.uploadFile) {
        this.firmwareForm.get('filePath')?.setValue(response.uploadFile?.basePath);
        this.firmwareForm.get('fileName')?.setValue(this.firmwareForm.get('firmwareFile')?.value?.name);
      }
    }
    let input: any = {
      name: this.firmwareForm.get('name')?.value,
      version: this.firmwareForm.get('version')?.value,
      description: this.firmwareForm.get('description')?.value,
      releaseNotes: this.firmwareForm.get('releaseNotes')?.value,
      filePath: this.firmwareForm.get('filePath')?.value,
      fileName: this.firmwareForm.get('fileName')?.value,
      md5: this.firmwareForm.get('md5')?.value,
      deviceTypeIds: this.deviceTypes.getRawValue()?.map((deviceType: any) => deviceType.id) || [],
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
