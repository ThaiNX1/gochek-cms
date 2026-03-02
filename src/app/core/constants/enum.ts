export enum TableColumnType {
    NUMBER = 'NUMBER',
    DATE = 'DATE',
    DATE_TIME = 'DATE_TIME',
    FULL_TIME = 'FULL_TIME',
    SHORT_TIME = 'SHORT_TIME',
    IMAGE = 'IMAGE',
}

export enum LoginType {
    LOGIN = 'login',
    EMAIL = 'email',
    UPDATE_PASSWORD = 'update_password',
    FORGOT_PASSWORD = 'forgot_password',
    OTP = 'otp',
}

export enum ResponseCode {
  Success = 200,
  Expired_Token_Facebook = 4011,
  Expired_Token = 401,
  Confirm_OTP = 405,
}

export enum NumberValue {
  MAX_VALUE = 2147483647,
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}
export enum DayOfWeekEnum {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 0,
}

export enum PermissionEnum {
  // User permissions
  USERS_READ = 'users:read', // View người dùng
  USERS_CREATE = 'users:create', // Tạo người dùng
  USERS_UPDATE = 'users:update', // Cập nhât người dùng
  USERS_DELETE = 'users:delete', // Xóa người dùng
  USERS_MANAGE = 'users:manage', // Quản lý người dùng

  // Role permissions
  PERMISSIONS_READ = 'permissions:read', // Xem quyền
  PERMISSIONS_CREATE = 'permissions:create', // Tạo quyền
  PERMISSIONS_UPDATE = 'permissions:update', // Cập nhật quyền
  PERMISSIONS_DELETE = 'permissions:delete', // Xóa quyền
  PERMISSIONS_MANAGE = 'permissions:manage', // Quản lý quyền

  // Organization permissions
  ORGANIZATIONS_READ = 'organizations:read', // Xem tổ chức
  ORGANIZATIONS_CREATE = 'organizations:create', // Tạo tổ chức
  ORGANIZATIONS_UPDATE = 'organizations:update', // Cập nhật tổ chức
  ORGANIZATIONS_DELETE = 'organizations:delete', // Xóa tổ chức
  ORGANIZATIONS_MANAGE = 'organizations:manage', // Quản lý tổ chức

  // Business Role permissions
  ROLES_READ = 'roles:read', // Xem vai trò
  ROLES_CREATE = 'roles:create', // Tạo vai trò
  ROLES_UPDATE = 'roles:update', // Cập nhật vai trò
  ROLES_DELETE = 'roles:delete', // Xóa vai trò
  ROLES_MANAGE = 'roles:manage', // Quản lý vai trò

  // Device Type permissions
  DEVICE_TYPES_READ = 'device_types:read', // Xem loại thiết bị
  DEVICE_TYPES_CREATE = 'device_types:create', // Tạo loại thiết bị
  DEVICE_TYPES_UPDATE = 'device_types:update', // Cập nhật loại thiết bị
  DEVICE_TYPES_DELETE = 'device_types:delete', // Xóa loại thiết bị
  DEVICE_TYPES_MANAGE = 'device_types:manage', // Quản lý loại thiết bị

  // Device permissions
  DEVICES_READ = 'devices:read', // Xem thiết bị
  DEVICES_CREATE = 'devices:create', // Tạo thiết bị
  DEVICES_ONBOARD = 'devices:onboard', // Đăng ký thiết bị
  DEVICES_UPDATE = 'devices:update', // Cập nhật thiết bị
  DEVICES_DELETE = 'devices:delete', // Xóa thiết bị
  DEVICES_MANAGE = 'devices:manage', // Quản lý thiết bị

  // Ward permissions
  WARD_READ = 'ward:read', // Xem phường/xã
  WARD_CREATE = 'ward:create', // Tạo phường/xã
  WARD_UPDATE = 'ward:update', // Cập nhật phường/xã
  WARD_DELETE = 'ward:delete', // Xóa phường/xã
  WARD_MANAGE = 'ward:manage', // Quản lý phường/xã

  // Province permissions
  PROVINCE_READ = 'province:read', // Xem tỉnh/thành phố
  PROVINCE_CREATE = 'province:create', // Tạo tỉnh/thành phố
  PROVINCE_UPDATE = 'province:update', // Cập nhật tỉnh/thành phố
  PROVINCE_DELETE = 'province:delete', // Xóa tỉnh/thành phố
  PROVINCE_MANAGE = 'province:manage', // Quản lý tỉnh/thành phố

  // District permissions
  DISTRICT_READ = 'district:read', // Xem huyện/quận
  DISTRICT_CREATE = 'district:create', // Tạo huyện/quận
  DISTRICT_UPDATE = 'district:update', // Cập nhật huyện/quận
  DISTRICT_DELETE = 'district:delete', // Xóa huyện/quận
  DISTRICT_MANAGE = 'district:manage', // Quản lý huyện/quận

  // Country permissions
  COUNTRY_READ = 'country:read', // Xem quốc gia
  COUNTRY_CREATE = 'country:create', // Tạo quốc gia
  COUNTRY_UPDATE = 'country:update', // Cập nhật quốc gia
  COUNTRY_DELETE = 'country:delete', // Xóa quốc gia
  COUNTRY_MANAGE = 'country:manage', // Quản lý quốc gia

