# Micro Frontend Setup Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           Shell (Host)                  │
│         Port: 4500                      │
│                                         │
│  - Main App Layout                      │
│  - Authentication                       │
│  - Shared Services                      │
│  - Core Features                        │
│                                         │
│  Shares:                                │
│  ✓ CommonService                        │
│  ✓ ApiService                           │
│  ✓ LocalStorageService                  │
│  ✓ BrandingService                      │
│  ✓ Auth Guards                          │
│  ✓ Interceptors                         │
└─────────────────────────────────────────┘
                    │
                    │ Module Federation
                    ▼
┌─────────────────────────────────────────┐
│         Shop (Remote)                   │
│         Port: 4201                      │
│                                         │
│  - Shop Layout                          │
│  - Product Pages                        │
│  - Shop Components                      │
│  - Shop Services                        │
│                                         │
│  Consumes from Shell:                   │
│  ✓ Shared Services                      │
│  ✓ Auth (for future checkout)           │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
Beacon_CMS/
├── src/                          # Shell Application
│   ├── app/
│   │   ├── core/                 # Shared services
│   │   │   ├── services/
│   │   │   │   ├── common.service.ts
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── local-storage.service.ts
│   │   │   │   └── service-interceptor.ts
│   │   │   └── guards/
│   │   ├── layout/               # Main app layout
│   │   └── auth/                 # Authentication
│   └── main.ts
│
├── projects/
│   └── shop/                     # Shop Remote Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── shop/         # Shop module (copied from src/app/shop)
│       │   │   ├── remote-entry/
│       │   │   │   └── entry.module.ts
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   └── shop.routes.ts
│       │   ├── main.ts
│       │   ├── bootstrap.ts
│       │   ├── index.html
│       │   └── styles.scss
│       ├── tsconfig.app.json
│       └── webpack.config.js
│
├── webpack.shell.config.js       # Shell webpack config
└── angular.json                  # Updated with both projects
```

## 🔧 Configuration Files

### 1. Shell Webpack Config (`webpack.shell.config.js`)

```javascript
const {
  shareAll,
  withModuleFederationPlugin,
} = require("@angular-architects/module-federation/webpack");

module.exports = withModuleFederationPlugin({
  name: "shell",

  remotes: {
    shop: "http://localhost:4201/remoteEntry.js",
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: "auto",
    }),
  },

  sharedMappings: ["@angular-architects/module-federation-tools"],
});
```

### 2. Shop Webpack Config (`projects/shop/webpack.config.js`)

```javascript
const {
  shareAll,
  withModuleFederationPlugin,
} = require("@angular-architects/module-federation/webpack");

module.exports = withModuleFederationPlugin({
  name: "shop",

  exposes: {
    "./Module": "./projects/shop/src/app/remote-entry/entry.module.ts",
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: "auto",
    }),
  },

  sharedMappings: ["@angular-architects/module-federation-tools"],
});
```

## 📝 Angular.json Configuration

Add Shop project to `angular.json`:

```json
{
  "projects": {
    "shop": {
      "projectType": "application",
      "root": "projects/shop",
      "sourceRoot": "projects/shop/src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "ngx-build-plus:browser",
          "options": {
            "outputPath": "dist/shop",
            "index": "projects/shop/src/index.html",
            "main": "projects/shop/src/bootstrap.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "projects/shop/tsconfig.app.json",
            "styles": ["projects/shop/src/styles.scss"],
            "extraWebpackConfig": "projects/shop/webpack.config.js",
            "commonChunk": false
          }
        },
        "serve": {
          "builder": "ngx-build-plus:dev-server",
          "options": {
            "buildTarget": "shop:build",
            "port": 4201
          }
        }
      }
    }
  }
}
```

## 🚀 Running the Applications

### Development Mode

```bash
# Terminal 1: Start Shell (Host)
npm run start:shell
# or
ng serve --project OxiiCore --port 4500

