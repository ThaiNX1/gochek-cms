# GraphQL & API Patterns

## GraphQL Query Files

Tất cả GraphQL queries/mutations/subscriptions đặt trong `src/app/commons/queries/`:

```
commons/queries/
├── device.query.ts
├── device-type.query.ts
├── organization.query.ts
├── user.query.ts
└── ...
```

Mỗi file export các `gql` constants:

```typescript
// commons/queries/feature.query.ts
import { gql } from 'apollo-angular';

export const GET_FEATURES = gql`
  query GetFeatures($pagination: FeatureSearchInput) {
    features(pagination: $pagination) {
      pagination { page size total totalPages }
      data {
        id
        name
        isActive
        createdAt
      }
    }
  }
`;

export const CREATE_FEATURE = gql`
  mutation CreateFeature($input: CreateFeatureInput!) {
    createFeature(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_FEATURE = gql`
  mutation UpdateFeature($id: ID!, $input: UpdateFeatureInput!) {
    updateFeature(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_FEATURE = gql`
  mutation DeleteFeature($id: ID!) {
    deleteFeature(id: $id)
  }
`;
```

## Gọi API trong Component

Luôn dùng `this.injector.get(ApiService)` và `async/await`:

### Query (lấy danh sách có phân trang)

```typescript
async onGetData(page: number = 1) {
  const response = await this.injector.get(ApiService).executeQuery<PaginatedFeatureResponse>(
    GET_FEATURES,
    {
      pagination: {
        page: page < 1 ? 1 : page,
        size: 20,
        keyword: this.filterForm.value.keyword ?? '',
      },
    }
  );

  this.dataSource = response?.features?.data?.reduce((acc: any, item: any, index: number) => {
    acc.push({
      ...item,
      index: index + 1,
      // map thêm các field hiển thị
    });
    return acc;
  }, []) ?? [];

  this.pagination = {
    ...this.pagination,
    page: (response?.features?.pagination?.page ?? 1) - 1,
    size: response?.features?.pagination?.size ?? 20,
    total: response?.features?.pagination?.total ?? 0,
  };
}
```

### Mutation (tạo/sửa/xóa)

```typescript
async onSave() {
  this.form.markAllAsTouched();
  if (this.form.invalid) {
    this.commonService.openSnackBarError('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  const response = await this.injector.get(ApiService).executeMutation(
    UPDATE_FEATURE,
    {
      id: this.form.value.id,
      input: {
        name: this.form.value.name,
      },
    }
  );

  if (response) {
    this.commonService.openSnackBar('Lưu thành công');
    this.injector.get(MatDialog).closeAll();
    await this.onGetData(this.pagination.page);
  } else {
    this.commonService.openSnackBarError('Lưu thất bại');
  }
}
```

### Subscription (real-time)

```typescript
this.injector.get(ApiService)
  .executeSubscription(SUBSCRIBE_FEATURE_PROGRESS, { id: featureId })
  .pipe(takeUntil(this.destroyRef))
  .subscribe(data => {
    // xử lý real-time data
  });
```

### File Upload (multipart)

```typescript
const response = await this.injector.get(ApiService).executeMutation(
  IMPORT_FEATURE,
  { file, importId },
  true  // multipart = true
);
```

## REST API (dùng khi không có GraphQL)

```typescript
// GET
const data = await this.injector.get(ApiService).asyncGet<ResponseType>('endpoint');

// POST
const data = await this.injector.get(ApiService).asyncPost<ResponseType>('endpoint', body);
```

## Pagination

Pagination object chuẩn từ `BaseClass`:

```typescript
pagination = {
  page: 1,   // 1-indexed từ API, nhưng Material Paginator dùng 0-indexed
  size: 20,
  total: 0,
};
```

Khi nhận response: `page = (apiPage ?? 1) - 1` (trừ 1 cho Material Paginator)

Khi gọi API: `page = event.pageIndex + 1` (cộng 1 từ Material Paginator)

## Xử lý lỗi

- `executeQuery` và `executeMutation` đã có try/catch nội bộ, trả về `null` khi lỗi
- Luôn kiểm tra `if (response)` trước khi xử lý kết quả
- Dùng `commonService.openSnackBar()` cho thông báo thành công
- Dùng `commonService.openSnackBarError()` cho thông báo lỗi