  // Check-in-out point permissions
  CHECK_IN_OUT_POINT_READ = 'check_in_out_point:read', // Xem điểm check-in/check-out
  CHECK_IN_OUT_POINT_CREATE = 'check_in_out_point:create', // Tạo điểm check-in/check-out
  CHECK_IN_OUT_POINT_UPDATE = 'check_in_out_point:update', // Cập nhật điểm check-in/check-out
  CHECK_IN_OUT_POINT_DELETE = 'check_in_out_point:delete', // Xóa điểm check-in/check-out
  CHECK_IN_OUT_POINT_MANAGE = 'check_in_out_point:manage', // Quản lý điểm check-in/check-out

  // Check-in-out config permissions
  CHECK_IN_OUT_CONFIG_READ = 'check_in_out_config:read', // Xem cấu hình check-in/check-out
  CHECK_IN_OUT_CONFIG_CREATE = 'check_in_out_config:create', // Tạo cấu hình check-in/check-out
  CHECK_IN_OUT_CONFIG_UPDATE = 'check_in_out_config:update', // Cập nhật cấu hình check-in/check-out
  CHECK_IN_OUT_CONFIG_DELETE = 'check_in_out_config:delete', // Xóa cấu hình check-in/check-out
  CHECK_IN_OUT_CONFIG_MANAGE = 'check_in_out_config:manage', // Quản lý cấu hình check-in/check-out

  // Room permissions
  ROOMS_READ = 'rooms:read', // Xem phòng
  ROOMS_CREATE = 'rooms:create', // Tạo phòng
  ROOMS_UPDATE = 'rooms:update', // Cập nhật phòng
  ROOMS_DELETE = 'rooms:delete', // Xóa phòng
  ROOMS_MANAGE = 'rooms:manage', // Quản lý phòng

  // Check-in-out history permissions
  CHECK_IN_OUT_HISTORY_READ = 'check_in_out_history:read', // Xem lịch sử check-in/check-out
  CHECK_IN_OUT_HISTORY_CREATE = 'check_in_out_history:create', // Tạo lịch sử check-in/check-out
  CHECK_IN_OUT_HISTORY_UPDATE = 'check_in_out_history:update', // Cập nhật lịch sử check-in/check-out
  CHECK_IN_OUT_HISTORY_DELETE = 'check_in_out_history:delete', // Xóa lịch sử check-in/check-out
  CHECK_IN_OUT_HISTORY_MANAGE = 'check_in_out_history:manage',

  // Approval template permissions
  APPROVAL_TEMPLATE_READ = 'approval_template:read', // Xem template phê duyệt
  APPROVAL_TEMPLATE_CREATE = 'approval_template:create', // Tạo template phê duyệt
  APPROVAL_TEMPLATE_UPDATE = 'approval_template:update', // Cập nhật template phê duyệt
  APPROVAL_TEMPLATE_DELETE = 'approval_template:delete', // Xóa template phê duyệt
  APPROVAL_TEMPLATE_MANAGE = 'approval_template:manage', // Quản lý template phê duyệt

  // Package permissions
  PACKAGES_READ = 'packages:read', // Xem gói
  PACKAGES_CREATE = 'packages:create', // Tạo gói
  PACKAGES_UPDATE = 'packages:update', // Cập nhật gói
  PACKAGES_DELETE = 'packages:delete', // Xóa gói
  PACKAGES_MANAGE = 'packages:manage', // Quản lý gói (assign/remove organizations)

  // Payment Method permissions
  PAYMENT_METHODS_READ = 'payment_methods:read', // Xem phương thức thanh toán
  PAYMENT_METHODS_CREATE = 'payment_methods:create', // Tạo phương thức thanh toán
  PAYMENT_METHODS_UPDATE = 'payment_methods:update', // Cập nhật phương thức thanh toán
  PAYMENT_METHODS_DELETE = 'payment_methods:delete', // Xóa phương thức thanh toán
  PAYMENT_METHODS_MANAGE = 'payment_methods:manage', // Quản lý phương thức thanh toán

  // Invoice permissions (bao gồm cả lịch sử thanh toán)
  INVOICES_READ = 'invoices:read', // Xem hóa đơn
  INVOICES_CREATE = 'invoices:create', // Tạo hóa đơn
  INVOICES_UPDATE = 'invoices:update', // Cập nhật hóa đơn
  INVOICES_DELETE = 'invoices:delete', // Xóa hóa đơn
  INVOICES_MANAGE = 'invoices:manage', // Quản lý hóa đơn

  // Department permissions
  DEPARTMENTS_READ = 'departments:read', // Xem phòng ban
  DEPARTMENTS_CREATE = 'departments:create', // Tạo phòng ban
  DEPARTMENTS_UPDATE = 'departments:update', // Cập nhật phòng ban
  DEPARTMENTS_DELETE = 'departments:delete', // Xóa phòng ban
  DEPARTMENTS_MANAGE = 'departments:manage', // Quản lý phòng ban

  // Customer permissions
  CUSTOMERS_READ = 'customers:read', // Xem khách hàng
  CUSTOMERS_CREATE = 'customers:create', // Tạo khách hàng
  CUSTOMERS_UPDATE = 'customers:update', // Cập nhật khách hàng
  CUSTOMERS_DELETE = 'customers:delete', // Xóa khách hàng
  CUSTOMERS_MANAGE = 'customers:manage', // Quản lý khách hàng

  // Image convert permissions
  IMAGE_CONVERT_READ = 'image_convert:read', // Xem image convert
  IMAGE_CONVERT_CREATE = 'image_convert:create', // Tạo image convert
  IMAGE_CONVERT_UPDATE = 'image_convert:update', // Cập nhật image convert
  IMAGE_CONVERT_DELETE = 'image_convert:delete', // Xóa image convert
  IMAGE_CONVERT_MANAGE = 'image_convert:manage', // Quản lý image convert
}