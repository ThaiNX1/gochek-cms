import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { Firmware, FirmwareTypeEnum, Model, PaginatedFirmwareResponse } from '../../commons/types';
import { DELETE_FIRMWARE, GET_FIRMWARES, REMOVE_MODEL_FIRMWARE, UPDATE_FIRMWARE_STATUS } from '../../commons/queries/firmware.query';
import { PageEvent } from '@angular/material/paginator';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-firmware',
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
    MatSlideToggleModule
  ],
  templateUrl: './firmware.component.html',
  styleUrl: './firmware.component.scss'
})
export class FirmwareComponent extends BaseClass {
  @ViewChild('firmwareDialogContent') firmwareDialogContent!: TemplateRef<any>;
  dialogData: DialogData = {
    title: 'Xóa firmware',
    showActions: true,
    showCloseButton: true,
    width: '500px',
    align: 'center',
    type: 'error',
    confirmText: 'Xóa',
    cancelText: 'Hủy',
  }
  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER, },
      { name: 'Tên firmware', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Phiên bản', field: 'version', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'File', field: 'fileName', className: 'min-w-[250px] max-w-[250px]' },
      { name: 'Loại', field: 'typeName', className: 'min-w-[100px] max-w-[100px]' },
      // { name: 'Mô tả', field: 'description', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Ghi chú release', field: 'releaseNotes', className: 'min-w-[150px] max-w-[150px]' },
      { name: 'Trạng thái', field: 'status', className: 'min-w-[80px] max-w-[80px]', templateCode: 'statusColumnTemplate' },
      { name: 'Hành động', field: 'action', className: 'min-w-[80px] max-w-[80px]', tdClassName: '!justify-start', templateCode: 'actionColumnTemplate' },
    ]
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    await this.onGetFirmwares();
  }
  
  async onGetFirmwares(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedFirmwareResponse>(GET_FIRMWARES, {
      pagination: {
        page: page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    });
    const latestESP = response?.firmwares?.lastItems?.find((item: any) => item.type === FirmwareTypeEnum.ESP_FIRMWARE);
    const latestRA = response?.firmwares?.lastItems?.find((item: any) => item.type === FirmwareTypeEnum.RA_FIRMWARE);
    this.dataSource = response?.firmwares?.data?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        status: item.isActive ? 'Hoạt động' : 'Không hoạt động',
        typeName: item.type === FirmwareTypeEnum.ESP_FIRMWARE ? 'ESP' : 'RA',
        isLatest: item.id === latestESP?.id || item.id === latestRA?.id
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.firmwares?.pagination?.page ?? 1) - 1,
      size: response?.firmwares?.pagination?.size ?? 20,
      total: response?.firmwares?.pagination?.total ?? 0
    }
  }

  async onPageChange(event: PageEvent) {
    await this.onGetFirmwares(event.pageIndex + 1);
  }

  async onToggleStatus(item: any) {
    const newStatus = !item.isActive;
    const statusText = newStatus ? 'kích hoạt' : 'vô hiệu hóa';

    this.dialogData.type = 'default';
    this.dialogData.message = `Bạn có chắc chắn muốn ${statusText} firmware "${item.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} firmware`,
        confirmText: 'Xác nhận',
        showActions: true,
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.firmwareDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        await this.toggleFirmwareStatus(item, newStatus);
      }
    });
  }

  async toggleFirmwareStatus(item: any, newStatus: boolean) {
    const response = await this.injector.get(ApiService).executeMutation(
      UPDATE_FIRMWARE_STATUS,
      {
        id: item.id,
        isActive: newStatus
      }
    );

    if (response) {
      this.commonService.openSnackBar(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} firmware thành công`);
      await this.onGetFirmwares(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} firmware thất bại`);
    }
  }

  async onDelete(item: any) {
    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn xóa firmware "${item.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xóa firmware',
        confirmText: 'Xóa',
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.firmwareDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(DELETE_FIRMWARE, {
          id: item.id,
        });
        if (response) {
          this.commonService.openSnackBar('Xóa firmware thành công');
          await this.onGetFirmwares(this.pagination.page + 1);
        } else {
          this.commonService.openSnackBarError('Xóa firmware thất bại');
        }
      }
    });
  }

  onDeleteModel(item: Firmware, model: Model) {
    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn xóa model "${model.name}" khỏi firmware "${item.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Xóa model',
        confirmText: 'Xóa',
      },
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.firmwareDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(REMOVE_MODEL_FIRMWARE, {
          id: item.id,
          modelId: model.id,
        });
        if (response) {
          this.commonService.openSnackBar('Xóa model thành công');
          await this.onGetFirmwares(this.pagination.page + 1);
        } else {
          this.commonService.openSnackBarError('Xóa model thất bại');
        }
      }
    });
  }
}
