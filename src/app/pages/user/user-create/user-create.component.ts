import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseClass } from '../../../commons/base.class';
import { GET_BUSINESS_ROLES } from '../../../commons/queries/business-role.query';
import { GET_ORGANIZATIONS } from '../../../commons/queries/organization.query';
import { CREATE_USER, GET_USER, GET_USERS, UPDATE_USER } from '../../../commons/queries/user.query';
import { PaginatedBusinessRoleResponse, PaginatedOrganizationResponse, PaginatedUserResponse, User } from '../../../commons/types';
import { MaterialModule } from '../../../core/material.module';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';
import { DirectiveModule } from '../../../shared/directive.module';
@Component({
  selector: 'app-user-create',
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
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent extends BaseClass {
  queryParams: any;
  rooms: any[] = [];
  userForm!: FormGroup;
  roles: any[] = [];
  organizations: any[] = [];
  users: any[] = [];
  orgSearchQuery = GET_ORGANIZATIONS;
  roleSearchQuery = GET_BUSINESS_ROLES;
  userSearchQuery = GET_USER;
  constructor() {
    super();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.userForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      roleIds: new FormControl(null, [Validators.required]),
      organizationId: new FormControl(''),
      isActive: new FormControl(true)
    });
    this.injector.get(ActivatedRoute).params.subscribe(async (params: any) => {
      this.queryParams = params;
      if (params.id && params.id !== 'create') {
        await this.getUser(params.id);
      }
    });
    await Promise.all([
      this.getRoles(),
      this.hasPermission([this.PermissionEnum.ORGANIZATIONS_MANAGE]) && this.getOrganizations(),
      this.hasPermission([this.PermissionEnum.USERS_MANAGE]) && this.getUsers(),
    ]);
  }

  async getRoles() {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedBusinessRoleResponse>(GET_BUSINESS_ROLES, {
      pagination: {
        page: 1,
        size: 10,
        keyword: '',
      }
    });
    this.roles = response?.businessRoles?.data || [];
  }

  async getOrganizations() {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedOrganizationResponse>(GET_ORGANIZATIONS, {
      pagination: {
        page: 1,
        size: 10,
        keyword: '',
      }
    });
    this.organizations = response?.organizations?.data || [];
  }

  async getUsers() {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedUserResponse>(GET_USERS,
      {
        pagination: {
          page: 1,
          size: 10,
          keyword: '',
        }
      }
    );
    this.users = response?.users?.data || [];
  }

  async getUser(id: string) {
    const response = await this.injector.get(ApiService).executeQuery<User>(GET_USER, {
      id: id,
    });
    this.userForm.patchValue({
      id: response?.user?.id,
      name: response?.user?.name,
      email: response?.user?.email,
      roleIds: response?.user?.roles?.map((role: any) => role.id) || null,
      organizationId: response?.user?.organization?.id,
      isActive: response?.user?.isActive
    });
  }

  async onSave() {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) {
      this.injector.get(CommonService).openSnackBarError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    let input: any = {
      name: this.userForm.value.name,
      email: this.userForm.value.email,
      roleIds: this.userForm.value.roleIds,
      isActive: this.userForm.value.isActive
    }
    if (this.hasPermission([this.PermissionEnum.ORGANIZATIONS_MANAGE])) {
      input.organizationId = this.userForm.value.organizationId;
    }
    const response = this.userForm.value.id
      ? await this.injector.get(ApiService).executeMutation<User>(UPDATE_USER,
        {
          id: this.userForm.value.id,
          input: input,
        })
      : await this.injector.get(ApiService).executeMutation<User>(CREATE_USER,
        { input: input });
    if (response) {
      this.injector.get(CommonService).openSnackBar(this.userForm.value.id ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
      this.injector.get(Router).navigate(['/user']);
    } else {
      this.injector.get(CommonService).openSnackBarError(this.userForm.value.id ? 'Cập nhật người dùng thất bại' : 'Thêm người dùng thất bại');
    }
  }
}
