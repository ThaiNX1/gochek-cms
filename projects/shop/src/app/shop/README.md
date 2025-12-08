# Shop Module - E-commerce Module for Angular

## Overview
A complete standalone e-commerce shop module built with Angular 18+ and TailwindCSS. This module is fully independent from the main application layout and provides a complete shopping experience with mock data.

## Features
✅ **Standalone Architecture** - Fully independent module with its own layout
✅ **Responsive Design** - Mobile-first approach (xs→2 cols, md→3, lg→4/5)
✅ **Lazy Loading** - Module is lazy-loaded for optimal performance
✅ **SEO Optimized** - Title and meta tags configured for each page
✅ **Mock Data Ready** - Complete with sample data, ready to swap with real APIs
✅ **TailwindCSS** - Modern utility-first styling
✅ **Sticky Header** - Header stays visible on scroll

## Structure

```
src/app/shop/
├── data/                          # Mock data
│   ├── categories.ts              # 12 product categories
│   ├── products.ts                # 12 sample products
│   ├── store.ts                   # Store information
│   └── banners.ts                 # Homepage banners
├── services/
│   └── shop.service.ts            # Data access service with filters & sorting
├── components/                    # Reusable components
│   ├── banner-slider.component.ts # Auto-play banner slider
│   ├── category-card.component.ts # Category display card
│   ├── product-card.component.ts  # Product card with discount badge
│   ├── price-badge.component.ts   # Price display with discount
│   └── tabs.component.ts          # Tab navigation component
├── layout/                        # Shop-specific layout
│   ├── shop-layout.component.ts   # Main layout wrapper
│   ├── header.component.ts        # Sticky header with search & cart
│   └── footer.component.ts        # Footer with links & contact info
├── pages/                         # Main pages
│   ├── home/
│   │   └── shop-home.component.ts # Homepage with banners & products
│   ├── products/
│   │   └── product-list.component.ts # Product listing with filters
│   ├── product-detail/
│   │   └── product-detail.component.ts # Product detail with gallery
│   └── store-info/
│       └── store-info.component.ts # Store information page
├── shop.routes.ts                 # Shop module routes
└── README.md                      # This file
```

## Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/shop` | ShopHomeComponent | Homepage with banners, categories, top products | ❌ No |
| `/shop/products` | ProductListComponent | Product listing with filters & sorting | ❌ No |
| `/shop/products/:slug` | ProductDetailComponent | Product detail with image gallery | ❌ No |
| `/shop/store` | StoreInfoComponent | Store information & policies | ❌ No |

**Note**: All shop routes are public and don't require authentication. Authorization header is automatically excluded by the interceptor for these routes. Future features like checkout and order creation will require authentication.

## Pages

### 1. Home (`/shop`)
- **Banner Slider**: Auto-play carousel with 4 banners
- **Categories Grid**: 12 categories in responsive grid (3-8 columns)
- **Top Selling Products**: 10 best-selling products (2-5 columns)
- **Featured Banners**: 2 promotional banners
- **New Products**: Latest products with "NEW" badge

### 2. Product List (`/shop/products`)
- **Sidebar Filters** (Desktop):
  - Category selection (radio buttons)
  - Brand selection (checkboxes)
  - Price range (min/max inputs)
  - Apply & Clear buttons
- **Mobile Filters**: Slide-in drawer with same filters
- **Sorting Options**: Default, Price ↑↓, Name A-Z
- **Product Grid**: Responsive 2-4 columns
- **Breadcrumb Navigation**

### 3. Product Detail (`/shop/products/:slug`)
- **Image Gallery**: Main image + thumbnails with selection
- **Product Info**:
  - Brand, name, rating, sold count
  - Price with discount badge
  - Color/size variants
  - Quantity stepper
  - Add to cart & Buy now buttons
- **Tabs**:
  - Description
  - Specifications table
  - Reviews (placeholder)
- **Related Products**: 8 similar products

### 4. Store Info (`/shop/store`)
- **Banner**: Store banner with name & description
- **Contact Information**:
  - Address with icon
  - Phone number
  - Email
  - Opening hours
- **Map Placeholder**: Ready for Google Maps integration
- **Policies**: 4 expandable policy sections

## Components

### BannerSliderComponent
Auto-play carousel with navigation arrows and dots.
```typescript
<app-banner-slider 
  [banners]="banners" 
  [autoPlay]="true" 
  [interval]="5000">
</app-banner-slider>
```

### ProductCardComponent
Displays product with image, name, price, discount badge, and tags.
```typescript
<app-product-card [product]="product"></app-product-card>
```

### CategoryCardComponent
Category display with icon and name.
```typescript
<app-category-card [category]="category"></app-category-card>
```

