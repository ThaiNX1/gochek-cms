# Warehouse Management Tasks

## Mục tiêu

Bổ sung quản lý kho vào luồng tồn kho hiện tại:

- Thêm/sửa/xóa thông tin kho.
- Danh sách kho.
- Khi nhập kho phải chọn kho nhập.
- Khi xuất kho phải chọn kho xuất.
- Khi xuất kho phải lưu lịch sử xuất từ kho nào.
- Chuyển hàng từ kho này sang kho khác.
- Báo cáo tồn kho theo từng kho.

## Đánh giá tác động

Mức sửa: trung bình-lớn.

Lý do: tồn kho hiện tại chưa có khái niệm kho thật. Hệ thống đang suy ra tồn kho từ:

- `Device.state = GENERATED`
- `Device.batchCode IS NOT NULL`
- `GenerateHistory.remainingQuantity`
- `StockHistory` làm audit log

Khi có nhiều kho, cần biết từng serial/device hiện đang nằm ở kho nào. Vì vậy cần thêm field kho vào `Device`, không chỉ thêm vào `StockHistory`.

## Thiết kế đề xuất

### Warehouse entity

Tạo entity mới: `src/modules/warehouse/warehouse.entity.ts`

Fields:

- `id`
- `code`: string, unique, indexed
- `name`: string
- `address`: nullable text
- `phone`: nullable string
- `managerName`: nullable string
- `description`: nullable text
- `isActive`: boolean
- `createdAt`, `updatedAt`, `deletedAt`

### Device

Bổ sung:

- `currentWarehouseId`: nullable FK tới `Warehouse`
- `currentWarehouse`: relation nullable

Ý nghĩa:

- Device đang trong kho: `state = GENERATED` và `currentWarehouseId IS NOT NULL`
- Device đã xuất khỏi kho: `state != GENERATED` hoặc `currentWarehouseId IS NULL`

### StockHistory

Bổ sung:

- `warehouseId`: nullable FK tới `Warehouse`
- `fromWarehouseId`: nullable FK tới `Warehouse`
- `toWarehouseId`: nullable FK tới `Warehouse`

Quy ước:

- `STOCK_IN`: `warehouseId = toWarehouseId = kho nhập`
- `STOCK_OUT`: `warehouseId = fromWarehouseId = kho xuất`
- `STOCK_TRANSFER`: `fromWarehouseId = kho nguồn`, `toWarehouseId = kho đích`
- `STOCK_ADJUST`: `warehouseId = kho được điều chỉnh`

Yêu cầu bổ sung quan trọng:

- Khi xuất kho, bắt buộc lưu lại lịch sử xuất từ kho nào bằng `fromWarehouseId` và/hoặc `warehouseId`.
- Không chỉ lưu vào `metadata`, vì cần filter/report theo kho.

### StockEventType

Bổ sung:

- `STOCK_TRANSFER = 'STOCK_TRANSFER'`

## API đề xuất

### Warehouse CRUD

Mutations:

- `createWarehouse(input): Warehouse`
- `updateWarehouse(id, input): Warehouse`
- `deleteWarehouse(id): Boolean`

Queries:

- `warehouse(id): Warehouse`
- `warehouses(pagination/filter): PaginatedWarehouseResponse`
- `activeWarehouses(): [Warehouse!]`

### Stock APIs cần sửa

#### createStockBatch

Input bổ sung:

- `warehouseId`: required

Logic:

- Validate warehouse active.
- Generate serial như hiện tại.
- Sau khi tạo devices, set `Device.currentWarehouseId = warehouseId`.
- Ghi `StockHistory.STOCK_IN` với:
  - `warehouseId`
  - `toWarehouseId = warehouseId`
  - `fromWarehouseId = null`

#### shipDevice

Input bổ sung:

- `warehouseId`: required

Logic:

- Validate device tồn tại.
- Validate `device.state = GENERATED`.
- Validate `device.currentWarehouseId = input.warehouseId`.
- Ghi `StockHistory.STOCK_OUT` với:
  - `warehouseId = input.warehouseId`
  - `fromWarehouseId = input.warehouseId`
  - `toWarehouseId = null`
  - `trackingNumber`, `carrier`, `shippingStatus`
- Update `Device.currentWarehouseId = null`.
- Update `Device.state = ONBOARDING`.

