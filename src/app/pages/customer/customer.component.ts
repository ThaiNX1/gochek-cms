import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs';
import { BaseClass } from '../../commons/base.class';
import { GET_CUSTOMERS, UPDATE_CUSTOMER_STATUS } from '../../commons/queries/customer.query';
import { Customer, CustomerStatus, PaginatedCustomerResponse, UpdateCustomerStatusInput } from '../../commons/types';
import { TableColumnType } from '../../core/constants/enum';
import { ApiService } from '../../core/services/api.service';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { DirectiveModule } from '../../shared/directive.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss',
  host: {
    class: 'flex-1 flex flex-col items-stretch justify-start overflow-auto'
  }
})
export class CustomerComponent extends BaseClass {
  @ViewChild('customerDialogContent') customerDialogContent!: TemplateRef<any>;
  
  dialogData: DialogData = {
    title: 'Xác nhận',
    showActions: true,
    showCloseButton: true,
    width: '600px',
    align: 'center',
    type: 'error',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
  };

  customerStatuses = [
    { value: CustomerStatus.NEW, label: 'Mới' },
    { value: CustomerStatus.CONTACTED, label: 'Đã liên hệ' },
    { value: CustomerStatus.CONVERTED, label: 'Đã chuyển đổi' },
    { value: CustomerStatus.REJECTED, label: 'Từ chối' },
  ];

  selectedStatus: CustomerStatus | null = null;
  currentCustomer: Customer | null = null;

  customerForm!: FormGroup;

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Họ và tên', field: 'fullName', className: 'min-w-[200px] max-w-[200px]' },
      { name: 'Số điện thoại', field: 'phone', className: 'min-w-[150px] max-w-[150px]', templateCode: 'phoneColumnTemplate' },
      { name: 'Nguồn', field: 'source', className: 'min-w-[120px] max-w-[120px]' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'CSKH', field: 'assignedToId', className: 'min-w-[120px] max-w-[120px]', type: TableColumnType.DATE },
      { name: 'Trạng thái', field: 'status', className: 'min-w-[150px] max-w-[150px]', templateCode: 'statusColumnTemplate' },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
    this.customerForm = new FormGroup({
      note: new FormControl(''),
    });
    await this.onGetCustomers();
  }

  async onGetCustomers(page: number = 1) {
    const response = await this.injector.get(ApiService).executeQuery<PaginatedCustomerResponse>(GET_CUSTOMERS, {
      pagination: {
        page: page,
        size: 20,
        search: this.filterForm.value.keyword ?? '',
      },
    });
    
    this.dataSource = response?.customers?.data?.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
      description: item.description?.replace(/;/g, '\n'),
      noteForm: new FormGroup({
        status: new FormControl(item.status, Validators.required),
        note: new FormControl(item.note ?? '', Validators.required),
      }),
      isNoteSaving: false,
    })) ?? [];
    
    this.pagination = {
      ...this.pagination,
      page: (response?.customers?.pagination?.page ?? 1) - 1,
      size: response?.customers?.pagination?.size ?? 20,
      total: response?.customers?.pagination?.total ?? 0
    };
  }

  onPageChange(event: PageEvent) {
    this.onGetCustomers(event.pageIndex + 1);
  }

  getStatusLabel(status: CustomerStatus): string {
    const statusItem = this.customerStatuses.find(s => s.value === status);
    return statusItem?.label ?? status;
  }

  getStatusClass(status: CustomerStatus): string {
    switch (status) {
      case CustomerStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case CustomerStatus.CONTACTED:
        return 'bg-yellow-100 text-yellow-800';
      case CustomerStatus.CONVERTED:
        return 'bg-green-100 text-green-800';
      case CustomerStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  async onSaveNote(item: any) {
    item.noteForm.markAllAsTouched();
    if (item.noteForm.invalid) {
      return;
    }
    item.isNoteSaving = true;
    await this.updateCustomerStatus(item, item.noteForm.value.status, item.noteForm.value.note);
  }

  onChangeStatus(item: Customer) {
    this.currentCustomer = item;
    this.selectedStatus = item.status;
    
    this.dialogData.type = 'error';
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        ...this.dialogData,
        title: 'Thay đổi trạng thái khách hàng',
        confirmText: 'Xác nhận',
        message: `Thay đổi trạng thái cho khách hàng "${item.fullName}"`,
        showActions: true,
      },
      width: this.dialogData.width
    });
    dialogRef.componentInstance.content = this.customerDialogContent;

    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result && this.selectedStatus && this.currentCustomer) {
        await this.updateCustomerStatus(this.currentCustomer, this.selectedStatus);
      }
      this.currentCustomer = null;
      this.selectedStatus = null;
    });
  }

  async updateCustomerStatus(customer: any, newStatus: CustomerStatus, note?: string) {
    let input: UpdateCustomerStatusInput = {
      customerId: customer.id,
      status: newStatus,
    };
    if (note) {
      input.note = note;
    }
    const response = await this.injector.get(ApiService).executeMutation(
      UPDATE_CUSTOMER_STATUS,
      {
        input
      }
    );

    if (response) {
      this.commonService.openSnackBar(`Cập nhật trạng thái khách hàng thành công`);
      // await this.onGetCustomers(this.pagination.page + 1);
      if(response?.updateCustomerStatus){
        const index = this.dataSource.findIndex((item: any) => item.id === customer.id);
        if(index !== -1){
          const item = this.dataSource[index];
          item.noteForm.patchValue({
            status: response.updateCustomerStatus.status,
            note: response.updateCustomerStatus.note
          });
          
          const updatedItem = {
            ...item,
            status: response.updateCustomerStatus.status,
            note: response.updateCustomerStatus.note,
            isNoteSaving: false,
          };
          
          this.dataSource = [
            ...this.dataSource.slice(0, index),
            updatedItem,
            ...this.dataSource.slice(index + 1)
          ];
        }
      }
    } else {
      this.commonService.openSnackBarError(`Cập nhật trạng thái khách hàng thất bại`);
    }
  }

  onCall3cx(phone: string) {
    if (!phone) {
      this.commonService.openSnackBarError('Số điện thoại không hợp lệ');
      return;
    }
    // Open 3cx call link
    window.location.href = `3cx://call/${phone}`;
  }
}
