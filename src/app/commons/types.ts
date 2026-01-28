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

export type AssignCustomerInput = {
  customerId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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

export type CreateModelInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeId: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
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

export type CreateUserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type CreateWebsiteBannerInput = {
  image?: InputMaybe<Scalars['Upload']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type Customer = {
  assignedToId?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  formKeyId?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  status: CustomerStatus;
  updatedAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type CustomerSearchInput = {
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

export type Device = {
  activeAt?: Maybe<Scalars['Float']['output']>;
  basePath?: Maybe<Scalars['String']['output']>;
  bucket?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
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
  isActive: Scalars['Boolean']['output'];
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
  publicKeyBasepath?: Maybe<Scalars['String']['output']>;
  raFirmware?: Maybe<Firmware>;
  raFirmwareId?: Maybe<Scalars['String']['output']>;
  raFirmwareVersion?: Maybe<Scalars['String']['output']>;
  raHardwareVersion?: Maybe<Scalars['String']['output']>;
  secretKey?: Maybe<Scalars['String']['output']>;
  serialNumber: Scalars['String']['output'];
  signature?: Maybe<Scalars['String']['output']>;
  sourceId?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<DeviceStateEnum>;
  updatedAt: Scalars['DateTime']['output'];
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
  wifiInfo?: Maybe<Scalars['JSON']['output']>;
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
  OTA_FAIL = 'OTA_FAIL',
  OTA_SUCCESS = 'OTA_SUCCESS',
  START_UPDATE = 'START_UPDATE'
}

export type DeviceGenerateSerialNumberInput = {
  count: Scalars['Float']['input'];
  descriptor?: InputMaybe<Scalars['String']['input']>;
  exportId?: InputMaybe<Scalars['String']['input']>;
  prefix?: InputMaybe<Scalars['String']['input']>;
};

export type DeviceOnboardInput = {
  ids: Array<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ownerId: Scalars['String']['input'];
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
  OFFLINE = 'OFFLINE',
  ONBOARDING = 'ONBOARDING',
  ONLINE = 'ONLINE',
  TIMEOUT = 'TIMEOUT'
}

export type DeviceType = {
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  firmware?: Maybe<Firmware>;
  firmwareId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  models?: Maybe<Array<Model>>;
  name: Scalars['String']['output'];
  raFirmware?: Maybe<Firmware>;
  raFirmwareId?: Maybe<Scalars['String']['output']>;
  switchCount?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  warrantyMonth?: Maybe<Scalars['Float']['output']>;
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
  name: Scalars['String']['output'];
  releaseNotes?: Maybe<Scalars['String']['output']>;
  type?: Maybe<FirmwareTypeEnum>;
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['String']['output'];
};

/** The different types of firmware type */
export enum FirmwareTypeEnum {
  ESP_FIRMWARE = 'ESP_FIRMWARE',
  RA_FIRMWARE = 'RA_FIRMWARE'
}

export type GenerateFormKeyResponse = {
  domain: Scalars['String']['output'];
  expiredAt: Scalars['Float']['output'];
  key: Scalars['String']['output'];
};

export type GenerateHistory = {
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  descriptor?: Maybe<Scalars['String']['output']>;
  endSerialNumber?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  linkDownload?: Maybe<Scalars['String']['output']>;
  linkDownloadPath?: Maybe<Scalars['String']['output']>;
  prefix?: Maybe<Scalars['String']['output']>;
  startSerialNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type GenerateHistorySearchInput = {
  endDate?: InputMaybe<Scalars['Float']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  size?: Scalars['Int']['input'];
  startDate?: InputMaybe<Scalars['Float']['input']>;
};

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
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceType?: Maybe<DeviceType>;
  deviceTypeId?: Maybe<Scalars['String']['output']>;
  firmware?: Maybe<Firmware>;
  firmwareId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  raFirmware?: Maybe<Firmware>;
  raFirmwareId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  appLogin: LoginResponse;
  assignCustomer: Customer;
  assignPermissionRole: Permission;
  assignUserRole: User;
  changePassword: User;
  completeOnboarding: Array<Device>;
  confirmOtp: Scalars['Boolean']['output'];
  createBusinessRole: BusinessRole;
  createCountry: Country;
  createDevice: Device;
  createDeviceType: DeviceType;
  createFirmware: Firmware;
  createModel: Model;
  createOrganization: Organization;
  createUser: User;
  createWebsiteBanner: WebsiteBanner;
  deleteBusinessRole: Scalars['Boolean']['output'];
  deleteConnection: DeleteConnectionResponse;
  deleteCountry: Country;
  deleteDeviceType: Scalars['Boolean']['output'];
  deleteFirmware: Scalars['Boolean']['output'];
  deleteModel: Scalars['Boolean']['output'];
  deleteOrganization: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  generateFormKey: GenerateFormKeyResponse;
  generateSerialNumber: Scalars['String']['output'];
  getAllBannerActivePublic: Array<WebsiteBanner>;
  importPermissions: Array<Permission>;
  importProvince: Array<Province>;
  importWard: Array<Ward>;
  login: LoginResponse;
  logout: Scalars['String']['output'];
  refreshToken: RefreshTokenResponse;
  removePermissionRole: Permission;
  removeUserRole: User;
  removeWebsiteBanner: Scalars['Boolean']['output'];
  resendOtp: Scalars['Boolean']['output'];
  submitConsultationForm: SubmitConsultationFormResponse;
  subscribeNotification: User;
  updateBusinessRole: BusinessRole;
  updateCountry: Country;
  updateCustomerStatus: Customer;
  updateDevice: Device;
  updateDeviceType: DeviceType;
  updateFirmware: Firmware;
  updateFirmwareStatus: Scalars['Boolean']['output'];
  updateModel: Model;
  updateOrganization: Organization;
  updateUser: User;
  updateWebsiteBanner: WebsiteBanner;
  uploadFile: UploadFileResponse;
};


export type MutationAppLoginArgs = {
  input: LoginInput;
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


export type MutationCompleteOnboardingArgs = {
  input: DeviceOnboardInput;
};


export type MutationConfirmOtpArgs = {
  otp: Scalars['String']['input'];
};


export type MutationCreateBusinessRoleArgs = {
  input: CreateBusinessRoleInput;
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


export type MutationCreateModelArgs = {
  input: CreateModelInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateWebsiteBannerArgs = {
  input: CreateWebsiteBannerInput;
};


export type MutationDeleteBusinessRoleArgs = {
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


export type MutationGenerateSerialNumberArgs = {
  input: DeviceGenerateSerialNumberInput;
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


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String']['input'];
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


export type MutationSubmitConsultationFormArgs = {
  input: SubmitConsultationFormInput;
};


export type MutationSubscribeNotificationArgs = {
  deviceToken: Scalars['String']['input'];
};


export type MutationUpdateBusinessRoleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBusinessRoleInput;
};


export type MutationUpdateCountryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCountryInput;
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


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
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

export type PaginatedCustomerResponse = {
  data: Array<Customer>;
  pagination: PaginationInfo;
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
  pagination: PaginationResponse;
};

export type PaginatedGenerateHistoryResponse = {
  data: Array<GenerateHistory>;
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

export type PaginatedUserResponse = {
  data: Array<User>;
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
  wards?: Maybe<Array<Ward>>;
};

export type Query = {
  allPrefix: Array<GenerateHistory>;
  businessRole: BusinessRole;
  businessRoleByCode: BusinessRole;
  businessRoles: PaginatedBusinessRoleResponse;
  countries: Array<Country>;
  country: Country;
  customer: Customer;
  customers: PaginatedCustomerResponse;
  device: Device;
  deviceType: DeviceType;
  deviceTypes: PaginatedDeviceTypeResponse;
  devices: PaginatedDeviceResponse;
  firmware: Firmware;
  firmwares: PaginatedFirmwareResponse;
  firmwaresByDeviceType: Array<Firmware>;
  generateHistories: PaginatedGenerateHistoryResponse;
  getDeviceBySerials: Array<Device>;
  model: Model;
  models: PaginatedModelResponse;
  organization: Organization;
  organizations: PaginatedOrganizationResponse;
  permission: Permission;
  permissions: Array<Permission>;
  permissionsByType: Array<Permission>;
  province: Province;
  provinces: Array<Province>;
  provincesByCountry: Array<Province>;
  roleHierarchy: Array<BusinessRole>;
  user: User;
  userProfile: User;
  users: PaginatedUserResponse;
  usersByOrganization: PaginatedUserResponse;
  ward: Ward;
  wards: Array<Ward>;
  wardsByProvince: Array<Ward>;
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


export type QueryGetDeviceBySerialsArgs = {
  serials: Array<Scalars['String']['input']>;
};


export type QueryModelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryModelsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationsArgs = {
  pagination?: InputMaybe<PaginationInput>;
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


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryUsersByOrganizationArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryWardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWardsByProvinceArgs = {
  provinceId: Scalars['ID']['input'];
};


export type QueryWebsiteBannerArgs = {
  id: Scalars['String']['input'];
};


export type QueryWebsiteBannersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type RefreshTokenResponse = {
  access_token: Scalars['String']['output'];
  refresh_token: Scalars['String']['output'];
};

/** The different types of business roles */
export enum RoleCode {
  ADMINISTRATOR = 'ADMINISTRATOR',
  END_USER = 'END_USER',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN'
}

export type SubmitConsultationFormInput = {
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  formKey: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
};

export type SubmitConsultationFormResponse = {
  customerId: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Subscription = {
  generateSerialNumberProgress: ExportProgress;
};


export type SubscriptionGenerateSerialNumberProgressArgs = {
  exportId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBusinessRoleInput = {
  code?: InputMaybe<RoleCode>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateCountryInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerStatusInput = {
  customerId: Scalars['String']['input'];
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
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  deviceTypeId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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

export type UpdateWebsiteBannerInput = {
  image?: InputMaybe<Scalars['Upload']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UploadFileResponse = {
  basePath?: Maybe<Scalars['String']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  folder?: Maybe<Scalars['String']['output']>;
  md5?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type User = {
  apiKey?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deviceId?: Maybe<Scalars['String']['output']>;
  deviceToken?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
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
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};
