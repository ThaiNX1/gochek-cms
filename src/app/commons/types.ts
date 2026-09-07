import { gql } from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type ActivateWarrantyInput = {
  activeCode: Scalars['String']['input'];
  customerAddress?: InputMaybe<Scalars['String']['input']>;
  customerEmail?: InputMaybe<Scalars['String']['input']>;
  customerName: Scalars['String']['input'];
  customerPhone: Scalars['String']['input'];
  serialNumber: Scalars['String']['input'];
  warrantySerial: Scalars['String']['input'];
};

export type ActivateWarrantyResponse = {
  activatedAt?: Maybe<Scalars['Float']['output']>;
  expiredAt?: Maybe<Scalars['Float']['output']>;
  message: Scalars['String']['output'];
  serialNumber?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
  warrantySerial?: Maybe<Scalars['String']['output']>;
};

export type AppLoginInput = {
  password: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type AssignComponentInput = {
  componentSerial: Scalars['String']['input'];
  deviceSerial: Scalars['String']['input'];
};

export type AssignCustomerInput = {
  customerId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type BatchLabelItem = {
  activeCode: Scalars['String']['output'];
  qrData: Scalars['String']['output'];
  serialNumber: Scalars['String']['output'];
};

export type BusinessRole = {
  children?: Maybe<Array<BusinessRole>>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<BusinessRole>;
  parentId?: Maybe<Scalars['String']['output']>;
  permissions: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ChangePasswordInput = {
  confirmPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

/** Trạng thái linh kiện của thiết bị */
export enum ComponentStatus {
  ACTIVE = 'ACTIVE',
  DEFECTIVE = 'DEFECTIVE',
  DETACHED = 'DETACHED',
  SCRAPPED = 'SCRAPPED'
}

export type ComponentType = {
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
};

export type ComponentTypeSearchInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
};

export type ConfigureWarehouseNhanhInput = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  nhanhDepotId?: InputMaybe<Scalars['String']['input']>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
  warehouseId: Scalars['ID']['input'];
};

export type Country = {
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  postCode: Scalars['String']['output'];
  provinces?: Maybe<Array<Province>>;
  updatedAt: Scalars['DateTime']['output'];
  zipCode: Scalars['String']['output'];
};

export type CreateBusinessRoleInput = {
  code: RoleCode;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateComponentTypeInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  warrantyMonth?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateCountryInput = {
  name: Scalars['String']['input'];
  postCode: Scalars['String']['input'];
  zipCode: Scalars['String']['input'];
};

export type CreateDeviceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeId?: InputMaybe<Scalars['String']['input']>;
  firmwareVersion?: InputMaybe<Scalars['String']['input']>;
  hardwareVersion?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  serialNumber: Scalars['String']['input'];
};

export type CreateDeviceTypeInput = {
  code: Scalars['String']['input'];
  componentTypes?: InputMaybe<Array<DeviceTypeComponentItemInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  switchCount?: InputMaybe<Scalars['Float']['input']>;
  warrantyMonth?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateFirmwareInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  filePath?: InputMaybe<Scalars['String']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  modelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  raFileName?: InputMaybe<Scalars['String']['input']>;
  raFilePath?: InputMaybe<Scalars['String']['input']>;
  releaseNotes?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<FirmwareTypeEnum>;
  version: Scalars['String']['input'];
};

export type CreateLogManufacturingInput = {
  currentDeviceState?: InputMaybe<DeviceStateEnum>;
  logDescription?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
  status?: InputMaybe<LogManufacturingStatusEnum>;
  supplierCode?: InputMaybe<Scalars['String']['input']>;
  testId?: InputMaybe<Scalars['String']['input']>;
  testTime?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateModelInput = {
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeId: Scalars['String']['input'];
  discountPrice?: InputMaybe<Scalars['Float']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateOrganizationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  deviceIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  favicon?: InputMaybe<Scalars['String']['input']>;
  isActive?: Scalars['Boolean']['input'];
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  packageId?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  shortName?: InputMaybe<Scalars['String']['input']>;
};

export type CreateStockBatchInput = {
  actualQuantity: Scalars['Float']['input'];
  batchCode: Scalars['String']['input'];
  expectedQuantity: Scalars['Float']['input'];
  modelId?: InputMaybe<Scalars['ID']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  prefix: Scalars['String']['input'];
  supplier?: InputMaybe<Scalars['String']['input']>;
  warehouseId: Scalars['ID']['input'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type CreateViettelPostOrderInput = {
  checkUnique?: Scalars['Boolean']['input'];
  deliveryCode?: InputMaybe<Scalars['String']['input']>;
  enableSortCode?: Scalars['Boolean']['input'];
  environment?: PartnerEnvironment;
  extraMoney?: Scalars['Int']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  moneyCollection?: Scalars['Int']['input'];
  orderNote?: InputMaybe<Scalars['String']['input']>;
  orderNumber?: InputMaybe<Scalars['String']['input']>;
  orderPayment?: Scalars['Int']['input'];
  orderService?: Scalars['String']['input'];
  orderServiceAdd?: InputMaybe<Scalars['String']['input']>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
  pickupCode?: InputMaybe<Scalars['String']['input']>;
  pickupDate?: InputMaybe<Scalars['String']['input']>;
  productDetail?: InputMaybe<Array<ViettelPostProductDetailInput>>;
  productHeight?: Scalars['Int']['input'];
  productLength?: Scalars['Int']['input'];
  productName: Scalars['String']['input'];
  productPrice: Scalars['Int']['input'];
  productQuantity: Scalars['Int']['input'];
  productType?: Scalars['String']['input'];
  productWeight: Scalars['Int']['input'];
  productWidth?: Scalars['Int']['input'];
  receiverAddress: Scalars['String']['input'];
  receiverFullName: Scalars['String']['input'];
  receiverPhone: Scalars['String']['input'];
  senderAddress?: InputMaybe<Scalars['String']['input']>;
  senderFullName?: InputMaybe<Scalars['String']['input']>;
  senderPhone?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  stockHistoryId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateWarehouseInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  managerName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWarrantyClaimInput = {
  componentSerial?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  serialNumber: Scalars['String']['input'];
};

export type CreateWebsiteBannerInput = {
  image?: InputMaybe<Scalars['Upload']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<WebsiteBannerPageEnum>;
  redirectUrl?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type Customer = {
  assignedToId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  devices?: Maybe<Array<Device>>;
  email?: Maybe<Scalars['String']['output']>;
  formKeyId?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status: CustomerStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type CustomerSearchInput = {
  assignToId?: InputMaybe<Scalars['String']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<CustomerStatus>;
};

/** Customer/Lead status */
export enum CustomerStatus {
  CONTACTED = 'CONTACTED',
  CONVERTED = 'CONVERTED',
  NEW = 'NEW',
  REJECTED = 'REJECTED'
}

export type DeleteConnectionInput = {
  cleanSession?: InputMaybe<Scalars['Boolean']['input']>;
  clientId: Scalars['String']['input'];
  preventWillMessage?: InputMaybe<Scalars['Boolean']['input']>;
};

export type DeleteConnectionResponse = {
  clientId: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DetachComponentInput = {
  componentSerial: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type Device = {
  activeAt?: Maybe<Scalars['Float']['output']>;
  basePath?: Maybe<Scalars['String']['output']>;
  batchCode?: Maybe<Scalars['String']['output']>;
  bucket?: Maybe<Scalars['String']['output']>;
  components?: Maybe<Array<DeviceComponent>>;
  createdAt: Scalars['DateTime']['output'];
  currentWarehouse?: Maybe<Warehouse>;
  currentWarehouseId?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  customerId?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceInfo?: Maybe<Scalars['JSON']['output']>;
  deviceType?: Maybe<DeviceType>;
  deviceTypeId?: Maybe<Scalars['String']['output']>;
  expiredAt?: Maybe<Scalars['Float']['output']>;
  expiredSecretKeyAt?: Maybe<Scalars['Float']['output']>;
  firmware?: Maybe<Firmware>;
  firmwareId?: Maybe<Scalars['String']['output']>;
  firmwareVersion?: Maybe<Scalars['String']['output']>;
  hardwareVersion?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  model?: Maybe<Model>;
  modelId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  noSerialNumber?: Maybe<Scalars['Float']['output']>;
  organization?: Maybe<Organization>;
  organizationId?: Maybe<Scalars['String']['output']>;
  otaMessage?: Maybe<Scalars['String']['output']>;
  otaStatus?: Maybe<DeviceControlOtaStatusEnum>;
  ownerId?: Maybe<Scalars['String']['output']>;
  prefix?: Maybe<Scalars['String']['output']>;
  privateKeyBasepath?: Maybe<Scalars['String']['output']>;
  propertyValue?: Maybe<Scalars['JSON']['output']>;
  publicKeyBasepath?: Maybe<Scalars['String']['output']>;
  raFirmware?: Maybe<Firmware>;
  raFirmwareId?: Maybe<Scalars['String']['output']>;
  raFirmwareVersion?: Maybe<Scalars['String']['output']>;
  raHardwareVersion?: Maybe<Scalars['String']['output']>;
  secretKey?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  signature?: Maybe<Scalars['String']['output']>;
  sourceId?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<DeviceStateEnum>;
  updatedAt: Scalars['DateTime']['output'];
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
  warrantySerial?: Maybe<Scalars['String']['output']>;
  wifiInfo?: Maybe<Scalars['JSON']['output']>;
};

export type DeviceComponent = {
  componentType?: Maybe<ComponentType>;
  componentTypeId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentDevice?: Maybe<Device>;
  currentDeviceId?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  organizationId?: Maybe<Scalars['String']['output']>;
  serialNumber: Scalars['String']['output'];
  status: ComponentStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type DeviceComponentSearchInput = {
  componentTypeId?: InputMaybe<Scalars['ID']['input']>;
  currentDeviceId?: InputMaybe<Scalars['ID']['input']>;
  inStock?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
  status?: InputMaybe<ComponentStatus>;
};

/** The different types of device control */
export enum DeviceControlEnum {
  OFF = 'OFF',
  ON = 'ON'
}

/** The different types of device control */
export enum DeviceControlOtaStatusEnum {
  CHECK_DATA_INVALID = 'CHECK_DATA_INVALID',
  CHECK_DATA_VALID = 'CHECK_DATA_VALID',
  END_UPDATE = 'END_UPDATE',
  INITIALIZE = 'INITIALIZE',
  OTA_FAIL = 'OTA_FAIL',
  OTA_SUCCESS = 'OTA_SUCCESS',
  START_UPDATE = 'START_UPDATE'
}

export type DeviceGenerateSerialNumberInput = {
  batchCode?: InputMaybe<Scalars['String']['input']>;
  count: Scalars['Float']['input'];
  descriptor?: InputMaybe<Scalars['String']['input']>;
  expectedQuantity?: InputMaybe<Scalars['Float']['input']>;
  exportId?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
  prefix?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  warehouseId?: InputMaybe<Scalars['String']['input']>;
};

export type DeviceQrCodeResponse = {
  qrData: Scalars['String']['output'];
  serialNumber: Scalars['String']['output'];
};

export type DeviceSearchInput = {
  deviceTypeId?: InputMaybe<Scalars['ID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  page?: Scalars['Int']['input'];
  roomId?: InputMaybe<Scalars['ID']['input']>;
  size?: Scalars['Int']['input'];
  state?: InputMaybe<DeviceStateEnum>;
};

export type DeviceSocketResponse = {
  controlSwitch1?: Maybe<DeviceControlEnum>;
  controlSwitch2?: Maybe<DeviceControlEnum>;
  controlSwitch3?: Maybe<DeviceControlEnum>;
  controlSwitch4?: Maybe<DeviceControlEnum>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  jsonData?: Maybe<Scalars['JSON']['output']>;
  otaStatus: DeviceControlOtaStatusEnum;
  roomId?: Maybe<Scalars['String']['output']>;
  state: DeviceStateEnum;
};

/** The different types of device state */
export enum DeviceStateEnum {
  ERROR = 'ERROR',
  FACTORY = 'FACTORY',
  GENERATED = 'GENERATED',
  OFFLINE = 'OFFLINE',
  ONBOARDING = 'ONBOARDING',
  ONLINE = 'ONLINE',
  OQC = 'OQC',
  QC_TEST = 'QC_TEST',
  REWORK = 'REWORK',
  TIMEOUT = 'TIMEOUT'
}

export type DeviceType = {
  code: Scalars['String']['output'];
  componentTypes?: Maybe<Array<DeviceTypeComponent>>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  firmware?: Maybe<Firmware>;
  firmwareId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  imageUrlCallback?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  models?: Maybe<Array<Model>>;
  name: Scalars['String']['output'];
  raFirmware?: Maybe<Firmware>;
  raFirmwareId?: Maybe<Scalars['String']['output']>;
  shortDescription?: Maybe<Scalars['String']['output']>;
  switchCount?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
};

export type DeviceTypeComponent = {
  componentType?: Maybe<ComponentType>;
  componentTypeId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deviceType?: Maybe<DeviceType>;
  deviceTypeId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  quantity: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type DeviceTypeComponentItemInput = {
  componentTypeId: Scalars['ID']['input'];
  quantity?: Scalars['Float']['input'];
};

export type EditViettelPostOrderInput = {
  checkUnique?: Scalars['Boolean']['input'];
  deliveryCode?: InputMaybe<Scalars['String']['input']>;
  enableSortCode?: Scalars['Boolean']['input'];
  environment?: PartnerEnvironment;
  extraMoney?: Scalars['Int']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  moneyCollection?: Scalars['Int']['input'];
  orderNote?: InputMaybe<Scalars['String']['input']>;
  orderNumber?: InputMaybe<Scalars['String']['input']>;
  orderPayment?: Scalars['Int']['input'];
  orderService?: Scalars['String']['input'];
  orderServiceAdd?: InputMaybe<Scalars['String']['input']>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
  pickupCode?: InputMaybe<Scalars['String']['input']>;
  pickupDate?: InputMaybe<Scalars['String']['input']>;
  productDetail?: InputMaybe<Array<ViettelPostProductDetailInput>>;
  productHeight?: Scalars['Int']['input'];
  productLength?: Scalars['Int']['input'];
  productName: Scalars['String']['input'];
  productPrice: Scalars['Int']['input'];
  productQuantity: Scalars['Int']['input'];
  productType?: Scalars['String']['input'];
  productWeight: Scalars['Int']['input'];
  productWidth?: Scalars['Int']['input'];
  receiverAddress: Scalars['String']['input'];
  receiverFullName: Scalars['String']['input'];
  receiverPhone: Scalars['String']['input'];
  senderAddress?: InputMaybe<Scalars['String']['input']>;
  senderFullName?: InputMaybe<Scalars['String']['input']>;
  senderPhone?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  shippingOrderId?: InputMaybe<Scalars['ID']['input']>;
  stockHistoryId?: InputMaybe<Scalars['ID']['input']>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type ExportProgress = {
  error?: Maybe<Scalars['String']['output']>;
  exportId: Scalars['String']['output'];
  message: Scalars['String']['output'];
  processed?: Maybe<Scalars['Int']['output']>;
  progress: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  total?: Maybe<Scalars['Int']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type ExtendWarrantyInput = {
  addedMonths: Scalars['Float']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
};

/** Robot facial expressions (biểu cảm khuôn mặt robot) */
export enum FacialExpressionRobot {
  BOOTING = 'BOOTING',
  CONFUSED = 'CONFUSED',
  CURIOUS = 'CURIOUS',
  DETERMINED = 'DETERMINED',
  GOOFY = 'GOOFY',
  HAPPY = 'HAPPY',
  IMPRESSED = 'IMPRESSED',
  STARRY_EYED = 'STARRY_EYED',
  SULKING = 'SULKING',
  THINKING = 'THINKING'
}

export type Firmware = {
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceTypes?: Maybe<Array<DeviceType>>;
  devices?: Maybe<Array<Device>>;
  fileName?: Maybe<Scalars['String']['output']>;
  filePath?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  md5?: Maybe<Scalars['String']['output']>;
  models?: Maybe<Array<Model>>;
  name?: Maybe<Scalars['String']['output']>;
  raModels?: Maybe<Array<Model>>;
  releaseNotes?: Maybe<Scalars['String']['output']>;
  type?: Maybe<FirmwareTypeEnum>;
  updatedAt: Scalars['DateTime']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

/** The different types of firmware type */
export enum FirmwareTypeEnum {
  ESP = 'ESP',
  RA = 'RA'
}

export type GenerateComponentInput = {
  componentTypeId: Scalars['ID']['input'];
  count: Scalars['Float']['input'];
  prefix?: InputMaybe<Scalars['String']['input']>;
};

export type GenerateFormKeyResponse = {
  domain: Scalars['String']['output'];
  expiredAt: Scalars['Float']['output'];
  key: Scalars['String']['output'];
};

export type GenerateHistory = {
  batchCode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  descriptor?: Maybe<Scalars['String']['output']>;
  endSerialNumber?: Maybe<Scalars['String']['output']>;
  expectedQuantity?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  importedAt?: Maybe<Scalars['Float']['output']>;
  importedQuantity?: Maybe<Scalars['Float']['output']>;
  linkDownload?: Maybe<Scalars['String']['output']>;
  linkDownloadPath?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Model>;
  modelId?: Maybe<Scalars['String']['output']>;
  prefix?: Maybe<Scalars['String']['output']>;
  remainingQuantity?: Maybe<Scalars['Float']['output']>;
  startSerialNumber?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type GenerateHistorySearchInput = {
  endDate?: InputMaybe<Scalars['Float']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
  startDate?: InputMaybe<Scalars['Float']['input']>;
};

export type ImageConvertBatchInput = {
  height?: InputMaybe<Scalars['Int']['input']>;
  images: Array<Scalars['Upload']['input']>;
  prompt: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type ImageConvertHistoryData = {
  aiToken: Scalars['Int']['output'];
  convertedImages?: Maybe<Array<Scalars['String']['output']>>;
  createdAt: Scalars['DateTime']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  imageCount: Scalars['Int']['output'];
  prompt?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

export type ImageConvertProgress = {
  jobId: Scalars['String']['output'];
  message: Scalars['String']['output'];
  progress: Scalars['Float']['output'];
  results?: Maybe<Array<ImageConvertResult>>;
  status: Scalars['String']['output'];
};

export type ImageConvertResult = {
  error?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type LegacyWarrantyInfoResponse = {
  expiredAt?: Maybe<Scalars['Float']['output']>;
  productName: Scalars['String']['output'];
  registeredAt?: Maybe<Scalars['Float']['output']>;
};

export type LogManufacturing = {
  createdAt: Scalars['DateTime']['output'];
  currentDeviceState?: Maybe<DeviceStateEnum>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  device?: Maybe<Device>;
  deviceId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  logDescription?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Model>;
  modelId?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status?: Maybe<LogManufacturingStatusEnum>;
  supplierCode?: Maybe<Scalars['String']['output']>;
  testId?: Maybe<Scalars['String']['output']>;
  testTime?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type LogManufacturingDashboardBreakdown = {
  failRate: Scalars['Float']['output'];
  failedAttempts: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  passRate: Scalars['Float']['output'];
  passedAttempts: Scalars['Int']['output'];
  pendingAttempts: Scalars['Int']['output'];
  totalAttempts: Scalars['Int']['output'];
  uniqueDevices: Scalars['Int']['output'];
};

export type LogManufacturingDashboardFailure = {
  description: Scalars['String']['output'];
  failShare: Scalars['Float']['output'];
  failedAttempts: Scalars['Int']['output'];
  uniqueDevices: Scalars['Int']['output'];
};

export type LogManufacturingDashboardInput = {
  /** Do lon cua moi moc tren bieu do, tinh theo phut. */
  bucketMinutes?: InputMaybe<Scalars['Int']['input']>;
  currentDeviceStates?: InputMaybe<Array<DeviceStateEnum>>;
  /** Thoi diem bat dau (Unix timestamp milliseconds). Mac dinh: 24 gio truoc. */
  fromTime?: InputMaybe<Scalars['Float']['input']>;
  modelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  recentFailureLimit?: InputMaybe<Scalars['Int']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<LogManufacturingStatusEnum>>;
  supplierCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Thoi diem ket thuc (Unix timestamp milliseconds). Mac dinh: thoi diem hien tai. */
  toTime?: InputMaybe<Scalars['Float']['input']>;
};

export type LogManufacturingDashboardRange = {
  bucketMinutes: Scalars['Int']['output'];
  fromTime: Scalars['Float']['output'];
  toTime: Scalars['Float']['output'];
};

export type LogManufacturingDashboardRecentFailure = {
  currentDeviceState?: Maybe<DeviceStateEnum>;
  failureCountInRange: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  logDescription?: Maybe<Scalars['String']['output']>;
  modelCode?: Maybe<Scalars['String']['output']>;
  modelId?: Maybe<Scalars['String']['output']>;
  modelName?: Maybe<Scalars['String']['output']>;
  serialNumber: Scalars['String']['output'];
  status: LogManufacturingStatusEnum;
  supplierCode?: Maybe<Scalars['String']['output']>;
  testId?: Maybe<Scalars['String']['output']>;
  testTime: Scalars['Float']['output'];
};

export type LogManufacturingDashboardResponse = {
  byDeviceState: Array<LogManufacturingDashboardBreakdown>;
  byModel: Array<LogManufacturingDashboardBreakdown>;
  bySupplier: Array<LogManufacturingDashboardBreakdown>;
  range: LogManufacturingDashboardRange;
  recentFailures: Array<LogManufacturingDashboardRecentFailure>;
  summary: LogManufacturingDashboardSummary;
  timeline: Array<LogManufacturingDashboardTimelinePoint>;
  topFailures: Array<LogManufacturingDashboardFailure>;
  updatedAt: Scalars['Float']['output'];
};

export type LogManufacturingDashboardSummary = {
  failRate: Scalars['Float']['output'];
  failedAttempts: Scalars['Int']['output'];
  finalPassedDevices: Scalars['Int']['output'];
  finalYield: Scalars['Float']['output'];
  firstPassYield: Scalars['Float']['output'];
  firstPassedDevices: Scalars['Int']['output'];
  passedAttempts: Scalars['Int']['output'];
  pendingAttempts: Scalars['Int']['output'];
  retestRate: Scalars['Float']['output'];
  retestedDevices: Scalars['Int']['output'];
  totalAttempts: Scalars['Int']['output'];
  uniqueDevices: Scalars['Int']['output'];
};

export type LogManufacturingDashboardTimelinePoint = {
  bucketStart: Scalars['Float']['output'];
  failRate: Scalars['Float']['output'];
  failedAttempts: Scalars['Int']['output'];
  passRate: Scalars['Float']['output'];
  passedAttempts: Scalars['Int']['output'];
  pendingAttempts: Scalars['Int']['output'];
  totalAttempts: Scalars['Int']['output'];
  uniqueDevices: Scalars['Int']['output'];
};

export type LogManufacturingSearchInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  size?: Scalars['Int']['input'];
  status?: InputMaybe<LogManufacturingStatusEnum>;
  supplierCode?: InputMaybe<Scalars['String']['input']>;
};

/** Trạng thái log manufacturing */
export enum LogManufacturingStatusEnum {
  FAIL = 'FAIL',
  PASS = 'PASS',
  PENDING = 'PENDING'
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  access_token: Scalars['String']['output'];
  menus: Scalars['JSONObject']['output'];
  refresh_token: Scalars['String']['output'];
  user: User;
  userPermissions: Array<Scalars['String']['output']>;
};

export type Model = {
  attributes?: Maybe<Scalars['JSON']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceType?: Maybe<DeviceType>;
  deviceTypeId?: Maybe<Scalars['String']['output']>;
  discountPrice?: Maybe<Scalars['Float']['output']>;
  firmware?: Maybe<Firmware>;
  firmwareId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  imageUrlCallback?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  raFirmware?: Maybe<Firmware>;
  raFirmwareId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  activateWarranty: ActivateWarrantyResponse;
  appForgotPassword: Scalars['Boolean']['output'];
  appLogin: LoginResponse;
  appResendOtp: Scalars['Boolean']['output'];
  assignComponent: DeviceComponent;
  assignCustomer: Customer;
  assignPermissionRole: Permission;
  assignUserRole: User;
  changePassword: User;
  configureWarehouseNhanh: Warehouse;
  confirmOtp: Scalars['Boolean']['output'];
  convertBatch: ImageConvertProgress;
  createBusinessRole: BusinessRole;
  createComponentType: ComponentType;
  createCountry: Country;
  createDevice: Device;
  createDeviceType: DeviceType;
  createFirmware: Firmware;
  createLogManufacturing: LogManufacturing;
  createModel: Model;
  createOrganization: Organization;
  createStockBatch: StockBatchResponse;
  createUser: User;
  createViettelPostOrder: ShippingOrder;
  createWarehouse: Warehouse;
  createWarrantyClaim: WarrantyHistory;
  createWebsiteBanner: WebsiteBanner;
  deleteBusinessRole: Scalars['Boolean']['output'];
  deleteComponentType: Scalars['Boolean']['output'];
  deleteConnection: DeleteConnectionResponse;
  deleteCountry: Country;
  deleteDeviceType: Scalars['Boolean']['output'];
  deleteFirmware: Scalars['Boolean']['output'];
  deleteModel: Scalars['Boolean']['output'];
  deleteOrganization: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteWarehouse: Scalars['Boolean']['output'];
  detachComponent: DeviceComponent;
  editViettelPostOrder: ShippingOrder;
  extendWarranty: WarrantyHistory;
  forgotPassword: Scalars['Boolean']['output'];
  generateComponents: Array<DeviceComponent>;
  generateSerialNumber: Scalars['String']['output'];
  importDevice: Scalars['String']['output'];
  importPermissions: Array<Permission>;
  importProvince: Array<Province>;
  importWard: Array<Ward>;
  login: LoginResponse;
  logout: Scalars['String']['output'];
  orgAdminForgotPassword: Scalars['Boolean']['output'];
  printBatchLabels: Array<BatchLabelItem>;
  printViettelPostOrder: ShippingOrder;
  refreshToken: RefreshTokenResponse;
  refreshViettelPostToken: PartnerCredential;
  removeModelInFirmware: Scalars['Boolean']['output'];
  removePermissionRole: Permission;
  removeUserRole: User;
  removeWebsiteBanner: Scalars['Boolean']['output'];
  repairDevice: WarrantyHistory;
  repairDevicePaid: WarrantyHistory;
  replaceComponent: DeviceComponent;
  replaceDevice: WarrantyHistory;
  resendFirmwareVersionWebhook: ResendFirmwareVersionWebhookResponse;
  resendOtp: Scalars['Boolean']['output'];
  resetPassword: User;
  returnDevice: WarrantyHistory;
  sellComponent: WarrantyHistory;
  setRobotFacialExpression: Scalars['Boolean']['output'];
  setRobotProperty: Scalars['Boolean']['output'];
  shipDevice: Device;
  shipDeviceBatch: Array<Device>;
  submitConsultationForm: SubmitConsultationFormResponse;
  subscribeNotification: User;
  syncNhanhProductMappings: NhanhProductMappingSyncResponse;
  syncViettelPostProvinces: Array<Province>;
  transferDevice: Device;
  transferDeviceBatch: Array<Device>;
  updateBusinessRole: BusinessRole;
  updateComponentType: ComponentType;
  updateCountry: Country;
  updateCustomer: Customer;
  updateCustomerStatus: Customer;
  updateDevice: Device;
  updateDeviceType: DeviceType;
  updateFirmware: Firmware;
  updateFirmwareStatus: Scalars['Boolean']['output'];
  updateModel: Model;
  updateOrganization: Organization;
  updateShippingStatus: StockHistory;
  updateUser: User;
  updateViettelPostOrderStatus: ShippingOrder;
  updateWarehouse: Warehouse;
  updateWebsiteBanner: WebsiteBanner;
  uploadFile: UploadFileResponse;
  upsertNhanhCredential: PartnerCredential;
  upsertNhanhProductMapping: NhanhProductMapping;
  upsertPartnerCredential: PartnerCredential;
  verifyNhanhCredential: Array<NhanhDepotResponse>;
  webForgotPassword: Scalars['Boolean']['output'];
};


export type MutationActivateWarrantyArgs = {
  input: ActivateWarrantyInput;
};


export type MutationAppForgotPasswordArgs = {
  deviceId: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};


export type MutationAppLoginArgs = {
  input: AppLoginInput;
};


export type MutationAssignComponentArgs = {
  input: AssignComponentInput;
};


export type MutationAssignCustomerArgs = {
  input: AssignCustomerInput;
};


export type MutationAssignPermissionRoleArgs = {
  permissionId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};


export type MutationAssignUserRoleArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationConfigureWarehouseNhanhArgs = {
  input: ConfigureWarehouseNhanhInput;
};


export type MutationConfirmOtpArgs = {
  otp: Scalars['String']['input'];
};


export type MutationConvertBatchArgs = {
  input: ImageConvertBatchInput;
};


export type MutationCreateBusinessRoleArgs = {
  input: CreateBusinessRoleInput;
};


export type MutationCreateComponentTypeArgs = {
  input: CreateComponentTypeInput;
};


export type MutationCreateCountryArgs = {
  input: CreateCountryInput;
};


export type MutationCreateDeviceArgs = {
  input: CreateDeviceInput;
};


export type MutationCreateDeviceTypeArgs = {
  input: CreateDeviceTypeInput;
};


export type MutationCreateFirmwareArgs = {
  input: CreateFirmwareInput;
};


export type MutationCreateLogManufacturingArgs = {
  input: CreateLogManufacturingInput;
};


export type MutationCreateModelArgs = {
  input: CreateModelInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


export type MutationCreateStockBatchArgs = {
  input: CreateStockBatchInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateViettelPostOrderArgs = {
  input: CreateViettelPostOrderInput;
};


export type MutationCreateWarehouseArgs = {
  input: CreateWarehouseInput;
};


export type MutationCreateWarrantyClaimArgs = {
  input: CreateWarrantyClaimInput;
};


export type MutationCreateWebsiteBannerArgs = {
  input: CreateWebsiteBannerInput;
};


export type MutationDeleteBusinessRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteComponentTypeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteConnectionArgs = {
  input: DeleteConnectionInput;
};


export type MutationDeleteCountryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDeviceTypeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFirmwareArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteModelArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWarehouseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDetachComponentArgs = {
  input: DetachComponentInput;
};


export type MutationEditViettelPostOrderArgs = {
  input: EditViettelPostOrderInput;
};


export type MutationExtendWarrantyArgs = {
  input: ExtendWarrantyInput;
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationGenerateComponentsArgs = {
  input: GenerateComponentInput;
};


export type MutationGenerateSerialNumberArgs = {
  input: DeviceGenerateSerialNumberInput;
};


export type MutationImportDeviceArgs = {
  file: Scalars['Upload']['input'];
  importId: Scalars['String']['input'];
};


export type MutationImportPermissionsArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogoutArgs = {
  token: Scalars['String']['input'];
};


export type MutationOrgAdminForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationPrintBatchLabelsArgs = {
  batchCode: Scalars['String']['input'];
};


export type MutationPrintViettelPostOrderArgs = {
  input: PrintViettelPostOrderInput;
};


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRefreshViettelPostTokenArgs = {
  input: RefreshPartnerTokenInput;
};


export type MutationRemoveModelInFirmwareArgs = {
  id: Scalars['ID']['input'];
  modelId: Scalars['ID']['input'];
};


export type MutationRemovePermissionRoleArgs = {
  permissionId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};


export type MutationRemoveUserRoleArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRemoveWebsiteBannerArgs = {
  id: Scalars['String']['input'];
};


export type MutationRepairDeviceArgs = {
  input: RepairDeviceInput;
};


export type MutationRepairDevicePaidArgs = {
  input: RepairDevicePaidInput;
};


export type MutationReplaceComponentArgs = {
  input: ReplaceComponentInput;
};


export type MutationReplaceDeviceArgs = {
  input: ReplaceDeviceInput;
};


export type MutationResendFirmwareVersionWebhookArgs = {
  input: ResendFirmwareVersionWebhookInput;
};


export type MutationResetPasswordArgs = {
  id: Scalars['ID']['input'];
};


export type MutationReturnDeviceArgs = {
  input: ReturnDeviceInput;
};


export type MutationSellComponentArgs = {
  input: SellComponentInput;
};


export type MutationSetRobotFacialExpressionArgs = {
  expression: FacialExpressionRobot;
  serialNumber: Scalars['String']['input'];
};


export type MutationSetRobotPropertyArgs = {
  property: PropertyRobot;
  serialNumber: Scalars['String']['input'];
  value: Scalars['String']['input'];
};


export type MutationShipDeviceArgs = {
  input: ShipDeviceInput;
};


export type MutationShipDeviceBatchArgs = {
  input: ShipDeviceBatchInput;
};


export type MutationSubmitConsultationFormArgs = {
  input: SubmitConsultationFormInput;
};


export type MutationSubscribeNotificationArgs = {
  deviceToken: Scalars['String']['input'];
};


export type MutationSyncNhanhProductMappingsArgs = {
  input: SyncNhanhProductMappingsInput;
};


export type MutationTransferDeviceArgs = {
  input: TransferDeviceInput;
};


export type MutationTransferDeviceBatchArgs = {
  input: TransferDeviceBatchInput;
};


export type MutationUpdateBusinessRoleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBusinessRoleInput;
};


export type MutationUpdateComponentTypeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateComponentTypeInput;
};


export type MutationUpdateCountryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCountryInput;
};


export type MutationUpdateCustomerArgs = {
  input: UpdateCustomerInput;
};


export type MutationUpdateCustomerStatusArgs = {
  input: UpdateCustomerStatusInput;
};


export type MutationUpdateDeviceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDeviceInput;
};


export type MutationUpdateDeviceTypeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDeviceTypeInput;
};


export type MutationUpdateFirmwareArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFirmwareInput;
};


export type MutationUpdateFirmwareStatusArgs = {
  id: Scalars['ID']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationUpdateModelArgs = {
  id: Scalars['ID']['input'];
  input: UpdateModelInput;
};


export type MutationUpdateOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOrganizationInput;
};


export type MutationUpdateShippingStatusArgs = {
  input: UpdateShippingStatusInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUpdateViettelPostOrderStatusArgs = {
  input: UpdateViettelPostOrderStatusInput;
};


export type MutationUpdateWarehouseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWarehouseInput;
};


export type MutationUpdateWebsiteBannerArgs = {
  id: Scalars['String']['input'];
  input: UpdateWebsiteBannerInput;
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload']['input'];
  folder: Scalars['String']['input'];
  md5?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpsertNhanhCredentialArgs = {
  input: UpsertNhanhCredentialInput;
};


export type MutationUpsertNhanhProductMappingArgs = {
  input: UpsertNhanhProductMappingInput;
};


export type MutationUpsertPartnerCredentialArgs = {
  input: UpsertPartnerCredentialInput;
};


export type MutationVerifyNhanhCredentialArgs = {
  input: NhanhCredentialInput;
};


export type MutationWebForgotPasswordArgs = {
  email: Scalars['String']['input'];
};

export type NhanhConfigurationStatusResponse = {
  errors: Array<Scalars['String']['output']>;
  valid: Scalars['Boolean']['output'];
};

export type NhanhCredentialInput = {
  partnerCredentialId: Scalars['ID']['input'];
};

export type NhanhDepotResponse = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  raw?: Maybe<Scalars['JSON']['output']>;
};

export type NhanhProductMapping = {
  businessId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  model: Model;
  modelId: Scalars['String']['output'];
  nhanhProductId: Scalars['String']['output'];
  partnerCredential: PartnerCredential;
  partnerCredentialId: Scalars['String']['output'];
  productCode?: Maybe<Scalars['String']['output']>;
  productName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type NhanhProductMappingSearchInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  modelId?: InputMaybe<Scalars['ID']['input']>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
};

export type NhanhProductMappingSyncResponse = {
  created: Scalars['Float']['output'];
  duplicateProductCodes: Array<Scalars['String']['output']>;
  missingModelCodes: Array<Scalars['String']['output']>;
  skipped: Scalars['Float']['output'];
};

export type NhanhPurchaseDocumentResponse = {
  businessId: Scalars['String']['output'];
  customerName?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  partnerCredentialId: Scalars['String']['output'];
  raw: Scalars['JSON']['output'];
  status?: Maybe<Scalars['String']['output']>;
  type: NhanhPurchaseDocumentType;
};

export type NhanhPurchaseDocumentSearchResponse = {
  data: Array<NhanhPurchaseDocumentResponse>;
  errors: Array<Scalars['String']['output']>;
};

export enum NhanhPurchaseDocumentType {
  ORDER = 'ORDER',
  RETAIL_BILL = 'RETAIL_BILL'
}

export type Organization = {
  address?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  shortName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PaginatedBusinessRoleResponse = {
  data: Array<BusinessRole>;
  pagination: PaginationResponse;
};

export type PaginatedComponentTypeResponse = {
  data: Array<ComponentType>;
  pagination: PaginationResponse;
};

export type PaginatedCustomerResponse = {
  data: Array<Customer>;
  pagination: PaginationInfo;
};

export type PaginatedDeviceComponentResponse = {
  data: Array<DeviceComponent>;
  pagination: PaginationResponse;
};

export type PaginatedDeviceResponse = {
  data: Array<Device>;
  pagination: PaginationResponse;
};

export type PaginatedDeviceTypeResponse = {
  data: Array<DeviceType>;
  pagination: PaginationResponse;
};

export type PaginatedFirmwareResponse = {
  data: Array<Firmware>;
  lastItems?: Maybe<Array<Firmware>>;
  pagination: PaginationResponse;
};

export type PaginatedGenerateHistoryResponse = {
  data: Array<GenerateHistory>;
  pagination: PaginationResponse;
};

export type PaginatedImageConvertHistoryResponse = {
  data: Array<ImageConvertHistoryData>;
  pagination: PaginationResponse;
};

export type PaginatedLogManufacturingResponse = {
  data: Array<LogManufacturing>;
  pagination: PaginationResponse;
};

export type PaginatedModelResponse = {
  data: Array<Model>;
  pagination: PaginationResponse;
};

export type PaginatedOrganizationResponse = {
  data: Array<Organization>;
  pagination: PaginationResponse;
};

export type PaginatedShippingOrderResponse = {
  data: Array<ShippingOrder>;
  pagination: PaginationResponse;
};

export type PaginatedStockHistoryResponse = {
  data: Array<StockHistory>;
  pagination: PaginationResponse;
};

export type PaginatedUserResponse = {
  data: Array<User>;
  pagination: PaginationResponse;
};

export type PaginatedWarehouseResponse = {
  data: Array<Warehouse>;
  pagination: PaginationResponse;
};

export type PaginatedWarrantyHistoryResponse = {
  data: Array<WarrantyHistory>;
  pagination: PaginationResponse;
};

export type PaginatedWebsiteBannerResponse = {
  data: Array<WebsiteBanner>;
  pagination: PaginationResponse;
};

export type PaginationInfo = {
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
};

export type PaginationResponse = {
  page?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
  totalPages?: Maybe<Scalars['Int']['output']>;
};

export type PartnerCredential = {
  allowedDepotIds?: Maybe<Scalars['JSON']['output']>;
  appId?: Maybe<Scalars['String']['output']>;
  businessId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  environment: PartnerEnvironment;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastLoginAt?: Maybe<Scalars['Float']['output']>;
  lastOwnerConnectAt?: Maybe<Scalars['Float']['output']>;
  lastVerifiedAt?: Maybe<Scalars['Float']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  ownerTokenExpiresAt?: Maybe<Scalars['Float']['output']>;
  partnerKey: PartnerKey;
  permissions?: Maybe<Scalars['JSON']['output']>;
  tokenExpiresAt?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type PartnerCredentialSearchInput = {
  businessId?: InputMaybe<Scalars['String']['input']>;
  environment?: InputMaybe<PartnerEnvironment>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  partnerKey?: InputMaybe<PartnerKey>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export enum PartnerEnvironment {
  DEV = 'DEV',
  PROD = 'PROD'
}

export enum PartnerKey {
  ESMS = 'ESMS',
  NHANH = 'NHANH',
  SPHOTON = 'SPHOTON',
  VIETTEL_POST = 'VIETTEL_POST'
}

export type Permission = {
  action: Scalars['String']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  roles?: Maybe<Array<BusinessRole>>;
  sampleManagement: Scalars['Boolean']['output'];
  type?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** The type of permission */
export enum PermissionTypeEnum {
  ADMINISTRATOR = 'ADMINISTRATOR',
  END_USER = 'END_USER',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN'
}

export type PrintViettelPostOrderInput = {
  environment?: PartnerEnvironment;
  expiryTime?: InputMaybe<Scalars['Float']['input']>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
  shippingOrderId?: InputMaybe<Scalars['ID']['input']>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Robot properties (thuộc tính robot: volume, brightness, language) */
export enum PropertyRobot {
  BATTERY = 'BATTERY',
  BRIGHTNESS = 'BRIGHTNESS',
  LANGUAGE = 'LANGUAGE',
  VOLUME = 'VOLUME'
}

export type Province = {
  code: Scalars['String']['output'];
  country: Country;
  countryId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  name_with_type?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  viettelPostId?: Maybe<Scalars['String']['output']>;
  wards?: Maybe<Array<Ward>>;
};

export type PublicDeviceInfoResponse = {
  message?: Maybe<Scalars['String']['output']>;
  modelName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  state?: Maybe<DeviceStateEnum>;
};

export type PublicModelSearchInput = {
  deviceTypeId?: InputMaybe<Scalars['ID']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
};

export type Query = {
  activeWarehouses: Array<Warehouse>;
  allPrefix: Array<GenerateHistory>;
  businessRole: BusinessRole;
  businessRoleByCode: BusinessRole;
  businessRoles: PaginatedBusinessRoleResponse;
  checkWarrantiesByPhone: Array<WarrantyInfoResponse>;
  checkWarranty: WarrantyInfoResponse;
  componentType: ComponentType;
  componentTypes: PaginatedComponentTypeResponse;
  countries: Array<Country>;
  country: Country;
  customer: Customer;
  customers: PaginatedCustomerResponse;
  device: Device;
  deviceActiveCode: BatchLabelItem;
  deviceComponent: DeviceComponent;
  deviceComponentBySerial: DeviceComponent;
  deviceComponents: PaginatedDeviceComponentResponse;
  deviceQrCode: DeviceQrCodeResponse;
  deviceType: DeviceType;
  deviceTypes: PaginatedDeviceTypeResponse;
  devices: PaginatedDeviceResponse;
  firmware: Firmware;
  firmwares: PaginatedFirmwareResponse;
  firmwaresByDeviceType: Array<Firmware>;
  generateFormKey: GenerateFormKeyResponse;
  generateHistories: PaginatedGenerateHistoryResponse;
  getAllBannerActivePublic: Array<WebsiteBanner>;
  getDeviceBySerial: PublicDeviceInfoResponse;
  getImageConvertHistory: PaginatedImageConvertHistoryResponse;
  logManufacturing: LogManufacturing;
  logManufacturingDashboard: LogManufacturingDashboardResponse;
  logManufacturings: PaginatedLogManufacturingResponse;
  missingNhanhProductMappings: Array<Model>;
  model: Model;
  models: PaginatedModelResponse;
  nhanhCredentials: Array<PartnerCredential>;
  nhanhDepots: Array<NhanhDepotResponse>;
  nhanhProductMappings: Array<NhanhProductMapping>;
  nhanhProducts: Scalars['JSON']['output'];
  organization: Organization;
  organizations: PaginatedOrganizationResponse;
  partnerCredentials: Array<PartnerCredential>;
  permission: Permission;
  permissions: Array<Permission>;
  permissionsByType: Array<Permission>;
  province: Province;
  provinces: Array<Province>;
  provincesByCountry: Array<Province>;
  publicDeviceType: DeviceType;
  publicDeviceTypes: PaginatedDeviceTypeResponse;
  publicModel: Model;
  publicModels: PaginatedModelResponse;
  roleHierarchy: Array<BusinessRole>;
  searchNhanhPurchaseDocuments: NhanhPurchaseDocumentSearchResponse;
  shippingOrder: ShippingOrder;
  shippingOrders: PaginatedShippingOrderResponse;
  stockBatch: StockBatchResponse;
  stockBatches: Array<StockBatchResponse>;
  stockHistories: PaginatedStockHistoryResponse;
  stockOverview: StockOverviewResponse;
  user: User;
  userProfile: User;
  users: PaginatedUserResponse;
  usersByOrganization: PaginatedUserResponse;
  validateWarehouseNhanhConfiguration: NhanhConfigurationStatusResponse;
  ward: Ward;
  wards: Array<Ward>;
  wardsByProvince: Array<Ward>;
  warehouse: Warehouse;
  warehouses: PaginatedWarehouseResponse;
  warrantyDeviceBySerial: WarrantyDeviceHistoryResponse;
  warrantyDevicesByPhone: Array<WarrantyDeviceHistoryResponse>;
  warrantyDevicesByWarrantySerial: Array<WarrantyDeviceHistoryResponse>;
  warrantyHistories: PaginatedWarrantyHistoryResponse;
  websiteBanner: WebsiteBanner;
  websiteBanners: PaginatedWebsiteBannerResponse;
};


export type QueryBusinessRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBusinessRoleByCodeArgs = {
  code: RoleCode;
};


export type QueryBusinessRolesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryCheckWarrantiesByPhoneArgs = {
  customerPhone: Scalars['String']['input'];
};


export type QueryCheckWarrantyArgs = {
  serialNumber: Scalars['String']['input'];
};


export type QueryComponentTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryComponentTypesArgs = {
  pagination?: InputMaybe<ComponentTypeSearchInput>;
};


export type QueryCountryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomerArgs = {
  id: Scalars['String']['input'];
};


export type QueryCustomersArgs = {
  pagination?: InputMaybe<CustomerSearchInput>;
};


export type QueryDeviceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDeviceActiveCodeArgs = {
  serialNumber: Scalars['String']['input'];
};


export type QueryDeviceComponentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDeviceComponentBySerialArgs = {
  serial: Scalars['String']['input'];
};


export type QueryDeviceComponentsArgs = {
  pagination?: InputMaybe<DeviceComponentSearchInput>;
};


export type QueryDeviceQrCodeArgs = {
  serialNumber: Scalars['String']['input'];
};


export type QueryDeviceTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDeviceTypesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryDevicesArgs = {
  pagination?: InputMaybe<DeviceSearchInput>;
};


export type QueryFirmwareArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFirmwaresArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryFirmwaresByDeviceTypeArgs = {
  deviceTypeId: Scalars['String']['input'];
};


export type QueryGenerateHistoriesArgs = {
  pagination?: InputMaybe<GenerateHistorySearchInput>;
};


export type QueryGetDeviceBySerialArgs = {
  activeCode: Scalars['String']['input'];
  serialNumber: Scalars['String']['input'];
};


export type QueryGetImageConvertHistoryArgs = {
  limit?: Scalars['Float']['input'];
  page?: Scalars['Float']['input'];
};


export type QueryLogManufacturingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLogManufacturingDashboardArgs = {
  input?: InputMaybe<LogManufacturingDashboardInput>;
};


export type QueryLogManufacturingsArgs = {
  pagination?: InputMaybe<LogManufacturingSearchInput>;
};


export type QueryMissingNhanhProductMappingsArgs = {
  partnerCredentialId: Scalars['ID']['input'];
};


export type QueryModelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryModelsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryNhanhDepotsArgs = {
  input: NhanhCredentialInput;
};


export type QueryNhanhProductMappingsArgs = {
  input?: InputMaybe<NhanhProductMappingSearchInput>;
};


export type QueryNhanhProductsArgs = {
  input: NhanhCredentialInput;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryPartnerCredentialsArgs = {
  input?: InputMaybe<PartnerCredentialSearchInput>;
};


export type QueryPermissionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPermissionsByTypeArgs = {
  type: PermissionTypeEnum;
};


export type QueryProvinceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProvincesByCountryArgs = {
  countryId: Scalars['ID']['input'];
};


export type QueryPublicDeviceTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicDeviceTypesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryPublicModelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicModelsArgs = {
  pagination?: InputMaybe<PublicModelSearchInput>;
};


export type QuerySearchNhanhPurchaseDocumentsArgs = {
  input: SearchNhanhPurchaseDocumentsInput;
};


export type QueryShippingOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryShippingOrdersArgs = {
  pagination?: InputMaybe<ShippingOrderSearchInput>;
};


export type QueryStockBatchArgs = {
  batchCode: Scalars['String']['input'];
  warehouseId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStockBatchesArgs = {
  warehouseId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStockHistoriesArgs = {
  pagination?: InputMaybe<StockHistorySearchInput>;
};


export type QueryStockOverviewArgs = {
  warehouseId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryUsersByOrganizationArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryValidateWarehouseNhanhConfigurationArgs = {
  warehouseId: Scalars['ID']['input'];
};


export type QueryWardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWardsByProvinceArgs = {
  provinceId: Scalars['ID']['input'];
};


export type QueryWarehouseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWarehousesArgs = {
  pagination?: InputMaybe<WarehouseSearchInput>;
};


export type QueryWarrantyDeviceBySerialArgs = {
  serialNumber: Scalars['String']['input'];
};


export type QueryWarrantyDevicesByPhoneArgs = {
  customerPhone: Scalars['String']['input'];
};


export type QueryWarrantyDevicesByWarrantySerialArgs = {
  warrantySerial: Scalars['String']['input'];
};


export type QueryWarrantyHistoriesArgs = {
  pagination?: InputMaybe<WarrantyHistorySearchInput>;
};


export type QueryWebsiteBannerArgs = {
  id: Scalars['String']['input'];
};


export type QueryWebsiteBannersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type RefreshPartnerTokenInput = {
  partnerCredentialId: Scalars['ID']['input'];
};

export type RefreshTokenResponse = {
  access_token: Scalars['String']['output'];
  refresh_token: Scalars['String']['output'];
};

export type RepairDeviceInput = {
  componentSerial?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  newComponentSerial?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
};

export type RepairDevicePaidInput = {
  componentSerial?: InputMaybe<Scalars['String']['input']>;
  cost: Scalars['Float']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  invoiceNumber?: InputMaybe<Scalars['String']['input']>;
  newComponentSerial?: InputMaybe<Scalars['String']['input']>;
  reason: Scalars['String']['input'];
  serialNumber: Scalars['String']['input'];
};

export type ReplaceComponentInput = {
  deviceSerial: Scalars['String']['input'];
  newComponentSerial: Scalars['String']['input'];
  oldComponentSerial: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type ReplaceDeviceInput = {
  newSerial: Scalars['String']['input'];
  oldSerial: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type ResendFirmwareVersionWebhookInput = {
  modelId?: InputMaybe<Scalars['ID']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
};

export type ResendFirmwareVersionWebhookResponse = {
  failedCount: Scalars['Int']['output'];
  newEspVersionCount: Scalars['Int']['output'];
  newRaVersionCount: Scalars['Int']['output'];
  successCount: Scalars['Int']['output'];
  totalDevices: Scalars['Int']['output'];
};

export type ReturnDeviceInput = {
  reason: Scalars['String']['input'];
  refundAmount?: InputMaybe<Scalars['Float']['input']>;
  serialNumber: Scalars['String']['input'];
};

/** The different types of business roles */
export enum RoleCode {
  ADMINISTRATOR = 'ADMINISTRATOR',
  EMPLOYEE = 'EMPLOYEE',
  END_USER = 'END_USER',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN'
}

export type SearchNhanhPurchaseDocumentsInput = {
  customerPhone?: InputMaybe<Scalars['String']['input']>;
  documentId?: InputMaybe<Scalars['String']['input']>;
  documentType?: InputMaybe<NhanhPurchaseDocumentType>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  warehouseId?: InputMaybe<Scalars['ID']['input']>;
};

export type SellComponentInput = {
  componentSerial: Scalars['String']['input'];
  cost: Scalars['Float']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  invoiceNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
};

export type ShipDeviceBatchInput = {
  items: Array<ShipDeviceInput>;
};

export type ShipDeviceInput = {
  carrier?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
  trackingNumber: Scalars['String']['input'];
  warehouseId: Scalars['ID']['input'];
};

export type ShippingOrder = {
  batchCode?: Maybe<Scalars['String']['output']>;
  carrier: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdById?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  device?: Maybe<Device>;
  deviceId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  partnerKey: PartnerKey;
  partnerStatusCode?: Maybe<Scalars['String']['output']>;
  printUrl?: Maybe<Scalars['String']['output']>;
  receiverAddress: Scalars['String']['output'];
  receiverName: Scalars['String']['output'];
  receiverPhone: Scalars['String']['output'];
  requestPayload?: Maybe<Scalars['JSON']['output']>;
  responsePayload?: Maybe<Scalars['JSON']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  shippingStatus: ShippingStatusEnum;
  stockHistory?: Maybe<StockHistory>;
  stockHistoryId?: Maybe<Scalars['String']['output']>;
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updatedById?: Maybe<Scalars['String']['output']>;
};

export type ShippingOrderSearchInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  orderNumber?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  shippingStatus?: InputMaybe<ShippingStatusEnum>;
  size?: Scalars['Int']['input'];
  stockHistoryId?: InputMaybe<Scalars['String']['input']>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Trạng thái vận chuyển */
export enum ShippingStatusEnum {
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  RETURNED = 'RETURNED'
}

export type StockBatchResponse = {
  batchCode: Scalars['String']['output'];
  endSerialNumber?: Maybe<Scalars['String']['output']>;
  expectedQuantity: Scalars['Float']['output'];
  importedAt?: Maybe<Scalars['Float']['output']>;
  importedQuantity: Scalars['Float']['output'];
  remainingQuantity: Scalars['Float']['output'];
  shippedCount: Scalars['Float']['output'];
  startSerialNumber?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  warehouseId?: Maybe<Scalars['String']['output']>;
  warehouseName?: Maybe<Scalars['String']['output']>;
};

/** Loại sự kiện kho (nhập/xuất/điều chỉnh) */
export enum StockEventType {
  STOCK_ADJUST = 'STOCK_ADJUST',
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
  STOCK_TRANSFER = 'STOCK_TRANSFER'
}

export type StockHistory = {
  batchCode: Scalars['String']['output'];
  carrier?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  device?: Maybe<Device>;
  deviceId?: Maybe<Scalars['String']['output']>;
  eventAt: Scalars['Float']['output'];
  eventType: StockEventType;
  fromWarehouse?: Maybe<Warehouse>;
  fromWarehouseId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  performedById?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Float']['output'];
  serialNumber?: Maybe<Scalars['String']['output']>;
  shippingStatus?: Maybe<ShippingStatusEnum>;
  shippingUpdatedAt?: Maybe<Scalars['Float']['output']>;
  toWarehouse?: Maybe<Warehouse>;
  toWarehouseId?: Maybe<Scalars['String']['output']>;
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  warehouse?: Maybe<Warehouse>;
  warehouseId?: Maybe<Scalars['String']['output']>;
};

export type StockHistorySearchInput = {
  batchCode?: InputMaybe<Scalars['String']['input']>;
  eventType?: InputMaybe<StockEventType>;
  fromEventAt?: InputMaybe<Scalars['Float']['input']>;
  fromWarehouseId?: InputMaybe<Scalars['ID']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  shippingStatus?: InputMaybe<ShippingStatusEnum>;
  size?: Scalars['Int']['input'];
  toEventAt?: InputMaybe<Scalars['Float']['input']>;
  toWarehouseId?: InputMaybe<Scalars['ID']['input']>;
  warehouseId?: InputMaybe<Scalars['ID']['input']>;
};

export type StockOverviewByBatch = {
  batchCode: Scalars['String']['output'];
  remaining: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
  warehouseId?: Maybe<Scalars['String']['output']>;
  warehouseName?: Maybe<Scalars['String']['output']>;
};

export type StockOverviewByModel = {
  inStock: Scalars['Float']['output'];
  modelId: Scalars['String']['output'];
  modelName?: Maybe<Scalars['String']['output']>;
  shipped: Scalars['Float']['output'];
};

export type StockOverviewByWarehouse = {
  inStock: Scalars['Float']['output'];
  shipped: Scalars['Float']['output'];
  warehouseId: Scalars['String']['output'];
  warehouseName?: Maybe<Scalars['String']['output']>;
};

export type StockOverviewResponse = {
  byBatch: Array<StockOverviewByBatch>;
  byModel: Array<StockOverviewByModel>;
  byWarehouse: Array<StockOverviewByWarehouse>;
  lowStockBatches: Array<StockOverviewByBatch>;
  totalInStock: Scalars['Float']['output'];
  totalShipped: Scalars['Float']['output'];
};

export type SubmitConsultationFormInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  formKey: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type SubmitConsultationFormResponse = {
  customerId: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Subscription = {
  generateSerialNumberProgress: ExportProgress;
  imageConvertProgress: ImageConvertProgress;
  importDeviceProgress: ExportProgress;
};


export type SubscriptionGenerateSerialNumberProgressArgs = {
  exportId?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionImageConvertProgressArgs = {
  jobId: Scalars['String']['input'];
};


export type SubscriptionImportDeviceProgressArgs = {
  exportId?: InputMaybe<Scalars['String']['input']>;
};

export type SyncNhanhProductMappingsInput = {
  onlyMissing?: InputMaybe<Scalars['Boolean']['input']>;
  partnerCredentialId: Scalars['ID']['input'];
};

export type TransferDeviceBatchInput = {
  items: Array<TransferDeviceInput>;
};

export type TransferDeviceInput = {
  fromWarehouseId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
  toWarehouseId: Scalars['ID']['input'];
};

export type UpdateBusinessRoleInput = {
  code?: InputMaybe<RoleCode>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateComponentTypeInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  warrantyMonth?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateCountryInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerInput = {
  customerId: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CustomerStatus>;
};

export type UpdateCustomerStatusInput = {
  customerId: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  status: CustomerStatus;
};

export type UpdateDeviceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeId?: InputMaybe<Scalars['String']['input']>;
  firmwareVersion?: InputMaybe<Scalars['String']['input']>;
  hardwareVersion?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  serial?: InputMaybe<Scalars['String']['input']>;
  warrantyMonth?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateDeviceTypeInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  componentTypes?: InputMaybe<Array<DeviceTypeComponentItemInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  switchCount?: InputMaybe<Scalars['Float']['input']>;
  warrantyMonth?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateFirmwareInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  filePath?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  modelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  releaseNotes?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<FirmwareTypeEnum>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateModelInput = {
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeId?: InputMaybe<Scalars['String']['input']>;
  discountPrice?: InputMaybe<Scalars['Float']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateOrganizationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  deviceIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  favicon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  packageId?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  shortName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateShippingStatusInput = {
  location?: InputMaybe<Scalars['String']['input']>;
  newStatus: ShippingStatusEnum;
  note?: InputMaybe<Scalars['String']['input']>;
  returnWarehouseId?: InputMaybe<Scalars['ID']['input']>;
  stockHistoryId?: InputMaybe<Scalars['String']['input']>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isRequiredReLogin?: InputMaybe<Scalars['Boolean']['input']>;
  isResetPassword?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateViettelPostOrderStatusInput = {
  environment?: PartnerEnvironment;
  note?: InputMaybe<Scalars['String']['input']>;
  partnerCredentialId?: InputMaybe<Scalars['ID']['input']>;
  shippingOrderId?: InputMaybe<Scalars['ID']['input']>;
  shippingStatus?: InputMaybe<ShippingStatusEnum>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['Int']['input'];
};

export type UpdateWarehouseInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  managerName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWebsiteBannerInput = {
  image?: InputMaybe<Scalars['Upload']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<WebsiteBannerPageEnum>;
  redirectUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UploadFileResponse = {
  basePath?: Maybe<Scalars['String']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  folder?: Maybe<Scalars['String']['output']>;
  md5?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type UpsertNhanhCredentialInput = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  allowedDepotIds?: InputMaybe<Scalars['JSON']['input']>;
  apiKey?: InputMaybe<Scalars['String']['input']>;
  appId?: InputMaybe<Scalars['String']['input']>;
  businessId?: InputMaybe<Scalars['String']['input']>;
  environment?: PartnerEnvironment;
  id?: InputMaybe<Scalars['ID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Scalars['JSON']['input']>;
  secretKey?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  webhookVerifyToken?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertNhanhProductMappingInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  modelId: Scalars['ID']['input'];
  nhanhProductId: Scalars['String']['input'];
  partnerCredentialId: Scalars['ID']['input'];
  productCode?: InputMaybe<Scalars['String']['input']>;
  productName?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertPartnerCredentialInput = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  allowedDepotIds?: InputMaybe<Scalars['JSON']['input']>;
  apiKey?: InputMaybe<Scalars['String']['input']>;
  appId?: InputMaybe<Scalars['String']['input']>;
  businessId?: InputMaybe<Scalars['String']['input']>;
  environment?: PartnerEnvironment;
  id?: InputMaybe<Scalars['ID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  partnerKey: PartnerKey;
  password?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Scalars['JSON']['input']>;
  secretKey?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  webhookVerifyToken?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  apiKey?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deviceId?: Maybe<Scalars['String']['output']>;
  deviceToken?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isRequiredReLogin: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organization?: Maybe<Organization>;
  organizationId?: Maybe<Scalars['String']['output']>;
  parent?: Maybe<User>;
  parentId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<BusinessRole>>;
  state: UserState;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** The state of the user account */
export enum UserState {
  ACTIVE = 'ACTIVE',
  CONFIRM_OTP = 'CONFIRM_OTP',
  INACTIVE = 'INACTIVE',
  RESET_PASSWORD = 'RESET_PASSWORD'
}

export type ViettelPostProductDetailInput = {
  productName: Scalars['String']['input'];
  productPrice: Scalars['Int']['input'];
  productQuantity: Scalars['Int']['input'];
  productWeight: Scalars['Int']['input'];
};

export type Ward = {
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  name_with_type?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  path_with_type?: Maybe<Scalars['String']['output']>;
  province: Province;
  provinceId: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Warehouse = {
  address?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  managerName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nhanhDepotId?: Maybe<Scalars['String']['output']>;
  nhanhPartnerCredential?: Maybe<PartnerCredential>;
  nhanhPartnerCredentialId?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type WarehouseSearchInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
};

/** Warranty lookup data source */
export enum WarrantyDataSource {
  LEGACY_LARAVEL = 'LEGACY_LARAVEL',
  LOCAL = 'LOCAL'
}

export type WarrantyDeviceHistoryResponse = {
  activatedAt?: Maybe<Scalars['Float']['output']>;
  batchCode?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  deviceId?: Maybe<Scalars['String']['output']>;
  deviceName?: Maybe<Scalars['String']['output']>;
  expiredAt?: Maybe<Scalars['Float']['output']>;
  histories: Array<WarrantyHistory>;
  isUnderWarranty: Scalars['Boolean']['output'];
  legacyWarranties: Array<LegacyWarrantyInfoResponse>;
  modelId?: Maybe<Scalars['String']['output']>;
  modelName?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  source: WarrantyDataSource;
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
  warrantySerial?: Maybe<Scalars['String']['output']>;
};

/** Loại sự kiện bảo hành */
export enum WarrantyEventType {
  ACTIVATED = 'ACTIVATED',
  CLAIM = 'CLAIM',
  COMPONENT_REPLACED = 'COMPONENT_REPLACED',
  COMPONENT_SOLD = 'COMPONENT_SOLD',
  EXTENDED = 'EXTENDED',
  REPAIRED = 'REPAIRED',
  REPAIRED_PAID = 'REPAIRED_PAID',
  REPLACED = 'REPLACED',
  RETURNED = 'RETURNED',
  VOIDED = 'VOIDED'
}

export type WarrantyHistory = {
  batchCode?: Maybe<Scalars['String']['output']>;
  componentSerial?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customer?: Maybe<Customer>;
  customerId?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  device?: Maybe<Device>;
  deviceId: Scalars['String']['output'];
  eventAt: Scalars['Float']['output'];
  eventType: WarrantyEventType;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  performedById?: Maybe<Scalars['String']['output']>;
  serialNumber: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  warrantySerial?: Maybe<Scalars['String']['output']>;
};

export type WarrantyHistoryInfoResponse = {
  action: WarrantyEventType;
  time: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
};

export type WarrantyHistorySearchInput = {
  batchCode?: InputMaybe<Scalars['String']['input']>;
  deviceId?: InputMaybe<Scalars['ID']['input']>;
  eventType?: InputMaybe<WarrantyEventType>;
  fromEventAt?: InputMaybe<Scalars['Float']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  size?: Scalars['Int']['input'];
  toEventAt?: InputMaybe<Scalars['Float']['input']>;
  warrantySerial?: InputMaybe<Scalars['String']['input']>;
};

export type WarrantyInfoResponse = {
  activatedAt?: Maybe<Scalars['Float']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  deviceName?: Maybe<Scalars['String']['output']>;
  expiredAt?: Maybe<Scalars['Float']['output']>;
  histories: Array<WarrantyHistoryInfoResponse>;
  isUnderWarranty: Scalars['Boolean']['output'];
  legacyWarranties: Array<LegacyWarrantyInfoResponse>;
  modelName?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  source: WarrantyDataSource;
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
};

export type WebsiteBanner = {
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  imageUrl: Scalars['String']['output'];
  imageUrlCallback?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  organization?: Maybe<Organization>;
  organizationId?: Maybe<Scalars['String']['output']>;
  page?: Maybe<WebsiteBannerPageEnum>;
  redirectUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** The different types of website banner page */
export enum WebsiteBannerPageEnum {
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  HOME = 'HOME',
  LEARNING = 'LEARNING'
}
