# Routing & Permissions

## Thêm Route mới

Tất cả routes của app được khai báo trong `src/app/layout/layout-routing.module.ts`.

### Route đơn giản (không cần guard)

```typescript
// layout-routing.module.ts
import { FeatureComponent } from '../pages/feature/feature.component';

{
  path: 'feature',
  component: FeatureComponent,
},
```

### Route có permission guard

```typescript
{
  path: 'feature',
  component: FeatureComponent,
  canActivate: [PageGuard],
  data: {
    permissions: [PermissionAction.MANAGE],
    // hoặc nhiều actions: [PermissionAction.MANAGE, PermissionAction.READ]
  },
},
```

### Route có sub-page (detail/create)

```typescript
{
  path: 'feature',
  component: FeatureComponent,
},
{
  path: 'feature/:id',
  component: FeatureCreateComponent,
},
```

### Lazy load (cho component ít dùng)

```typescript
{
  path: 'feature/create',
  loadComponent: () => import('../pages/feature/feature-create/feature-create.component')
    .then(m => m.FeatureCreateComponent),
},
```

## Permission System

### PermissionEnum

Tất cả permissions được định nghĩa trong `src/app/core/constants/enum.ts`.

Cấu trúc: `RESOURCE_ACTION` (ví dụ: `DEVICES_MANAGE`, `USERS_READ`)

Actions chuẩn cho mỗi resource:
- `READ` - Xem danh sách
- `CREATE` - Tạo mới
- `UPDATE` - Cập nhật
- `DELETE` - Xóa
- `MANAGE` - Toàn quyền (bao gồm tất cả)

### Thêm Permission mới

Khi tạo feature mới, thêm vào `enum.ts`:

```typescript
export enum PermissionEnum {
  // ... existing permissions

  // Feature permissions
  FEATURE_READ = 'feature:read',
  FEATURE_CREATE = 'feature:create',
  FEATURE_UPDATE = 'feature:update',
  FEATURE_DELETE = 'feature:delete',
  FEATURE_MANAGE = 'feature:manage',
}
```

### Dùng Permission trong Template

```html
<!-- Ẩn button nếu không có quyền -->
<button *permission="[PermissionEnum.FEATURE_MANAGE]">Thêm mới</button>

<!-- Ẩn cột action trong bảng -->
<ng-template myTemplate tempCode="actionColumnTemplate" let-item="item">
  <div *permission="[PermissionEnum.FEATURE_MANAGE]" class="flex items-center justify-start px-4 gap-3">
    ...
  </div>
</ng-template>

<!-- Filter dropdown chỉ hiện với quyền nhất định -->
<app-select-search *permission="[PermissionEnum.ORGANIZATIONS_MANAGE]" ...>
</app-select-search>
```

### Kiểm tra Permission trong TypeScript

```typescript
// Dùng method từ BaseClass
if (this.hasPermission([PermissionEnum.FEATURE_MANAGE])) {
  // thực hiện action
}
```

## Navigation

### Điều hướng bằng RouterLink

```html
<a [routerLink]="['/feature', item.id]">Chi tiết</a>
```

### Điều hướng bằng Router service

```typescript
import { Router } from '@angular/router';

// Inject qua injector
this.injector.get(Router).navigate(['/feature', id]);
```

## Sidebar Menu

Menu sidebar được quản lý trong layout component. Khi thêm feature mới, cần thêm menu item tương ứng vào sidebar với:
- `path`: đường dẫn route
- `icon`: Material icon name
- `label`: Tên hiển thị (tiếng Việt)
- `permission`: Permission cần có để thấy menu item
