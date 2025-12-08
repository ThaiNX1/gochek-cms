import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { debounceTime, Subject } from 'rxjs';
import { ShopService, ProductFilter, SortOption } from '../../services/shop.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Category } from '../../data/categories';
import { Product } from '../../data/products';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <div class="container mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <!-- Breadcrumb -->
      <nav class="flex mb-6 text-sm">
        <a routerLink="/shop" class="text-gray-500 hover:text-gray-700">Trang chủ</a>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-900 font-medium">Sản phẩm</span>
      </nav>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar Filters (Desktop) -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <div class="sticky top-[88px] bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <h3 class="font-bold text-lg text-gray-900">Bộ lọc</h3>

            <!-- Categories -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-3">Danh mục</h4>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <label
                  *ngFor="let category of categories"
                  class="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                >
                  <input
                    type="radio"
                    name="category"
                    [value]="category.id"
                    [(ngModel)]="filter.categoryId"
                    (change)="applyFilters()"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span class="text-sm">{{ category.name }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    [(ngModel)]="filter.categoryId"
                    (change)="applyFilters()"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span class="text-sm font-medium">Tất cả</span>
                </label>
              </div>
            </div>

            <!-- Brands -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-3">Thương hiệu</h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <label
                  *ngFor="let brand of brands"
                  class="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                >
                  <input
                    type="checkbox"
                    [value]="brand"
                    [checked]="filter.brand?.includes(brand)"
                    (change)="toggleBrand(brand)"
                    class="w-4 h-4 text-blue-600 rounded"
                  />
                  <span class="text-sm">{{ brand }}</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-3">Khoảng giá</h4>
              <div class="space-y-3">
                <input
                  type="number"
                  [(ngModel)]="filter.minPrice"
                  (ngModelChange)="onPriceChange()"
                  placeholder="Từ"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  [(ngModel)]="filter.maxPrice"
                  (ngModelChange)="onPriceChange()"
                  placeholder="Đến"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t">
              <button
                (click)="applyFilters()"
                class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Áp dụng
              </button>
              <button
                (click)="clearFilters()"
                class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </aside>

        <!-- Mobile Filter Toggle -->
        <div class="lg:hidden mb-4">
          <button
            (click)="toggleMobileFilters()"
            class="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="font-medium">Bộ lọc</span>
          </button>
        </div>

        <!-- Mobile Filters Overlay -->
        <div
          *ngIf="mobileFiltersOpen"
          class="lg:hidden fixed inset-0 bg-black/50 z-50"
          (click)="toggleMobileFilters()"
        >
          <div
            class="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto"
            (click)="$event.stopPropagation()"
          >
            <div class="p-6 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-lg">Bộ lọc</h3>
                <button (click)="toggleMobileFilters()" class="text-gray-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Same filters as desktop -->
              <div>
                <h4 class="font-semibold mb-3">Danh mục</h4>
                <div class="space-y-2">
                  <label
                    *ngFor="let category of categories"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category-mobile"
                      [value]="category.id"
                      [(ngModel)]="filter.categoryId"
                      class="w-4 h-4"
                    />
                    <span class="text-sm">{{ category.name }}</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 class="font-semibold mb-3">Thương hiệu</h4>
                <div class="space-y-2">
                  <label *ngFor="let brand of brands" class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      [value]="brand"
                      [checked]="filter.brand?.includes(brand)"
                      (change)="toggleBrand(brand)"
                      class="w-4 h-4 rounded"
                    />
                    <span class="text-sm">{{ brand }}</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 class="font-semibold mb-3">Khoảng giá</h4>
                <div class="space-y-3">
                  <input
                    type="number"
                    [(ngModel)]="filter.minPrice"
                    placeholder="Từ"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    [(ngModel)]="filter.maxPrice"
                    placeholder="Đến"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div class="flex gap-2 pt-4">
                <button
                  (click)="applyFilters(); toggleMobileFilters()"
                  class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium"
                >
                  Áp dụng
                </button>
                <button
                  (click)="clearFilters()"
                  class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Toolbar -->
          <div class="flex items-center justify-between mb-6 bg-white rounded-lg border border-gray-200 px-4 py-3">
            <span class="text-sm text-gray-600">
              Tìm thấy <span class="font-semibold text-gray-900">{{ products.length }}</span> sản phẩm
            </span>
            <select
              [(ngModel)]="sortOption"
              (change)="applyFilters()"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>

          <!-- Products -->
          <div *ngIf="loading" class="text-center py-12">
            <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600">Đang tải...</p>
          </div>

          <div
            *ngIf="!loading && products.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <app-product-card *ngFor="let product of products" [product]="product"></app-product-card>
          </div>

          <div
            *ngIf="!loading && products.length === 0"
            class="text-center py-12 bg-white rounded-lg border border-gray-200"
          >
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-gray-600">Không tìm thấy sản phẩm phù hợp</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  categories: Category[] = [];
  brands: string[] = [];
  products: Product[] = [];
  loading = false;
  mobileFiltersOpen = false;

  filter: ProductFilter = {
    brand: [],
  };
  sortOption: SortOption = 'default';

  private priceChangeSubject = new Subject<void>();

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Shop - Sản phẩm | Tech Store');
    this.metaService.updateTag({
      name: 'description',
      content: 'Khám phá các sản phẩm công nghệ chính hãng với giá tốt nhất',
    });

    this.loadCategories();
    this.loadBrands();

    // Listen to query params
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.filter.categoryId = params['category'];
      }
      if (params['search']) {
        this.filter.search = params['search'];
      }
      this.applyFilters();
    });

    // Debounce price changes
    this.priceChangeSubject.pipe(debounceTime(200)).subscribe(() => {
      this.applyFilters();
    });
  }

  loadCategories(): void {
    this.shopService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  loadBrands(): void {
    this.shopService.getBrands().subscribe((data) => {
      this.brands = data;
    });
  }

  applyFilters(): void {
    this.loading = true;
    this.shopService.getProducts(this.filter, this.sortOption).subscribe((data) => {
      this.products = data;
      this.loading = false;
    });
  }

  clearFilters(): void {
    this.filter = { brand: [] };
    this.sortOption = 'default';
    this.applyFilters();
  }

  toggleBrand(brand: string): void {
    if (!this.filter.brand) {
      this.filter.brand = [];
    }
    const index = this.filter.brand.indexOf(brand);
    if (index > -1) {
      this.filter.brand.splice(index, 1);
    } else {
      this.filter.brand.push(brand);
    }
    this.applyFilters();
  }

  onPriceChange(): void {
    this.priceChangeSubject.next();
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }
}
