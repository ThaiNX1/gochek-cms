import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { BaseClass } from '../../../commons/base.class';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../core/material.module';
import { DirectiveModule } from '../../../shared/directive.module';
import { Organization, Permission } from '../../../commons/types';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApiService } from '../../../core/services/api.service';
import { CREATE_ORGANIZATION, GET_ORGANIZATION, UPDATE_ORGANIZATION } from '../../../commons/queries/organization.query';
import { GET_PERMISSIONS } from '../../../commons/queries/permission.query';
import * as _ from 'lodash';
import { MatDividerModule } from '@angular/material/divider';
import { GET_BUSINESS_ROLES } from '../../../commons/queries/business-role.query';
import { SelectSearchComponent } from "../../../shared/components/select-search/select-search.component";
import { CommonService } from '../../../core/services/common.service';
import { GET_DEVICES } from '../../../commons/queries/device.query';
import { UPLOAD_FILE } from '../../../commons/queries/common.query';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-organization-create',
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
    SelectSearchComponent,
    MatSlideToggleModule
  ],
  templateUrl: './organization-create.component.html',
  styleUrl: './organization-create.component.scss'
})
export class OrganizationCreateComponent extends BaseClass {
  queryParams: any;
  organizationForm!: FormGroup;
  devices!: FormArray;
  roles: any[] = [];
  deviceList: any[] = [];
  logoPreview: string | null = null;
  faviconPreview: string | null = null;
  deviceSearchQuery = GET_DEVICES;
  deviceSearchObject: any = null;
  constructor() {
    super();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.injector.get(ActivatedRoute).params.subscribe((params: Params) => {
      this.queryParams = params;
      this.deviceSearchObject = {
        ...(this.deviceSearchObject || {}),
        organizationId: this.queryParams?.id === 'create' ? null : this.queryParams?.id
      };
    });
    this.organizationForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      shortName: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      deviceId: new FormControl(''),
      devices: new FormArray([]),
      isActive: new FormControl(true)
    });
    this.devices = this.organizationForm.get('devices') as FormArray;
    await Promise.all([
      this.queryParams?.id !== 'create' && this.getOrganization(),
    ]);
  }

  async getOrganization() {
    const response = await this.injector.get(ApiService).executeQuery<Organization>(GET_ORGANIZATION, {
      id: this.queryParams.id
    });
    this.organizationForm.patchValue({
      id: response?.organization?.id,
      name: response?.organization?.name,
      shortName: response?.organization?.shortName,
      address: response?.organization?.address,
      phone: response?.organization?.phone,
      email: response?.organization?.email,
    });
  }

  async getAllRoles() {
    const response = await this.injector.get(ApiService).executeQuery(GET_BUSINESS_ROLES);
    this.roles = response?.businessRoles?.data || [];
  }

  getPermissionActions(permissionIndex: number) {
    // return this.permissions.at(permissionIndex).get('actions') as FormArray;
  }

  async onSaveOrganization() {
    this.organizationForm.markAllAsTouched();
    if (this.organizationForm.invalid) {
      this.injector.get(CommonService).openSnackBarError('Vui lòng nhập đủ thông tin');
      return;
    }
    let input: any = {
      name: this.organizationForm.value.name,
      shortName: this.organizationForm.value.shortName,
      address: this.organizationForm.value.address,
      phone: this.organizationForm.value.phone,
      email: this.organizationForm.value.email,
      deviceIds: this.devices.getRawValue().map((device: any) => device.id),
      packageId: this.organizationForm.value.packageId,
      primaryColor: this.organizationForm.value.primaryColor,
      secondaryColor: this.organizationForm.value.secondaryColor,
      isActive: this.organizationForm.value.isActive
    }
    if (this.organizationForm.get('logoFile')?.value) {
      const response = await this.injector.get(ApiService).executeMutation(UPLOAD_FILE, {
        file: this.organizationForm.get('logoFile')?.value,
        folder: 'logo'
      });
      if (response?.uploadFile) {
        this.logoPreview = response?.uploadFile.url || null;
        input.logo = response?.uploadFile.basePath;
      }
    }
    if (this.organizationForm.get('faviconFile')?.value) {
      const response = await this.injector.get(ApiService).executeMutation(UPLOAD_FILE, {
        file: this.organizationForm.get('faviconFile')?.value,
        folder: 'favicon'
      });
      if (response?.uploadFile) {
        this.faviconPreview = response?.uploadFile.url || null;
        input.favicon = response?.uploadFile.basePath;
      }
    }
    const response = this.queryParams?.id === 'create'
      ? await this.injector.get(ApiService).executeMutation(CREATE_ORGANIZATION, { input: input })
      : await this.injector.get(ApiService).executeMutation(UPDATE_ORGANIZATION, {
        id: this.queryParams.id,
        input: input
      });
    if (response?.createOrganization || response?.updateOrganization) {
      this.injector.get(CommonService).openSnackBar(this.queryParams?.id === 'create' ? 'Tạo tổ chức thành công' : 'Cập nhật tổ chức thành công');
      this.injector.get(Router).navigate(['/organization']);
    } else {
      this.injector.get(CommonService).openSnackBarError(this.queryParams?.id === 'create' ? 'Lỗi khi tạo tổ chức' : 'Lỗi khi cập nhật tổ chức');
    }
  }

  onSaveOrganizationDevice() {
    this.organizationForm.markAllAsTouched();
    if (this.organizationForm.invalid) {
      this.injector.get(CommonService).openSnackBarError('Vui lòng nhập đủ thông tin');
      return;
    }
    console.log(this.organizationForm.value);
  }

  onSelectedDevice(event: any) {
    if (!this.organizationForm.value.deviceId) {
      return;
    } else {
      const checkDevice = this.devices.getRawValue().find((device: any) => device.id === this.organizationForm.value.deviceId);
      if (checkDevice) {
        this.injector.get(CommonService).openSnackBarError('Thiết bị đã tồn tại');
        this.organizationForm.get('deviceId')?.reset();
        return;
      } else {
        this.devices.push(new FormGroup({
          serial: new FormControl(event.serialNumber),
          name: new FormControl(event.name),
          id: new FormControl(this.organizationForm.value.deviceId),
        }));
        this.organizationForm.controls['deviceId'].reset();
      }
    }
  }

  onRemoveDevice(index: number) {
    this.devices.removeAt(index);
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.organizationForm.get('logoFile')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }

  onFaviconChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.faviconPreview = e.target.result;
        this.organizationForm.get('faviconFile')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.logoPreview = null;
    this.organizationForm.get('logo')?.reset();
    this.organizationForm.get('logoFile')?.reset();
  }

  removeFavicon() {
    this.faviconPreview = null;
    this.organizationForm.get('favicon')?.reset();
    this.organizationForm.get('faviconFile')?.reset();
  }
}
