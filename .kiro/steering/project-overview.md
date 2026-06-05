# Project Overview

## Tên project
Gochek - Hệ thống quản lý thiết bị IoT (Device Management Platform)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 18 (Standalone Components) |
| UI Library | Angular Material 18 + Tailwind CSS 3 |
| API | GraphQL (Apollo Angular 7) + REST (HttpClient) |
| Real-time | WebSocket (graphql-ws + socket.io-client) |
| State | NGXS Store |
| Forms | Reactive Forms (FormGroup / FormControl) |
| i18n | @ngx-translate/core (default: `vi`) |
| Date | date-fns |
| Charts | ApexCharts |
| Auth | JWT (localStorage) + Firebase |
| Build | Angular CLI + ngx-build-plus + Module Federation |

## Cấu trúc thư mục

```
src/app/
├── auth/           # Trang xác thực (login, otp, forgot-password)
├── pages/          # Các trang chức năng (feature pages)
├── shared/         # Components, directives, pipes dùng chung
├── core/           # Services, guards, interceptors, constants
├── commons/        # Base class, GraphQL queries, shared types
└── layout/         # Layout chính và routing
```

## Môi trường

- `environment.ts` - Development
- `environment.stg.ts` - Staging
- `environment.prod.ts` - Production

Các biến quan trọng: `apiGraphQL`, `apiRestFull`, `socket`

## Kiến trúc

- **Standalone Components**: Không dùng NgModule, import trực tiếp trong component
- **Lazy Loading**: Tất cả feature pages đều lazy load qua router
- **GraphQL-first**: Ưu tiên dùng Apollo GraphQL cho data fetching
- **Permission-based**: Kiểm soát quyền ở cả route (PageGuard) và UI (PermissionDirective)
- **Micro-frontend**: Module Federation cho app "shop" tách biệt
