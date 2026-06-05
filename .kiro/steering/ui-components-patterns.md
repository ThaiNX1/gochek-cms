# UI Components & Patterns

## Layout chuẩn của một Feature Page

```html
<!-- Wrapper chính - class này được set sẵn từ BaseClass host -->
<div class="flex-1 flex flex-col items-stretch justify-start overflow-auto gray-500-scroll gap-3">

  <!-- Header: tiêu đề + filter + actions -->
  <div class="flex items-center justify-between px-4">
    <div class="flex-1 flex flex-col md:flex-row items-center justify-start gap-3">
      <h1 class="text-xl font-bold">Danh sách [tên feature]</h1>

      <!-- Filter form -->
      <form [formGroup]="filterForm"
        class="flex flex-col md:flex-row items-stretch md:items-center justify-start gap-3">
        <mat-form-field appearance="outline" floatLabel="auto" class="w-full md:w-[300px] bg-white">
          <input matInput formControlName="keyword" placeholder="Nhập để tìm kiếm" />
        </mat-form-field>
        <button type="button"
          class="flex items-center justify-center gap-2 px-3 bg-primary text-white font-semibold"
          (click)="onGetData()">
          Tìm kiếm
        </button>
      </form>
    </div>

    <!-- Action button (thêm mới, import...) -->
    <button *permission="[PermissionEnum.FEATURE_MANAGE]"
      class="flex items-center justify-center gap-2 px-3 bg-primary text-white font-semibold"
      (click)="onOpenCreateDialog()">
      <mat-icon>add</mat-icon>
      Thêm mới
    </button>
  </div>

  <!-- Table -->
  <app-table
    class="flex-1 flex flex-col items-stretch justify-start overflow-auto bg-white rounded-md border border-gray-400 p-4"
    [columns]="displayedColumns"
    [dataSource]="dataSource"
    [pagination]="pagination"
    (pageChange)="onPageChange($event)">
  </app-table>
</div>
```

## app-table Component

```typescript
// Khai báo columns trong constructor
this.columns = [
  { name: 'STT', field: 'index', className: 'text-center min-w-[50px] max-w-[50px]', type: TableColumnType.NUMBER },
  { name: 'Tên', field: 'name', className: 'min-w-[200px] max-w-[200px]' },
  { name: 'Ngày tạo', field: 'createdAt', className: 'min-w-[150px] max-w-[150px]', type: TableColumnType.DATE },
  { name: 'Trạng thái', field: 'statusName', className: 'min-w-[150px] max-w-[150px]', templateCode: 'statusColumnTemplate' },
  { name: 'Hành động', field: 'action', className: 'min-w-[100px] max-w-[100px]', templateCode: 'actionColumnTemplate' },
];
```

Column types có sẵn: `TableColumnType.NUMBER`, `DATE`, `DATE_TIME`, `FULL_TIME`, `SHORT_TIME`, `IMAGE`

Dùng `templateCode` cho các cột cần render custom HTML.

## Custom Column Templates

Đặt `<ng-template>` với directive `myTemplate` ở cuối file HTML:

```html
<!-- Status badge -->
<ng-template myTemplate tempCode="statusColumnTemplate" let-item="item">
  <div class="flex items-center justify-center px-4">
    @if(item.isActive) {
      <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium whitespace-nowrap">Hoạt động</span>
    } @else {
      <span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium whitespace-nowrap">Không hoạt động</span>
    }
  </div>
</ng-template>

<!-- Action buttons -->
<ng-template myTemplate tempCode="actionColumnTemplate" let-item="item">
  <div *permission="[PermissionEnum.FEATURE_MANAGE]" class="flex items-center justify-start px-4 gap-3">
    <button class="flex items-center justify-center border-none bg-transparent" title="Chỉnh sửa"
      (click)="onEdit(item)">
      <mat-icon class="text-gray-500">drive_file_rename_outline</mat-icon>
    </button>
    <button class="flex items-center justify-center border-none bg-transparent" title="Xóa"
      (click)="onDelete(item)">
      <mat-icon class="text-red-500">delete</mat-icon>
    </button>
  </div>
</ng-template>
```

