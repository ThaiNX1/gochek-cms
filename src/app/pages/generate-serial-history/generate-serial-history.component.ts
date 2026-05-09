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
import { ALL_PREFIX, GENERATE_SERIAL_NUMBER_HISTORY } from '../../commons/queries/generate-history.query';
import { GenerateHistory, PaginatedGenerateHistoryResponse } from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DownloadService } from '../../core/services/download.service';
import { GENERATE_SERIAL_NUMBER, SUBSCRIBE_GENERATE_SERIAL_NUMBER_PROGRESS } from '../../commons/queries/device.query';
import { GET_MODELS } from '../../commons/queries/device-type.query';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
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
    MatMenuModule,
    MatAutocompleteModule,
    SelectSearchComponent,
  ],
  templateUrl: './generate-serial-history.component.html',
  styleUrl: './generate-serial-history.component.scss'
})
export class GenerateSerialHistoryComponent extends BaseClass {
  @ViewChild('generateSerialDialogContent') generateSerialDialogContent!: TemplateRef<any>;
  generateSerialForm!: FormGroup;
  dialogData: DialogData = {
    title: 'Sinh mã cho sản phẩm',
    showActions: false,
    showCloseButton: true,
    width: '700px',
    align: 'center',
    type: 'default',
    confirmText: 'Lưu',
    cancelText: 'Hủy',
  }
  prefixList: GenerateHistory[] = [];
  prefixStrList: string[] = [];
  modelList: any[] = [];
  modelSearchQuery = GET_MODELS;
  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER, },
      { name: 'Ngày thực hiện', field: 'createdAt', className: 'min-w-[150px] max-w-[150px]', type: TableColumnType.DATE },
      { name: 'Prefix', field: 'prefix', className: 'min-w-[100px] max-w-[100px]' },
      { name: 'Số lượng', field: 'serialCount', className: 'min-w-[80px] max-w-[80px]' },
      { name: 'Serial đầu', field: 'startSerialNumber', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Serial cuối', field: 'endSerialNumber', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Người thực hiện', field: 'createdByName', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Mô tả', field: 'descriptor', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Hành động', field: 'action', className: 'min-w-[80px] max-w-[80px]', templateCode: 'actionColumnTemplate' },
    ]
  }
  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl('')
    });
    this.generateSerialForm = new FormGroup({
      prefix: new FormControl('', [Validators.required]),
      count: new FormControl(1, [Validators.required, Validators.min(1)]),
      modelId: new FormControl('', [Validators.required]),
      descriptor: new FormControl(''),
    });
    await Promise.all([
      this.getAllPrefix(),
      this.onGetHistory(),
    ]);
  }

  async onGetHistory(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedGenerateHistoryResponse>(GENERATE_SERIAL_NUMBER_HISTORY, {
      pagination: {
        page: page < 1 ? 1 : page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    });
    this.dataSource = response?.generateHistories?.data?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        serialCount: item.endSerialNumber - item.startSerialNumber + 1,
        createdByName: item.createdBy?.name,
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.generateHistories?.pagination?.page ?? 1) - 1,
      size: response?.generateHistories?.pagination?.size ?? 20,
      total: response?.generateHistories?.pagination?.total ?? 0
    }
  }

  async getAllPrefix() {
    const response = await this.injector.get(ApiService).executeQuery<GenerateHistory>(ALL_PREFIX);
    this.prefixList = response?.allPrefix ?? [];
    this.prefixStrList = this.prefixList?.reduce((acc: string[], item: GenerateHistory) => {
      if (item.prefix) acc.push(item.prefix);
      return acc;
    }, []) ?? [];
  }

  async onPageChange(event: PageEvent) {
    await this.onGetHistory(event.pageIndex + 1);
  }

  async onReload() {
    await Promise.all([
      this.onGetHistory(this.pagination.page + 1),
      this.getAllPrefix(),
    ]);
  }

  async onGenerate() {
    this.generateSerialForm.reset()
    this.dialogData.type = 'default';
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.generateSerialDialogContent;
  }

  async onSave() {
    this.generateSerialForm.markAllAsTouched();
    if (this.generateSerialForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    };
    const response = await this.injector.get(ApiService).executeMutation<string>(GENERATE_SERIAL_NUMBER, {
      input: {
        prefix: this.generateSerialForm.value.prefix,
        count: this.generateSerialForm.value.count,
        modelId: this.generateSerialForm.value.modelId,
        descriptor: this.generateSerialForm.value.descriptor,
      }
    });
    this.downloadService.triggerDownload(
      '',
      `Sinh mã sản phẩm ${format(new Date(), 'ddMMyyy_HHmm')}`,
      SUBSCRIBE_GENERATE_SERIAL_NUMBER_PROGRESS,
      { exportId: response?.generateSerialNumber },
      'generateSerialNumberProgress'
    );
    this.dialog.closeAll();
  }

  async onDownload(item: GenerateHistory) {
    if (!item.linkDownloadPath) return;
    this.injector.get(DownloadService).downloadFileByURL(item.linkDownloadPath);
  }

  onCancel() {
    this.injector.get(MatDialog).closeAll();
  }
}