# Terminal 2: Start Shop (Remote)
npm run start:shop
# or
ng serve --project shop --port 4201
```

### Build for Production

```bash
# Build Shop Remote
ng build shop --configuration production

# Build Shell
ng build OxiiCore --configuration production
```

## 📦 Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "start:shell": "ng serve --project OxiiCore --port 4500",
    "start:shop": "ng serve --project shop --port 4201",
    "start:mfe": "concurrently \"npm run start:shell\" \"npm run start:shop\"",
    "build:shell": "ng build OxiiCore --configuration production",
    "build:shop": "ng build shop --configuration production",
    "build:all": "npm run build:shop && npm run build:shell"
  }
}
```

## 🔗 Loading Remote in Shell

Update Shell's `app.routes.ts`:

```typescript
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  // ... existing routes
  {
    path: 'shop',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Module',
      }).then((m) => m.RemoteEntryModule),
  },
  // ... other routes
];
```

## 🔐 Sharing Services from Shell to Shop

### 1. Create Shared Service Provider

**File**: `src/app/core/shared-services.provider.ts`

```typescript
import { Provider } from '@angular/core';
import { CommonService } from './services/common.service';
import { ApiService } from './services/api.service';
import { LocalStorageService } from './services/local-storage.service';
import { BrandingService } from './services/branding.service';

export const SHARED_SERVICES: Provider[] = [
  CommonService,
  ApiService,
  LocalStorageService,
  BrandingService,
];
```

### 2. Provide in Shell

**File**: `src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { SHARED_SERVICES } from './core/shared-services.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    ...SHARED_SERVICES,
  ],
};
```

### 3. Consume in Shop Remote

**File**: `projects/shop/src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SHOP_ROUTES } from './shop.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(SHOP_ROUTES),
    provideHttpClient(),
    provideAnimations(),
    // Services will be shared from Shell via Module Federation
  ],
};
```

## 🧪 Testing

### Test Shell Standalone
```bash
npm run start:shell
# Navigate to http://localhost:4500
```

### Test Shop Standalone
```bash
npm run start:shop
# Navigate to http://localhost:4201
```

### Test Integration
```bash
# Start both
npm run start:mfe

# Navigate to http://localhost:4500/shop
# Shop remote should load within Shell
```

## 📊 Benefits

1. **Independent Deployment**: Shop can be deployed separately
2. **Team Autonomy**: Different teams can work on Shell and Shop
3. **Lazy Loading**: Shop only loads when needed
4. **Shared Dependencies**: Common libraries loaded once
5. **Scalability**: Easy to add more remotes (e.g., Admin, Reports)

## ⚠️ Important Notes

1. **Port Configuration**: 
   - Shell: 4500
   - Shop: 4201
   - Ensure both ports are available

2. **CORS**: In development, both apps run on localhost, so no CORS issues

3. **Shared State**: Services shared via Module Federation maintain singleton state

4. **Build Order**: Always build remotes before shell in production

5. **Version Compatibility**: Ensure Angular versions match across Shell and Remotes

## 🔄 Migration Checklist

- [x] Create Shop remote project structure
- [x] Configure webpack for Module Federation
- [x] Copy shop module to remote
- [x] Create entry module for remote
- [x] Update angular.json
- [ ] Update Shell routes to load remote
- [ ] Test standalone Shop
- [ ] Test integrated Shell + Shop
- [ ] Update deployment scripts

## 🚢 Deployment

### Development
- Run both Shell and Shop locally
- Shop remote entry: `http://localhost:4201/remoteEntry.js`

### Production
- Deploy Shop to: `https://shop.yourdomain.com`
- Update Shell webpack config:
  ```javascript
  remotes: {
    shop: "https://shop.yourdomain.com/remoteEntry.js",
  }
  ```

---

**Status**: 🚧 In Progress
**Next Steps**: Complete angular.json configuration and test integration