Side effect:

- Nếu không validate warehouse, user có thể xuất nhầm thiết bị từ kho khác.
- Shipping/Viettel Post nên lấy địa chỉ sender từ kho xuất nếu cần.

#### updateShippingStatus RETURNED

Input cần bổ sung hoặc rule mặc định:

- `returnWarehouseId`: nullable

Logic:

- Khi hoàn hàng, phải biết nhập lại kho nào.
- Nếu không truyền `returnWarehouseId`, có thể dùng lại `fromWarehouseId` của lần xuất.
- Update `Device.currentWarehouseId = returnWarehouseId`.
- Ghi `StockHistory.STOCK_IN` với:
  - `warehouseId = returnWarehouseId`
  - `toWarehouseId = returnWarehouseId`
  - `note = Hoàn hàng từ carrier`

#### transferStock / transferDevice

Mutation mới:

- `transferDevice(input): Device`
- `transferDeviceBatch(input): [Device!]`

Input:

- `serialNumber`
- `fromWarehouseId`
- `toWarehouseId`
- `note`

Logic:

- Validate device đang trong kho nguồn.
- Validate kho nguồn và kho đích active.
- Không đổi `Device.state`.
- Update `Device.currentWarehouseId = toWarehouseId`.
- Ghi `StockHistory.STOCK_TRANSFER` với:
  - `fromWarehouseId`
  - `toWarehouseId`
  - `warehouseId = toWarehouseId`
  - `quantity = 1`

## Reports cần sửa

### stockOverview

Bổ sung filter:

- `warehouseId?: string`

Trả thêm:

- `byWarehouse`: `{ warehouseId, warehouseName, inStock, shipped? }[]`
- `byBatch` theo kho
- `lowStockBatches` theo kho

### listStockBatches / getStockBatch

Bổ sung filter:

- `warehouseId?: string`

Lưu ý:

- `GenerateHistory.remainingQuantity` hiện là tổng theo batch, không theo kho.
- Tồn theo kho nên tính từ `Device.currentWarehouseId`.
- Nếu batch chia nhiều kho, không dùng `GenerateHistory.remainingQuantity` để trả lời tồn từng kho.

## Migration dữ liệu cũ

Task bắt buộc:

- Tạo kho mặc định, ví dụ:
  - `code = MAIN`
  - `name = Main Warehouse`
- Gán `Device.currentWarehouseId = MAIN.id` cho các device:
  - `state = GENERATED`
  - `batchCode IS NOT NULL`
  - `currentWarehouseId IS NULL`
- Backfill `StockHistory` cũ:
  - `STOCK_IN`: `warehouseId/toWarehouseId = MAIN.id`
  - `STOCK_OUT`: `warehouseId/fromWarehouseId = MAIN.id` nếu chưa có

## Permission đề xuất

Không dùng permission `STOCK_*` hiện có cho CRUD kho. Kho là master data riêng, cần permission riêng để tách quyền quản lý kho khỏi quyền nhập/xuất kho.

Thêm bắt buộc vào `PermissionEnum`:

- `WAREHOUSE_READ = 'warehouse:read'`
- `WAREHOUSE_CREATE = 'warehouse:create'`
- `WAREHOUSE_UPDATE = 'warehouse:update'`
- `WAREHOUSE_DELETE = 'warehouse:delete'`
- `WAREHOUSE_MANAGE = 'warehouse:manage'`

Áp dụng:

- Query/list warehouse: `WAREHOUSE_READ`
- Create warehouse: `WAREHOUSE_CREATE`
- Update warehouse: `WAREHOUSE_UPDATE`
- Delete warehouse: `WAREHOUSE_DELETE`
- `WAREHOUSE_MANAGE` được guard hiện tại hiểu như quyền bao phủ toàn bộ `warehouse:*`.

## Task triển khai

### Task 1 - Warehouse entity/module

Status: Completed

- Tạo `Warehouse` entity.
- Tạo DTO input/response.
- Tạo service/repository/resolver.
- Tạo CRUD APIs.
- Add module vào `FeatureModule`.

### Task 2 - Permission warehouse

Status: Completed

