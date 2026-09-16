import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { BaseClass } from '../../commons/base.class';
import { TableComponent } from '../../shared/components/table/table.component';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { DirectiveModule } from '../../shared/directive.module';
import { TableColumnType } from '../../core/constants/enum';
import { storageKey } from '../../core/constants/storage-key';
import { ApiService } from '../../core/services/api.service';
import { PaginatedPurchaseOrderResponse, PurchaseOrder, PurchaseOrderStatus } from '../../commons/types';
import {
  GET_PURCHASE_ORDERS,
  DELETE_PURCHASE_ORDER,
  SUBMIT_PURCHASE_ORDER_FOR_APPROVAL,
  APPROVE_PURCHASE_ORDER,
  REJECT_PURCHASE_ORDER,
  GET_USERS_FOR_APPROVER,
} from '../../commons/queries/purchase-order.query';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { DialogNotificationComponent } from '../../shared/components/dialog-notification/dialog-notification.component';

type PurchaseOrderStatusDashboardItem = {
  status: PurchaseOrderStatus | '';
  label: string;
  icon: string;
  cardClass: string;
  iconClass: string;
  valueClass: string;
};

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    TableComponent,
    SelectSearchComponent,
    RouterModule,
    DirectiveModule,
    ReactiveFormsModule,
  ],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss'
})
export class PurchaseOrderComponent extends BaseClass {
  @ViewChild('expandedRowTemplate') expandedRowTemplate!: TemplateRef<any>;
  @ViewChild('deleteNotification') deleteNotification!: TemplateRef<any>;
  @ViewChild('submitApprovalDialogContent') submitApprovalDialogContent!: TemplateRef<any>;
  @ViewChild('rejectDialogContent') rejectDialogContent!: TemplateRef<any>;

  selectedItem: any = null;
  PurchaseOrderStatus = PurchaseOrderStatus;
  currentUserId: string = '';

  submitApprovalForm!: FormGroup;
  rejectForm!: FormGroup;
  approverList: any[] = [];
  approverSearchQuery = GET_USERS_FOR_APPROVER;

  statusCounts: Partial<Record<PurchaseOrderStatus, number>> = {};
  readonly statusDashboardItems: PurchaseOrderStatusDashboardItem[] = [
    {
      status: '',
      label: 'Tất cả PO',
      icon: 'shopping_cart',
      cardClass: 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white',
      iconClass: 'bg-indigo-100 text-indigo-700',
      valueClass: 'text-indigo-800',
    },
    {
      status: PurchaseOrderStatus.DRAFT,
      label: 'Nháp',
      icon: 'edit_note',
      cardClass: 'border-slate-200 bg-gradient-to-br from-slate-50 to-white',
      iconClass: 'bg-slate-200 text-slate-700',
      valueClass: 'text-slate-800',
    },
    {
      status: PurchaseOrderStatus.PENDING_APPROVAL,
      label: 'Chờ duyệt',
      icon: 'pending_actions',
      cardClass: 'border-orange-200 bg-gradient-to-br from-orange-50 to-white',
      iconClass: 'bg-orange-100 text-orange-700',
      valueClass: 'text-orange-800',
    },
    {
      status: PurchaseOrderStatus.CONFIRMED,
      label: 'Đã xác nhận',
      icon: 'verified',
      cardClass: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
      iconClass: 'bg-blue-100 text-blue-700',
      valueClass: 'text-blue-800',
    },
    {
      status: PurchaseOrderStatus.IN_PRODUCTION,
      label: 'Đang sản xuất',
      icon: 'precision_manufacturing',
      cardClass: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
      iconClass: 'bg-amber-100 text-amber-700',
      valueClass: 'text-amber-800',
    },
    {
      status: PurchaseOrderStatus.COMPLETED,
      label: 'Hoàn thành',
      icon: 'task_alt',
      cardClass: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
      iconClass: 'bg-emerald-100 text-emerald-700',
      valueClass: 'text-emerald-800',
    },
    {
      status: PurchaseOrderStatus.CANCELLED,
      label: 'Đã hủy',
      icon: 'cancel',
      cardClass: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white',
      iconClass: 'bg-rose-100 text-rose-700',
      valueClass: 'text-rose-800',
    },
  ];

  statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: PurchaseOrderStatus.DRAFT, label: 'Nháp' },
    { value: PurchaseOrderStatus.PENDING_APPROVAL, label: 'Chờ duyệt' },
    { value: PurchaseOrderStatus.CONFIRMED, label: 'Đã xác nhận' },
    { value: PurchaseOrderStatus.IN_PRODUCTION, label: 'Đang sản xuất' },
    { value: PurchaseOrderStatus.COMPLETED, label: 'Hoàn thành' },
    { value: PurchaseOrderStatus.CANCELLED, label: 'Đã hủy' },
  ];

  constructor(private dialog: MatDialog) {
    super();
    this.columns = [
      { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
      { name: 'Mã PO', field: 'poNumber', className: 'min-w-[160px] max-w-[160px]' },
      { name: 'Nhà máy SX', field: 'supplierName', className: 'min-w-[180px] max-w-[180px]' },
      { name: 'Ngày đặt', field: 'orderDate', className: 'min-w-[110px] max-w-[110px]' },
      { name: 'Yêu cầu giao', field: 'requestedDeliveryDate', className: 'min-w-[110px] max-w-[110px]' },
      { name: 'Tiền tệ', field: 'currency', className: 'min-w-[80px] max-w-[80px]' },
      { name: 'Sản phẩm', field: 'itemCount', className: 'text-center min-w-[90px] max-w-[90px]', type: TableColumnType.NUMBER },
      { name: 'Batch', field: 'batchCount', className: 'text-center min-w-[80px] max-w-[80px]', type: TableColumnType.NUMBER },
      { name: 'Trạng thái', field: 'statusName', className: 'min-w-[130px] max-w-[130px]', templateCode: 'statusColumnTemplate' },
      { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[110px] max-w-[110px]', type: TableColumnType.DATE },
      { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
    ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    const currentUser = JSON.parse(localStorage.getItem(storageKey.user) || '{}');
    this.currentUserId = currentUser?.id || '';

    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      status: new FormControl(''),
    });
    this.submitApprovalForm = new FormGroup({
      approverId: new FormControl('', [Validators.required]),
    });
    this.rejectForm = new FormGroup({
      rejectionReason: new FormControl(''),
    });
    await this.onGetData();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'Nháp';
      case PurchaseOrderStatus.PENDING_APPROVAL: return 'Chờ duyệt';
      case PurchaseOrderStatus.CONFIRMED: return 'Đã xác nhận';
      case PurchaseOrderStatus.IN_PRODUCTION: return 'Đang sản xuất';
      case PurchaseOrderStatus.COMPLETED: return 'Hoàn thành';
      case PurchaseOrderStatus.CANCELLED: return 'Đã hủy';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case PurchaseOrderStatus.PENDING_APPROVAL: return 'bg-orange-100 text-orange-800';
      case PurchaseOrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case PurchaseOrderStatus.IN_PRODUCTION: return 'bg-yellow-100 text-yellow-800';
      case PurchaseOrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case PurchaseOrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  isDraft(status: string): boolean {
    return status === PurchaseOrderStatus.DRAFT;
  }

  isPendingApproval(status: string): boolean {
    return status === PurchaseOrderStatus.PENDING_APPROVAL;
  }

  canApprove(item: any): boolean {
    return this.isPendingApproval(item.status) && item.approverId === this.currentUserId;
  }

  getStatusCount(status: PurchaseOrderStatus | ''): number {
    if (!status) {
      return Object.values(this.statusCounts).reduce((total, count) => total + (count ?? 0), 0);
    }

    return this.statusCounts[status] ?? 0;
  }

  async onStatusCardClick(status: PurchaseOrderStatus | ''): Promise<void> {
    this.filterForm.patchValue({ status });
    await this.onGetData();
  }

  getBatchStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return 'Nháp';
      case 'CREATED': return 'Đã tạo';
      case 'IN_PRODUCTION': return 'Đang sản xuất';
      case 'IN_TRANSIT': return 'Đang vận chuyển';
      case 'RECEIVED': return 'Đã nhận';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  }

  getBatchStatusClass(status: string): string {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'CREATED': return 'bg-slate-100 text-slate-700';
      case 'IN_PRODUCTION': return 'bg-yellow-100 text-yellow-700';
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-700';
      case 'RECEIVED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // Các bước theo dòng đời của batch (không tính CANCELLED - render tách riêng)
  readonly batchSteps: { key: string; label: string; icon: string }[] = [
    { key: 'DRAFT', label: 'Nháp', icon: 'edit_note' },
    { key: 'CREATED', label: 'Đã tạo', icon: 'assignment_turned_in' },
    { key: 'IN_PRODUCTION', label: 'Sản xuất', icon: 'precision_manufacturing' },
    { key: 'IN_TRANSIT', label: 'Vận chuyển', icon: 'local_shipping' },
    { key: 'RECEIVED', label: 'Đã nhận', icon: 'task_alt' },
  ];

  private getBatchStepIndex(status: string): number {
    return this.batchSteps.findIndex(step => step.key === status);
  }

  getBatchStepState(batchStatus: string, stepIndex: number): 'completed' | 'current' | 'pending' {
    if (batchStatus === 'CANCELLED') return 'pending';
    const currentIndex = this.getBatchStepIndex(batchStatus);
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  }

  getBatchStepCircleClass(batchStatus: string, stepIndex: number): string {
    const state = this.getBatchStepState(batchStatus, stepIndex);
    switch (state) {
      case 'completed':
      case 'current':
        return 'bg-green-500 border-green-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  }

  getBatchStepLineClass(batchStatus: string, stepIndex: number): string {
    if (batchStatus === 'CANCELLED') return 'bg-gray-200';
    const currentIndex = this.getBatchStepIndex(batchStatus);
    return stepIndex < currentIndex ? 'bg-green-500' : 'bg-gray-200';
  }

  getBatchStepLabelClass(batchStatus: string, stepIndex: number): string {
    const state = this.getBatchStepState(batchStatus, stepIndex);
    switch (state) {
      case 'completed':
      case 'current':
        return 'text-green-700 font-semibold';
      default:
        return 'text-gray-500';
    }
  }

  isBatchCancelled(status: string): boolean {
    return status === 'CANCELLED';
  }

  async onGetData(page: number = 1) {
    const statusValue = this.filterForm.value.status;
    const response = await this.injector.get(ApiService).executeQuery<PaginatedPurchaseOrderResponse>(
      GET_PURCHASE_ORDERS,
      {
        pagination: {
          page: page < 1 ? 1 : page,
          size: 20,
          keyword: this.filterForm.value.keyword ?? '',
          ...(statusValue ? { status: statusValue } : {}),
        },
      }
    );

    const purchaseOrders = response?.purchaseOrders as PaginatedPurchaseOrderResponse | undefined;
    this.statusCounts = purchaseOrders?.statusCounts?.reduce((counts, item) => {
      counts[item.status] = item.count;
      return counts;
    }, {} as Partial<Record<PurchaseOrderStatus, number>>) ?? {};

    this.dataSource = purchaseOrders?.data?.reduce((acc: any[], item: PurchaseOrder, index: number) => {
      const batchCount = (item.items || []).reduce(
        (total: number, poItem: any) => total + (poItem.batches?.length || 0),
        0
      );
      acc.push({
        ...item,
        index: (page - 1) * 20 + index + 1,
        supplierName: item.supplier?.name || '',
        itemCount: item.items?.length || 0,
        batchCount,
        statusName: this.getStatusLabel(item.status),
      });
      return acc;
    }, []) ?? [];

    this.pagination = {
      ...this.pagination,
      page: (purchaseOrders?.pagination?.page ?? 1) - 1,
      size: purchaseOrders?.pagination?.size ?? 20,
      total: purchaseOrders?.pagination?.total ?? 0,
    };
  }

  async onPageChange(event: PageEvent) {
    await this.onGetData(event.pageIndex + 1);
  }

  onCreatePO() {
    this.injector.get(Router).navigate(['/purchase-order/create']);
  }

  onViewPO(item: any) {
    this.injector.get(Router).navigate(['/purchase-order', item.id]);
  }

  async onDelete(item: any) {
    this.selectedItem = item;
    const dialogRef = this.injector.get(MatDialog).open(DialogNotificationComponent, {
      disableClose: true,
      data: {
        title: 'Xác nhận xóa',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });
    dialogRef.componentInstance.content = this.deleteNotification;
    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(
          DELETE_PURCHASE_ORDER,
          { id: this.selectedItem.id }
        );
        if (response) {
          this.commonService.openSnackBar('Xóa đơn đặt hàng thành công');
          await this.onGetData(
            this.dataSource.length === 1 && this.pagination.page > 0
              ? this.pagination.page
              : this.pagination.page + 1
          );
        } else {
          this.commonService.openSnackBarError('Xóa đơn đặt hàng thất bại');
        }
      }
    });
  }

  onOpenSubmitApprovalDialog(item: any) {
    this.selectedItem = item;
    this.submitApprovalForm.reset({ approverId: '' });
    const dialogRef = this.injector.get(MatDialog).open(DialogComponent, {
      data: {
        title: `Gửi duyệt PO: ${item.poNumber}`,
        confirmText: 'Gửi duyệt',
        showActions: false,
      },
      width: '520px'
    });
    dialogRef.componentInstance.content = this.submitApprovalDialogContent;
  }

  async onConfirmSubmitApproval() {
    this.submitApprovalForm.markAllAsTouched();
    if (this.submitApprovalForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng chọn người duyệt');
      return;
    }

    const response = await this.injector.get(ApiService).executeMutation(
      SUBMIT_PURCHASE_ORDER_FOR_APPROVAL,
      {
        id: this.selectedItem.id,
        approverId: this.submitApprovalForm.value.approverId,
      }
    );

    if (response) {
      this.commonService.openSnackBar('Đã gửi PO đi duyệt');
      this.injector.get(MatDialog).closeAll();
      await this.onGetData(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Gửi PO đi duyệt thất bại');
    }
  }

  onCancelDialog() {
    this.injector.get(MatDialog).closeAll();
  }

  async onApprove(item: any) {
    this.selectedItem = item;
    const dialogRef = this.injector.get(MatDialog).open(DialogNotificationComponent, {
      disableClose: true,
      data: {
        title: 'Xác nhận duyệt PO',
        message: `Bạn có chắc muốn duyệt PO ${item.poNumber}?`,
        confirmText: 'Duyệt',
        cancelText: 'Hủy'
      }
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroyRef)).subscribe(async result => {
      if (result) {
        const response = await this.injector.get(ApiService).executeMutation(
          APPROVE_PURCHASE_ORDER,
          { id: this.selectedItem.id }
        );
        if (response) {
          this.commonService.openSnackBar('Duyệt PO thành công');
          await this.onGetData(this.pagination.page + 1);
        } else {
          this.commonService.openSnackBarError('Duyệt PO thất bại');
        }
      }
    });
  }

  onOpenRejectDialog(item: any) {
    this.selectedItem = item;
    this.rejectForm.reset({ rejectionReason: '' });
    const dialogRef = this.injector.get(MatDialog).open(DialogComponent, {
      data: {
        title: `Từ chối PO: ${item.poNumber}`,
        confirmText: 'Từ chối',
        showActions: false,
      },
      width: '520px'
    });
    dialogRef.componentInstance.content = this.rejectDialogContent;
  }

  async onConfirmReject() {
    const response = await this.injector.get(ApiService).executeMutation(
      REJECT_PURCHASE_ORDER,
      {
        id: this.selectedItem.id,
        rejectionReason: this.rejectForm.value.rejectionReason || null,
      }
    );

    if (response) {
      this.commonService.openSnackBar('Đã từ chối PO');
      this.injector.get(MatDialog).closeAll();
      await this.onGetData(this.pagination.page + 1);
    } else {
      this.commonService.openSnackBarError('Từ chối PO thất bại');
    }
  }

}
