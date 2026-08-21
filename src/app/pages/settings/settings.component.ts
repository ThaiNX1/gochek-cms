import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseClass } from '../../commons/base.class';
import {
  GET_NHANH_CREDENTIALS,
  GET_PARTNER_CREDENTIALS,
  REFRESH_VIETTEL_POST_TOKEN,
  UPSERT_NHANH_CREDENTIAL,
  UPSERT_PARTNER_CREDENTIAL,
  VERIFY_NHANH_CREDENTIAL,
} from '../../commons/queries/partner-credential.query';
import {
  NhanhDepotResponse,
  PartnerCredential,
  PartnerEnvironment,
  PartnerKey,
  UpsertNhanhCredentialInput,
} from '../../commons/types';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent extends BaseClass {
  credentials: PartnerCredential[] = [];
  selectedCredentialId: string | null = null;
  isLoadingCredentials = false;
  isSaving = false;
  refreshingCredentialId: string | null = null;
  showPassword = false;

  nhanhCredentials: PartnerCredential[] = [];
  selectedNhanhCredentialId: string | null = null;
  isLoadingNhanhCredentials = false;
  isSavingNhanhCredential = false;
  verifyingNhanhCredentialId: string | null = null;
  showNhanhAccessToken = false;
  showNhanhWebhookVerifyToken = false;
  verifiedNhanhDepots: NhanhDepotResponse[] = [];

  readonly environments = [
    { value: PartnerEnvironment.PROD, name: 'Production' },
    { value: PartnerEnvironment.DEV, name: 'Development' },
  ];

  readonly canViewCredentials = this.hasPermission([
    this.PermissionEnum.VIETTEL_POST_READ,
    this.PermissionEnum.VIETTEL_POST_CREDENTIAL_MANAGE,
    this.PermissionEnum.VIETTEL_POST_MANAGE,
  ]);

  readonly canManageCredentials = this.hasPermission([
    this.PermissionEnum.VIETTEL_POST_CREDENTIAL_MANAGE,
    this.PermissionEnum.VIETTEL_POST_MANAGE,
  ]);

  readonly canViewNhanhCredentials = this.hasPermission([
    this.PermissionEnum.NHANH_READ,
    this.PermissionEnum.NHANH_CREDENTIAL_MANAGE,
    this.PermissionEnum.NHANH_MANAGE,
  ]);

  readonly canManageNhanhCredentials = this.hasPermission([
    this.PermissionEnum.NHANH_CREDENTIAL_MANAGE,
    this.PermissionEnum.NHANH_MANAGE,
  ]);

  credentialForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl(''),
    environment: new FormControl(PartnerEnvironment.PROD, [Validators.required]),
    isActive: new FormControl(true),
  });

  nhanhCredentialForm = new FormGroup({
    environment: new FormControl(PartnerEnvironment.PROD, [Validators.required]),
    appId: new FormControl('', [Validators.required]),
    businessId: new FormControl('', [Validators.required]),
    accessToken: new FormControl(''),
    webhookVerifyToken: new FormControl(''),
    isActive: new FormControl(true),
  });

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    if (!this.canManageCredentials) {
      this.credentialForm.disable();
    }

    if (!this.canManageNhanhCredentials) {
      this.nhanhCredentialForm.disable();
    }

    const loadingTasks: Promise<void>[] = [];
    if (this.canViewCredentials) {
      loadingTasks.push(this.onGetCredentials());
    }
    if (this.canViewNhanhCredentials) {
      loadingTasks.push(this.onGetNhanhCredentials());
    }
    await Promise.all(loadingTasks);
  }

  async onGetCredentials(selectCredentialId?: string) {
    this.isLoadingCredentials = true;
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_PARTNER_CREDENTIALS, {
      input: {
        partnerKey: PartnerKey.VIETTEL_POST,
      },
    });
    this.isLoadingCredentials = false;

    this.credentials = (response?.partnerCredentials ?? [])
      .slice()
      .sort((first: PartnerCredential, second: PartnerCredential) =>
        first.environment.localeCompare(second.environment)
        || (first.username ?? '').localeCompare(second.username ?? ''));

    const credentialToSelect = this.credentials.find((item) => item.id === selectCredentialId)
      ?? this.credentials.find((item) => item.id === this.selectedCredentialId)
      ?? this.credentials[0];

    if (credentialToSelect) {
      this.onSelectCredential(credentialToSelect);
    } else {
      this.onCreateCredential();
    }
  }

  onSelectCredential(credential: PartnerCredential) {
    this.selectedCredentialId = credential.id;
    this.showPassword = false;
    this.credentialForm.reset({
      username: credential.username,
      password: '',
      environment: credential.environment,
      isActive: credential.isActive,
    });
  }

  onCreateCredential() {
    this.selectedCredentialId = null;
    this.showPassword = false;
    this.credentialForm.reset({
      username: '',
      password: '',
      environment: PartnerEnvironment.PROD,
      isActive: true,
    });
  }

  async onSaveCredential() {
    this.credentialForm.markAllAsTouched();
    const formValue = this.credentialForm.getRawValue();

    if (this.credentialForm.invalid || (!this.selectedCredentialId && !formValue.password)) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const input: Record<string, unknown> = {
      id: this.selectedCredentialId || undefined,
      partnerKey: PartnerKey.VIETTEL_POST,
      username: formValue.username?.trim(),
      environment: formValue.environment,
      isActive: formValue.isActive,
    };

    if (formValue.password) {
      input['password'] = formValue.password;
    }

    this.isSaving = true;
    const response = await this.injector.get(ApiService).executeMutation(UPSERT_PARTNER_CREDENTIAL, { input });
    this.isSaving = false;

    const savedCredential = response?.upsertPartnerCredential;
    if (!savedCredential) {
      this.commonService.openSnackBarError('Lưu cấu hình đối tác vận chuyển thất bại');
      return;
    }

    this.commonService.openSnackBar('Lưu cấu hình đối tác vận chuyển thành công');
    await this.onGetCredentials(savedCredential.id);
  }

  async onRefreshToken(credential: PartnerCredential) {
    this.refreshingCredentialId = credential.id;
    const response = await this.injector.get(ApiService).executeMutation(REFRESH_VIETTEL_POST_TOKEN, {
      input: {
        partnerCredentialId: credential.id,
      },
    });
    this.refreshingCredentialId = null;

    const refreshedCredential = response?.refreshViettelPostToken;
    if (!refreshedCredential) {
      this.commonService.openSnackBarError('Làm mới token Viettel Post thất bại');
      return;
    }

    this.commonService.openSnackBar('Làm mới token Viettel Post thành công');
    await this.onGetCredentials(refreshedCredential.id);
  }

  async onGetNhanhCredentials(selectCredentialId?: string): Promise<void> {
    this.isLoadingNhanhCredentials = true;
    const response = await this.injector.get(ApiService).executeQuery<any>(GET_NHANH_CREDENTIALS);
    this.isLoadingNhanhCredentials = false;

    this.nhanhCredentials = (response?.nhanhCredentials ?? [])
      .slice()
      .sort((first: PartnerCredential, second: PartnerCredential) =>
        first.environment.localeCompare(second.environment)
        || (first.businessId ?? '').localeCompare(second.businessId ?? '')
        || (first.appId ?? '').localeCompare(second.appId ?? ''));

    const credentialToSelect = this.nhanhCredentials.find((item) => item.id === selectCredentialId)
      ?? this.nhanhCredentials.find((item) => item.id === this.selectedNhanhCredentialId)
      ?? this.nhanhCredentials[0];

    if (credentialToSelect) {
      this.onSelectNhanhCredential(credentialToSelect);
    } else {
      this.onCreateNhanhCredential();
    }
  }

  onSelectNhanhCredential(credential: PartnerCredential): void {
    this.selectedNhanhCredentialId = credential.id;
    this.showNhanhAccessToken = false;
    this.showNhanhWebhookVerifyToken = false;
    this.verifiedNhanhDepots = [];
    this.nhanhCredentialForm.reset({
      environment: credential.environment,
      appId: credential.appId ?? '',
      businessId: credential.businessId ?? '',
      accessToken: '',
      webhookVerifyToken: '',
      isActive: credential.isActive,
    });
  }

  onCreateNhanhCredential(): void {
    this.selectedNhanhCredentialId = null;
    this.showNhanhAccessToken = false;
    this.showNhanhWebhookVerifyToken = false;
    this.verifiedNhanhDepots = [];
    this.nhanhCredentialForm.reset({
      environment: PartnerEnvironment.PROD,
      appId: '',
      businessId: '',
      accessToken: '',
      webhookVerifyToken: '',
      isActive: true,
    });
  }

  async onSaveNhanhCredential(): Promise<void> {
    this.nhanhCredentialForm.markAllAsTouched();
    const formValue = this.nhanhCredentialForm.getRawValue();

    if (this.nhanhCredentialForm.invalid || (!this.selectedNhanhCredentialId && !formValue.accessToken)) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const input: UpsertNhanhCredentialInput = {
      id: this.selectedNhanhCredentialId || undefined,
      environment: formValue.environment ?? PartnerEnvironment.PROD,
      appId: formValue.appId?.trim(),
      businessId: formValue.businessId?.trim(),
      isActive: formValue.isActive ?? true,
    };

    if (formValue.accessToken) {
      input.accessToken = formValue.accessToken.trim();
    }
    if (formValue.webhookVerifyToken) {
      input.webhookVerifyToken = formValue.webhookVerifyToken.trim();
    }

    this.isSavingNhanhCredential = true;
    const response = await this.injector.get(ApiService).executeMutation(UPSERT_NHANH_CREDENTIAL, { input });
    this.isSavingNhanhCredential = false;

    const savedCredential = response?.upsertNhanhCredential;
    if (!savedCredential) {
      this.commonService.openSnackBarError('Lưu cấu hình tài khoản Nhanh.vn thất bại');
      return;
    }

    this.commonService.openSnackBar('Lưu cấu hình tài khoản Nhanh.vn thành công');
    await this.onGetNhanhCredentials(savedCredential.id);
  }

  async onVerifyNhanhCredential(credential: PartnerCredential): Promise<void> {
    this.verifyingNhanhCredentialId = credential.id;
    const response = await this.injector.get(ApiService).executeMutation(VERIFY_NHANH_CREDENTIAL, {
      input: {
        partnerCredentialId: credential.id,
      },
    });
    this.verifyingNhanhCredentialId = null;

    const depots: NhanhDepotResponse[] | undefined = response?.verifyNhanhCredential;
    if (!depots) {
      this.commonService.openSnackBarError('Kiểm tra kết nối Nhanh.vn thất bại');
      return;
    }

    await this.onGetNhanhCredentials(credential.id);
    this.verifiedNhanhDepots = depots;
    this.commonService.openSnackBar(`Kết nối Nhanh.vn thành công, tìm thấy ${depots.length} kho`);
  }

  getEnvironmentName(environment: PartnerEnvironment): string {
    return this.environments.find((item) => item.value === environment)?.name ?? environment;
  }

  get selectedCredential(): PartnerCredential | undefined {
    return this.credentials.find((item) => item.id === this.selectedCredentialId);
  }

  get selectedNhanhCredential(): PartnerCredential | undefined {
    return this.nhanhCredentials.find((item) => item.id === this.selectedNhanhCredentialId);
  }

  formatList(value: unknown): string {
    return Array.isArray(value) && value.length > 0 ? value.join(', ') : '-';
  }

  formatTimestamp(timestamp: number | null | undefined): string {
    if (!timestamp) {
      return '-';
    }

    const milliseconds = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(milliseconds));
  }

  isExpired(timestamp: number | null | undefined): boolean {
    if (!timestamp) {
      return false;
    }

    const milliseconds = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
    return milliseconds <= Date.now();
  }
}
