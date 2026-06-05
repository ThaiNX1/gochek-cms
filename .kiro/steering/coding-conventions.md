# Coding Conventions

## Naming Conventions

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component class | PascalCase | `DeviceComponent` |
| Service class | PascalCase + Service | `ApiService`, `CommonService` |
| Interface/Type | PascalCase | `Device`, `PaginatedDeviceResponse` |
| Enum | PascalCase + Enum | `TableColumnType`, `PermissionEnum` |
| Enum value | UPPER_SNAKE_CASE | `DEVICES_MANAGE`, `DATE_TIME` |
| Variable/method | camelCase | `filterForm`, `onGetDevice()` |
| Constant | camelCase | `storageKey.token` |
| File | kebab-case | `device.component.ts`, `api.service.ts` |
| GraphQL query | UPPER_SNAKE_CASE | `GET_DEVICES`, `UPDATE_DEVICE` |

## Cấu trúc file Feature Page

```
pages/feature-name/
├── feature-name.component.ts
├── feature-name.component.html
├── feature-name.component.scss
└── feature-name-create/          # Sub-page tạo/chỉnh sửa (nếu cần)
    ├── feature-name-create.component.ts
    ├── feature-name-create.component.html
    └── feature-name-create.component.scss
```

## Component Pattern

Mọi feature page **phải** extend `BaseClass`:

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TableComponent,
    RouterModule,
    DirectiveModule,
    ReactiveFormsModule,
    SelectSearchComponent,
  ],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent extends BaseClass {
  constructor(private dialog: MatDialog) {
    super();
    // Khai báo columns trong constructor
    this.columns = [ ... ];
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    // Khởi tạo filterForm
    this.filterForm = new FormGroup({ ... });
    // Load data
    await this.onGetData();
  }
}
```

## Quy tắc quan trọng

- **Standalone components**: Không dùng NgModule, import trực tiếp trong `imports[]`
- **Inject service**: Dùng `this.injector.get(ServiceClass)` thay vì inject qua constructor (trừ `MatDialog`)
- **Async/await**: Ưu tiên `async/await` thay vì `.subscribe()` cho API calls
- **Template dialogs**: Dùng `@ViewChild('templateRef') templateRef!: TemplateRef<any>` cho dialog content
- **Ngôn ngữ UI**: Tất cả label, placeholder, thông báo dùng **tiếng Việt**
- **Column config**: Khai báo `this.columns` trong `constructor`, không phải `ngOnInit`
