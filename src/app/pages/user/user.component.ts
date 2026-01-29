import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { BaseClass } from '../../commons/base.class';
import { DELETE_USER, GET_USERS, RESET_PASSWORD, UPDATE_USER } from '../../commons/queries/user.query';
import { PaginatedUserResponse, User } from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { takeUntil } from 'rxjs';
@Component({
  selector: 'app-user',
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
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent extends BaseClass {
  @ViewChild('userDialogContent') userDialogContent!: TemplateRef<any>;
  dialogData: DialogData = {
    title: 'Xóa người dùng',
    showActions: true,
    showCloseButton: true,
    width: '500px',
    align: 'center',
    type: 'error',
    confirmText: 'Xóa',
    cancelText: 'Hủy',
  }
  constructor(
    private dialog: MatDialog,
  ) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER, },
      { name: 'Họ và tên', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Email', field: 'email', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Bộ̉ phận', field: 'departmentName', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Vai trò', field: 'roleName', className: 'min-w-[200px] max-w-[200px]' },
      // { name: 'Số thiết bị', field: 'deviceCount', className: 'min-w-[100px] max-w-[100px]' },
      // { name: 'Ca làm việc', field: 'checkInOutConfigName', className: 'min-w-[100px] max-w-[100px]' },
      { name: 'Trạng thái', field: 'isActive', className: 'min-w-[180px] max-w-[180px]', templateCode: 'statusColumnTemplate' },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ]
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    await this.onGetUsers();
  }

  async onGetUsers(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedUserResponse>(GET_USERS, {
      pagination: {
        page: page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    });
    this.dataSource = response?.users?.data?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        deviceCount: item.devices?.length,
        organizationName: item.organization?.name,
        roleName: item.roles?.map((role: any) => role.name).join(', '),
        roomName: item.rooms?.map((room: any) => room.name).join(', '),
        checkInOutConfigName: item.checkInOutConfigs?.map((checkInOutConfig: any) => checkInOutConfig.name).join(', '),
        departmentName: item.department?.name,
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: (response?.users?.pagination?.page ?? 1) - 1,
      size: response?.users?.pagination?.size ?? 20,
      total: response?.users?.pagination?.total ?? 0,
    }
  }

  async onPageChange(event: PageEvent) {
    await this.onGetUsers(event.pageIndex + 1);
  }

  onToggleStatus(item: User) {
    const newStatus = !item.isActive;
    const statusText = newStatus ? 'kích hoạt' : 'vô hiệu hóa';

    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn ${statusText} người dùng "${item.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng`,
        confirmText: 'Xác nhận',
        message: `Bạn có chắc chắn muốn ${statusText} người dùng "${item.name}" không?`,
        showActions: true,
      },
      width: this.dialogData.width
    });
    dialogRef.componentInstance.content = this.userDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        await this.toggleUserStatus(item, newStatus);
      }
    });
  }

  async toggleUserStatus(item: User, newStatus: boolean) {
    const response = await this.injector.get(ApiService).executeMutation(
      UPDATE_USER,
      {
        id: item.id,
        input: { isActive: newStatus }
      }
    );

    if (response) {
      this.commonService.openSnackBar(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
      await this.onGetUsers(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thất bại`);
    }
  }

  async onResetPassword(item: User) {
    this.dialogData.type = 'error';
    this.dialogData.message = `Bạn có chắc chắn muốn reset mật khẩu người dùng "${item.name}" không?`;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Reset mật khẩu người dùng',
        confirmText: 'Xác nhận',
        message: `Bạn có chắc chắn muốn reset mật khẩu người dùng "${item.name}" không?`,
        showActions: true,
      },
      width: this.dialogData.width
    });
    dialogRef.componentInstance.content = this.userDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        await this.resetPassword(item);
      }
    });
  }

  async resetPassword(item: User) {
    const response = await this.injector.get(ApiService).executeMutation(
      RESET_PASSWORD,
      {
        id: item.id,
      }
    );

    if (response) {
      this.commonService.openSnackBar(`Reset mật khẩu người dùng thành công. Mật khẩu mặc định là 123456a@`);
    } else {
      this.commonService.openSnackBarError(`Reset mật khẩu người dùng thất bại`);
    }
  }
}
