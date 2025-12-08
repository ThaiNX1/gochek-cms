import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import * as _ from 'lodash';
import { BaseClass } from '../../commons/base.class';
import { CREATE_BUSINESS_ROLE, DELETE_BUSINESS_ROLE, GET_BUSINESS_ROLES, UPDATE_BUSINESS_ROLE } from '../../commons/queries/business-role.query';
import { GET_PERMISSIONS } from '../../commons/queries/permission.query';
import { ApiService } from '../../core/services/api.service';
import { DialogComponent, DialogData } from "../../shared/components/dialog/dialog.component";
import { constant } from '../../core/constants/constant';
import { MatSelectModule } from '@angular/material/select';
import { RoleCode } from '../../commons/types';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { GET_ORGANIZATIONS } from '../../commons/queries/organization.query';
import { DirectiveModule } from '../../shared/directive.module';
@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatListModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSelectModule,
    SelectSearchComponent,
    DirectiveModule
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss'
})
export class RoleComponent extends BaseClass {
  @ViewChild('roleDialogContent') roleDialogContent!: TemplateRef<any>;
  organizations: any[] = [];
  orgSearchQuery = GET_ORGANIZATIONS;
  roleForm!: FormGroup;
  newRoleForm!: FormGroup;
  permissions!: FormArray;
  dialogData: DialogData = {
    title: 'Thêm role',
    showActions: false,
    showCloseButton: true,
    width: '500px',
    align: 'center',
    type: 'default'
  }
  roleCodes = constant.roleCodes;

  constructor(private dialog: MatDialog) {
    super();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    this.roleForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl(''),
      permissions: new FormArray([]),
    });
    this.newRoleForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      organizationId: new FormControl(''),
    });
    this.permissions = this.roleForm.get('permissions') as FormArray;
    this.onChangeSelectedRole();
    await Promise.all([
      this.getPermissions(),
      this.getRoles()
    ]);
  }

  getPermissionActions(permissionIndex: number) {
    return this.permissions.at(permissionIndex).get('actions') as FormArray;
  }

  async getPermissions() {
    const response = await this.injector.get(ApiService).executeQuery(GET_PERMISSIONS);
    const _permissionsGroup = _.groupBy(response?.permissions, 'code');
    Object.keys(_permissionsGroup).forEach(key => {
      const _permissions = _permissionsGroup[key];
      const actions: any = new FormArray([]);
      for (const permission of _permissions) {
        actions.push(new FormGroup({
          id: new FormControl(permission.id),
          action: new FormControl(permission.action),
          name: new FormControl(permission.description || ''),
          checked: new FormControl(false)
        }));
      }
      const permissionGroup = new FormGroup({
        code: new FormControl(key),
        name: new FormControl(_permissions[0].name),
        actions: actions
      });
      this.permissions.push(permissionGroup);
    });
  }

  async getRoles(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery(GET_BUSINESS_ROLES, {
      variables: {
        pagination: {
          page: page,
          limit: 10,
          keyword: this.filterForm.get('keyword')?.value,
        },
      }
    });
    this.dataSource = response?.businessRoles?.data || [];
    this.pagination = {
      ...this.pagination,
      page: (response?.businessRoles?.pagination?.page ?? 1) - 1,
      size: response?.businessRoles?.pagination?.size ?? 10,
      total: response?.businessRoles?.pagination?.total ?? 0,
    }
  }

  onChangeSelectedRole() {
    this.roleForm.controls['id'].valueChanges.subscribe(value => {
      const role = this.dataSource.find(item => item.id === value[0]);
      if (role) {
        this.roleForm.patchValue({
          name: role.name,
        });
        this.permissions.controls.forEach((permission: any) => {
          permission.get('actions')?.controls.forEach((action: any) => {
            const actionPermission = role.permissions.find((item: string) => item === action.get('action')?.value);
            action.get('checked')?.setValue(!!actionPermission);
          });
        });
      }
    });
  }

  async onPageChange(event: PageEvent) {
    await this.getRoles(event.pageIndex + 1);
  }

  async onSavePermission() {
    if (!this.roleForm.value.id?.[0]) {
      this.commonService.openSnackBarError('Vui lòng chọn vai trò');
      return;
    }
    const permissions: string[] = []
    this.permissions.controls.forEach((permission: any) => {
      permission.get('actions')?.controls.forEach((action: any) => {
        if (action.get('checked')?.value) {
          permissions.push(action.get('action')?.value);
        }
      });
    });
    const response = await this.injector.get(ApiService).executeMutation(UPDATE_BUSINESS_ROLE, {
      id: this.roleForm.value.id?.[0],
      input: {
        permissions
      }
    });
    if (response) {
      this.commonService.openSnackBar('Cập nhật quyền thành công');
      const roleIndex = this.dataSource.findIndex(item => item.id === this.roleForm.value.id?.[0]);
      if (roleIndex !== -1) {
        this.dataSource[roleIndex] = response.updateBusinessRole;
      }
    }
    else {
      this.commonService.openSnackBarError('Cập nhật quyền thất bại');
    }
  }

  onAddRole() {
    this.newRoleForm.reset();
    this.newRoleForm.patchValue({
      code: RoleCode.ORGANIZATION_ADMIN
    });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: this.dialogData,
      width: this.dialogData.width
    });

    dialogRef.componentInstance.content = this.roleDialogContent;
  }

  async saveNewRole() {
    this.newRoleForm.markAllAsTouched();
    if (this.newRoleForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      const response = await this.injector.get(ApiService).executeMutation(CREATE_BUSINESS_ROLE, {
        input: {
          name: this.newRoleForm.get('name')?.value,
          code: this.newRoleForm.get('code')?.value,
          permissions: []
        }
      });

      if (response) {
        this.commonService.openSnackBar('Thêm role thành công');
        this.dialog.closeAll();
        await this.getRoles();
      } else {
        this.commonService.openSnackBarError('Thêm role thất bại');
      }
    } catch (error) {
      this.commonService.openSnackBarError('Có lỗi xảy ra');
    }
  }

  onCancel() {
    this.dialog.closeAll();
  }

  async onDeleteRole() {
    const roleId = this.roleForm.value.id?.[0];
    if (!roleId) {
      this.commonService.openSnackBarError('Vui lòng chọn role cần xóa');
      return;
    }

    const selectedRole = this.dataSource.find(item => item.id === roleId);
    const confirmDialogData: DialogData = {
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa role "${selectedRole?.name}"?`,
      showActions: true,
      showCloseButton: false,
      confirmText: 'Xóa',
      cancelText: 'Không',
      width: '400px',
      align: 'center',
      type: 'error'
    };

    const dialogRef = this.dialog.open(DialogComponent, {
      data: confirmDialogData,
      width: confirmDialogData.width
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const response = await this.injector.get(ApiService).executeMutation(DELETE_BUSINESS_ROLE, {
            id: roleId
          });

          if (response?.deleteBusinessRole) {
            this.commonService.openSnackBar('Xóa role thành công');
            this.roleForm.patchValue({ id: '' });
            await this.getRoles();
          } else {
            this.commonService.openSnackBarError('Xóa role thất bại');
          }
        } catch (error) {
          this.commonService.openSnackBarError('Có lỗi xảy ra khi xóa role');
        }
      }
    });
  }

  displayFn(comp: any){
    return comp?.productType?.name || comp?.poCode || '';
  }
}
