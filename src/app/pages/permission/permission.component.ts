import { Component } from '@angular/core';
import { BaseClass } from '../../commons/base.class';
import { ApiService } from '../../core/services/api.service';
import { GET_PERMISSIONS } from '../../commons/queries/business-role.query';
import { Permission } from '../../commons/types';
import { CommonModule } from '@angular/common';
import { DirectiveModule } from '../../shared/directive.module';
import { RouterModule } from '@angular/router';
import { TableComponent } from '../../shared/components/table/table.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IMPORT_PERMISSION } from '../../commons/queries/permission.query';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent extends BaseClass {
  importPermissionForm!: FormGroup;
  constructor() {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: this.TableColumnType.NUMBER, },
      { name: 'Tên quyền', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Mã quyền', field: 'code', className: 'min-w-[100px] max-w-[100px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: this.TableColumnType.DATE },
      { name: 'Mô tả', field: 'description', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Type', field: 'type', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Action', field: 'action', className: 'min-w-[200px] max-w-[200px]' }
    ]
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.importPermissionForm = new FormGroup({
      permissionFile: new FormControl(null),
    });
    await this.onGetPermission();
  }

  async onGetPermission() {
    const response = await this.injector.get(ApiService).executeQuery<Permission[]>(GET_PERMISSIONS);
    this.dataSource = response?.permissions?.reduce((acc: any, item: any, index: number) => {
      acc.push({
        ...item,
        index: index + 1,
        status: item.isActive ? 'Kích hoạt' : 'Chưa kích hoạt',
      });
      return acc;
    }, []) ?? [];
    this.pagination = {
      ...this.pagination,
      page: 0,
      size: response?.permissions?.length ?? 20,
      total: response?.permissions?.length ?? 0
    }
  }

  async onImportPermission(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.injector.get(ApiService).executeMutation<Permission>(IMPORT_PERMISSION,
        {
          file
        }).then(async () => {
          this.importPermissionForm.reset();
          this.commonService.openSnackBar('Thêm chức năng thành công');
          await this.onGetPermission();
        }).catch(error => {
          this.commonService.openSnackBarError('Thêm chức năng thất bại');
          this.importPermissionForm.reset();
        });
    }
  }
}