### PriceBadgeComponent
Price display with optional sale price and discount percentage.
```typescript
<app-price-badge 
  [price]="product.price" 
  [salePrice]="product.salePrice">
</app-price-badge>
```

### TabsComponent
Tab navigation with active state.
```typescript
<app-tabs 
  [tabs]="tabs" 
  [activeTabId]="activeTab" 
  (tabChange)="onTabChange($event)">
</app-tabs>
```

## Service

### ShopService
Provides data access methods with filtering and sorting:

```typescript
// Get all categories
getCategories(): Observable<Category[]>

// Get products with filters
getProducts(filter?: ProductFilter, sort?: SortOption): Observable<Product[]>

// Get product by slug
getProductBySlug(slug: string): Observable<Product | undefined>

// Get top selling products
getTopSelling(limit?: number): Observable<Product[]>

// Get related products
getRelatedProducts(productId: string, limit?: number): Observable<Product[]>

// Get store information
getStoreInfo(): Observable<StoreInfo>

// Get available brands
getBrands(): Observable<string[]>

// Get banners
getBanners(): Observable<Banner[]>
```

**Filter Options:**
```typescript
interface ProductFilter {
  categoryId?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
```

## Mock Data

### Categories (12 items)
- Điện thoại, Laptop, Tablet, Đồng hồ thông minh
- Tai nghe, Phụ kiện, PC & Màn hình, Camera
- Loa, Tivi, Gia dụng, Gaming

### Products (12 items)
- iPhone 15 Pro Max, Samsung Galaxy S24 Ultra
- MacBook Air M3, Dell XPS 13 Plus
- iPad Pro M2, Galaxy Tab S9 Ultra
- Apple Watch Series 9, Galaxy Watch 6 Classic
- AirPods Pro 2, Sony WH-1000XM5
- Accessories (chargers, cables)

Each product includes:
- 4 high-quality images (Unsplash)
- Price with optional sale price
- Brand, rating, sold count
- Variants (colors/sizes)
- Detailed specifications
- Tags (hot, new)

## Responsive Breakpoints

| Breakpoint | Columns | Description |
|------------|---------|-------------|
| xs (default) | 2 | Mobile phones |
| sm (640px+) | 2-3 | Large phones |
| md (768px+) | 3 | Tablets |
| lg (1024px+) | 4-5 | Desktop |

## Styling

All components use TailwindCSS utility classes:
- **Cards**: `rounded-2xl border bg-white hover:shadow-md`
- **Buttons**: `bg-blue-600 text-white rounded-lg hover:bg-blue-700`
- **Inputs**: `border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- **Sticky Header**: `sticky top-0 z-50 bg-white/90 backdrop-blur`

## Integration with Real APIs

To connect to real APIs, update `ShopService`:

```typescript
// Replace mock data with HTTP calls
getProducts(filter?: ProductFilter, sort?: SortOption): Observable<Product[]> {
  return this.http.post<Product[]>('/api/products', { filter, sort });
}
```

### Authentication & Authorization

**Public Routes**: All shop routes are configured as public routes in the interceptor:
- `/shop` - Homepage
- `/shop/products` - Product listing
- `/shop/store` - Store information

These routes **do not include Authorization header** in HTTP requests.

**Future Protected Routes**: When adding features that require authentication (e.g., checkout, orders), add them to `FUTURE_PROTECTED_SHOP_ROUTES` in `src/app/core/constants/public-routes.ts`:

```typescript
export const FUTURE_PROTECTED_SHOP_ROUTES = [
  '/shop/checkout',    // Will require auth
  '/shop/orders',      // Will require auth
  '/shop/account',     // Will require auth
];
```

The interceptor configuration is in `src/app/core/services/service-interceptor.ts`.

## Usage

1. **Navigate to shop**: `http://localhost:4200/shop`
2. **Browse products**: Click categories or use search
3. **Filter products**: Use sidebar filters on product list page
4. **View details**: Click any product card
5. **Add to cart**: Click "Thêm vào giỏ" (currently logs to console)

## Features to Add

- [ ] Shopping cart functionality
- [ ] User authentication
- [ ] Order checkout
- [ ] Payment integration
- [ ] Product reviews & ratings
- [ ] Wishlist
- [ ] Product comparison
- [ ] Search autocomplete
- [ ] Google Maps integration for store location

## Performance

- **Lazy Loading**: Shop module loads only when accessed
- **Image Optimization**: Uses `loading="lazy"` for images
- **Debounced Filters**: Price filter debounced by 200ms
- **Minimal Bundle**: Standalone components reduce bundle size

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states for all interactive elements
- Alt text for all images

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Built with Angular 18+ and TailwindCSS**