## Status Badge Colors

| Trạng thái | Class |
|-----------|-------|
| Thành công / Hoạt động | `bg-green-100 text-green-800` |
| Lỗi / Không hoạt động | `bg-red-100 text-red-800` |
| Cảnh báo / Chờ xử lý | `bg-yellow-100 text-yellow-800` |
| Thông tin | `bg-blue-100 text-blue-800` |

## Dialog Pattern

### Mở dialog với template content

```typescript
// Component TS
@ViewChild('createDialogContent') createDialogContent!: TemplateRef<any>;
createForm!: FormGroup;

onOpenCreateDialog() {
  this.createForm.reset();
  const dialogRef = this.injector.get(MatDialog).open(DialogComponent, {
    data: {
      title: 'Thêm mới',
      confirmText: 'Lưu',
      showActions: false,  // false = tự quản lý buttons trong template
    },
    width: '600px'
  });
  dialogRef.componentInstance.content = this.createDialogContent;
}

onCancel() {
  this.injector.get(MatDialog).closeAll();
}
```

```html
<!-- Template dialog content -->
<ng-template #createDialogContent>
  <form [formGroup]="createForm" class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label class="require">Tên:</label>
      <mat-form-field appearance="outline" floatLabel="auto">
        <input matInput formControlName="name" placeholder="Nhập tên">
      </mat-form-field>
    </div>
  </form>
  <div class="flex items-stretch justify-center gap-3 pt-3">
    <button class="w-full md:w-[100px] flex items-center justify-center gap-2 p-3 rounded-md border-none bg-gray-400"
      type="button" (click)="onCancel()">
      <mat-icon class="text-white text-xl">cancel</mat-icon>
      <span class="text-white font-semibold">Hủy</span>
    </button>
    <button class="w-full md:w-[100px] flex items-center justify-center gap-2 p-3 rounded-md border-none bg-primary"
      type="button" (click)="onSave()">
      <mat-icon class="text-white text-xl">save</mat-icon>
      <span class="text-white font-semibold">Lưu</span>
    </button>
  </div>
</ng-template>
```

### Confirmation dialog (xóa)

```typescript
@ViewChild('deleteNotification') deleteNotification!: TemplateRef<any>;
selectedItem: any = null;

onDelete(item: any) {
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
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // thực hiện xóa
    }
  });
}
```

```html
<ng-template #deleteNotification>
  <p>Bạn có chắc muốn xóa <strong>{{selectedItem?.name}}</strong>?</p>
</ng-template>
```

## app-select-search Component

Dùng cho dropdown có tìm kiếm, hỗ trợ GraphQL search:

```html
<app-select-search
  class="w-full md:w-[200px] bg-white"
  [options]="optionList"
  formControlName="fieldId"
  [valueKey]="'id'"
  [labelKey]="'name'"
  [searchQuery]="GET_ITEMS_QUERY"
  [searchDataKey]="'items'"
  placeholder="Chọn...">
</app-select-search>
```

## Form Fields

Luôn dùng `appearance="outline"` cho Material form fields:

```html
<mat-form-field appearance="outline" floatLabel="auto">
  <input matInput formControlName="fieldName" placeholder="Placeholder">
</mat-form-field>
```

Label bắt buộc dùng class `require`:
```html
<label class="require">Tên trường:</label>
```

## Permission Directive

```html
<!-- Ẩn/hiện element theo permission -->
<button *permission="[PermissionEnum.DEVICES_MANAGE]">...</button>

<!-- Nhiều permissions (OR logic) -->
<div *permission="[PermissionEnum.DEVICES_READ, PermissionEnum.DEVICES_MANAGE]">...</div>
```

## Responsive

- Dùng Tailwind breakpoint `md:` cho responsive
- Layout mobile: `flex-col`, desktop: `md:flex-row`
- Width cố định: `w-full md:w-[300px]`
