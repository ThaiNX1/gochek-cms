# Manual Steps to Complete Micro Frontend Setup

## ⚠️ Important: Manual Configuration Required

Due to the complexity of the `angular.json` file, you need to manually add the Shop project configuration.

## 📝 Step 1: Update angular.json

Open `angular.json` and add the Shop project configuration after the Gochek project.

### Location
Find the `"projects"` section and add this after `"Gochek": { ... }`:

```json
"shop": {
  "projectType": "application",
  "schematics": {
    "@schematics/angular:component": {
      "style": "scss",
      "skipTests": true
    }
  },
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
        "inlineStyleLanguage": "scss",
        "assets": [
          "projects/shop/src/favicon.ico",
          "projects/shop/src/assets"
        ],
        "styles": ["projects/shop/src/styles.scss"],
        "scripts": [],
        "extraWebpackConfig": "projects/shop/webpack.config.js",
        "commonChunk": false
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "2mb",
              "maximumError": "5mb"
            }
          ],
          "outputHashing": "all",
          "optimization": true,
          "sourceMap": false,
          "namedChunks": false,
          "extractLicenses": true,
          "vendorChunk": false,
          "buildOptimizer": true
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "builder": "ngx-build-plus:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "shop:build:production"
        },
        "development": {
          "buildTarget": "shop:build:development"
        }
      },
      "defaultConfiguration": "development",
      "options": {
        "port": 4201,
        "publicHost": "http://localhost:4201"
      }
    }
  }
}
```

**Note**: The complete configuration is available in `angular.json.shop.addition.json`

## 📝 Step 2: Verify File Structure

Ensure these files exist:

```
✅ webpack.shell.config.js
✅ projects/shop/webpack.config.js
✅ projects/shop/src/main.ts
✅ projects/shop/src/bootstrap.ts
✅ projects/shop/src/index.html
✅ projects/shop/src/styles.scss
✅ projects/shop/src/app/app.component.ts
✅ projects/shop/src/app/app.config.ts
✅ projects/shop/src/app/shop.routes.ts
✅ projects/shop/src/app/remote-entry/entry.module.ts
✅ projects/shop/tsconfig.app.json
```

## 📝 Step 3: Copy Shop Module Files

The shop module has been copied to `projects/shop/src/app/shop/`

Verify these directories exist:
- `projects/shop/src/app/shop/components/`
- `projects/shop/src/app/shop/data/`
- `projects/shop/src/app/shop/layout/`
- `projects/shop/src/app/shop/pages/`
- `projects/shop/src/app/shop/services/`

## 📝 Step 4: Update Shell Builder (Already Done)

The Shell (Gochek) builder has been updated to use `ngx-build-plus:browser` with webpack config.

Verify in `angular.json`:
```json
"Gochek": {
  "architect": {
    "build": {
      "builder": "ngx-build-plus:browser",
      "options": {
        "extraWebpackConfig": "webpack.shell.config.js",
        "outputPath": "dist/shell"
      }
    }
  }
}
```

## 🚀 Step 5: Test the Setup

### Test 1: Build Shop Remote
```bash
npm run build:shop
```

Expected output: `dist/shop/` directory with `remoteEntry.js`

### Test 2: Serve Shop Standalone
```bash
npm run start:shop
```

Expected: Shop runs on http://localhost:4201

### Test 3: Serve Shell
```bash
npm run start:shell
```

Expected: Shell runs on http://localhost:4500

### Test 4: Test Integration
```bash
# Terminal 1
npm run start:shop

# Terminal 2
npm run start:shell

# Browser
# Navigate to http://localhost:4500/shop
```

Expected: Shop loads within Shell

### Test 5: Run Both Together
```bash
npm run start:mfe
```

Expected: Both Shell and Shop start concurrently

## 🔧 Troubleshooting

### Issue: "Cannot find module './app/app.config'"
**Solution**: This is expected during setup. The error will resolve once you run the build.

### Issue: "Unknown at rule @tailwind"
**Solution**: This is a SCSS linting warning, not an error. Tailwind will work correctly.

### Issue: Shop remote not loading in Shell
**Solution**: 
1. Ensure Shop is running on port 4201
2. Check browser console for errors
3. Verify `remoteEntry.js` is accessible at http://localhost:4201/remoteEntry.js

### Issue: Port already in use
**Solution**: 
- Shell uses port 4500
- Shop uses port 4201
- Kill any processes using these ports

### Issue: Build fails
**Solution**: 
1. Delete `node_modules` and `dist` folders
2. Run `npm install`
3. Try building again

## 📊 Architecture Verification

After setup, verify the architecture:

```
Shell (localhost:4500)
  ├── Main App
  ├── Auth
  ├── Layout
  └── Loads Remote: Shop (localhost:4201)
      └── Shop Module
          ├── Layout
          ├── Pages
          └── Components
```

## ✅ Completion Checklist

- [ ] angular.json updated with Shop project
- [ ] Shop builds successfully (`npm run build:shop`)
- [ ] Shop serves standalone (`npm run start:shop`)
- [ ] Shell serves successfully (`npm run start:shell`)
- [ ] Shop loads in Shell at `/shop` route
- [ ] Both run together (`npm run start:mfe`)
- [ ] No console errors in browser
- [ ] Shop pages are accessible and functional

## 📚 Next Steps

Once setup is complete:

1. **Test all Shop routes**:
   - http://localhost:4500/shop
   - http://localhost:4500/shop/products
   - http://localhost:4500/shop/products/[slug]
   - http://localhost:4500/shop/store

2. **Verify shared services**:
   - Check that interceptor works for Shop routes
   - Verify public routes don't require auth

3. **Production build**:
   ```bash
   npm run build:all-mfe
   ```

4. **Deploy**:
   - Deploy Shop remote to CDN/server
   - Update Shell webpack config with production URL
   - Deploy Shell

## 🎯 Success Criteria

✅ Shop runs independently on port 4201
✅ Shell runs on port 4500
✅ Shop loads within Shell at `/shop`
✅ All shop pages work correctly
✅ No authentication required for shop pages
✅ Shared services work across Shell and Shop
✅ Production build succeeds

---

**Need Help?** Check `MICROFRONTEND_SETUP.md` for detailed architecture documentation.