- Thêm `warehouse:*` vào `PermissionEnum`.
- Không dùng `STOCK_READ` / `STOCK_MANAGE` cho API quản lý kho.
- Thêm migration SQL seed permission rows.
- Dùng quyền cụ thể cho resolver warehouse:
  - `WAREHOUSE_READ` cho query/list.
  - `WAREHOUSE_CREATE` cho create.
  - `WAREHOUSE_UPDATE` cho update.
  - `WAREHOUSE_DELETE` cho delete.
  - `WAREHOUSE_MANAGE` có thể dùng cho API quản trị tổng hợp nếu có.

### Task 3 - Device warehouse field

Status: Completed

- Thêm `currentWarehouseId` vào `Device`.
- Thêm relation `currentWarehouse`.
- Add index.
- Update GraphQL schema.

### Task 4 - StockHistory warehouse fields

Status: Completed

- Thêm `warehouseId`.
- Thêm `fromWarehouseId`.
- Thêm `toWarehouseId`.
- Thêm relations tới `Warehouse`.
- Add indexes.

### Task 5 - Stock event transfer

Status: Completed

- Thêm `STOCK_TRANSFER` vào `StockEventType`.
- Update migration enum DB nếu cần.
- Update filter/search stock history.

### Task 6 - Migration/backfill dữ liệu cũ

Status: Completed

- Tạo kho mặc định `MAIN`.
- Backfill `Device.currentWarehouseId`.
- Backfill `StockHistory.warehouseId/fromWarehouseId/toWarehouseId`.

### Task 7 - Sửa nhập kho

Status: Completed

- `CreateStockBatchInput` thêm `warehouseId`.
- Validate warehouse active.
- Set warehouse cho generated devices.
- Ghi `StockHistory.STOCK_IN` với `warehouseId/toWarehouseId`.

### Task 8 - Sửa xuất kho

Status: Completed

- `ShipDeviceInput` thêm `warehouseId`.
- Validate device đang nằm ở kho xuất.
- Khi xuất kho, lưu lịch sử xuất từ kho nào:
  - `StockHistory.warehouseId = warehouseId`
  - `StockHistory.fromWarehouseId = warehouseId`
- Update `Device.currentWarehouseId = null`.

### Task 9 - Sửa hoàn hàng

Status: Completed

- `UpdateShippingStatusInput` thêm `returnWarehouseId`.
- Nếu status `RETURNED`, nhập lại kho trả hàng.
- Nếu không truyền `returnWarehouseId`, fallback về kho xuất cũ.
- Ghi `StockHistory.STOCK_IN` với `warehouseId/toWarehouseId`.

### Task 10 - Chuyển kho

Status: Completed

- Tạo `TransferDeviceInput`.
- Tạo `TransferDeviceBatchInput`.
- Implement `transferDevice`.
- Validate `fromWarehouseId`/`toWarehouseId`.
- Ghi `StockHistory.STOCK_TRANSFER`.

### Task 11 - Sửa report/query

Status: Completed

- `stockOverview(warehouseId?)`.
- `stockBatches(warehouseId?)`.
- `stockBatch(batchCode, warehouseId?)`.
- `stockHistories` filter thêm `warehouseId`, `fromWarehouseId`, `toWarehouseId`.

### Task 12 - Sửa Shipping/Viettel Post nếu cần

Status: Completed

- Khi tạo đơn vận chuyển, lấy warehouse xuất từ `StockHistory.fromWarehouseId`.
- Nếu Viettel Post cần sender address, map từ `Warehouse.address`.

### Task 13 - Tests

Status: Not added

- Test nhập kho vào kho A.
- Test xuất kho đúng kho.
- Test không cho xuất từ kho sai.
- Test chuyển kho A -> B.
- Test hoàn hàng về kho xuất hoặc kho chỉ định.
- Test report tồn kho theo warehouse.

## Rủi ro và side effect

- Batch có thể nằm ở nhiều kho, nên `GenerateHistory.remainingQuantity` không đại diện cho tồn từng kho.
- Dữ liệu cũ cần kho mặc định, nếu không report theo kho sẽ thiếu dữ liệu.
- Các API hiện tại đang không truyền `warehouseId`, frontend cần cập nhật.
- Shipping/Viettel Post có thể cần sender address theo kho.
- `StockHistory` sẽ nhiều field hơn, cần thống nhất quy ước `warehouseId/fromWarehouseId/toWarehouseId` để report không bị sai.
