import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ShopService } from '../../services/shop.service';
import { Product } from '../../data/products';
import { PriceBadgeComponent } from '../../components/price-badge/price-badge.component';
import { TabsComponent, Tab } from '../../components/tabs/tabs.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PriceBadgeComponent,
    TabsComponent,
    ProductCardComponent,
  ],
  template: `
    <div class="container mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!loading && !product" class="text-center py-12">
        <p class="text-gray-600">Không tìm thấy sản phẩm</p>
        <a routerLink="/shop/products" class="text-blue-600 hover:underline mt-4 inline-block">
          Quay lại danh sách sản phẩm
        </a>
      </div>

      <div *ngIf="product">
        <!-- Breadcrumb -->
        <nav class="flex mb-6 text-sm">
          <a routerLink="/shop" class="text-gray-500 hover:text-gray-700">Trang chủ</a>
          <span class="mx-2 text-gray-400">/</span>
          <a routerLink="/shop/products" class="text-gray-500 hover:text-gray-700">Sản phẩm</a>
          <span class="mx-2 text-gray-400">/</span>
          <span class="text-gray-900 font-medium truncate">{{ product.name }}</span>
        </nav>

        <!-- Product Info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <!-- Gallery -->
          <div>
            <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <div class="aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4">
                <img
                  [src]="selectedImage"
                  [alt]="product.name"
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-zoom-in"
                />
              </div>
              <div class="grid grid-cols-4 gap-2">
                <button
                  *ngFor="let image of product.images; let i = index"
                  (click)="selectImage(i)"
                  [class.ring-2]="selectedImageIndex === i"
                  [class.ring-blue-600]="selectedImageIndex === i"
                  class="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-600 transition-colors"
                >
                  <img [src]="image" [alt]="product.name" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span *ngIf="product.brand" class="text-sm text-blue-600 font-medium">
                  {{ product.brand }}
                </span>
                <span *ngFor="let tag of product.tags" class="px-2 py-1 text-xs font-semibold rounded"
                  [ngClass]="{
                    'bg-orange-100 text-orange-600': tag === 'hot',
                    'bg-blue-100 text-blue-600': tag === 'new'
                  }">
                  {{ tag === 'hot' ? 'HOT' : 'MỚI' }}
                </span>
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {{ product.name }}
              </h1>
              <div class="flex items-center gap-4 text-sm">
                <div *ngIf="product.rating" class="flex items-center gap-1">
                  <span class="text-yellow-400">★</span>
                  <span class="font-medium">{{ product.rating }}</span>
                </div>
                <span class="text-gray-400">|</span>
                <span class="text-gray-600">Đã bán {{ product.sold }}</span>
              </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <app-price-badge
                [price]="product.price"
                [salePrice]="product.salePrice"
              ></app-price-badge>
            </div>

            <!-- Variants -->
            <div *ngIf="product.variants && product.variants.length > 0" class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Màu sắc</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let variant of product.variants; let i = index"
                  (click)="selectedVariant = i"
                  [class.ring-2]="selectedVariant === i"
                  [class.ring-blue-600]="selectedVariant === i"
                  [class.bg-blue-50]="selectedVariant === i"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 transition-colors text-sm"
                >
                  {{ variant.color }}
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Số lượng</h3>
              <div class="flex items-center gap-3">
                <button
                  (click)="decreaseQuantity()"
                  class="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  [(ngModel)]="quantity"
                  min="1"
                  class="w-20 text-center border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  (click)="increaseQuantity()"
                  class="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                (click)="addToCart()"
                class="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </button>
              <button
                (click)="buyNow()"
                class="flex-1 bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors font-semibold"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-12">
          <app-tabs
            [tabs]="tabs"
            [activeTabId]="activeTab"
            (tabChange)="onTabChange($event)"
          ></app-tabs>

          <div class="mt-6">
            <div *ngIf="activeTab === 'description'" class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed">{{ product.description }}</p>
            </div>

            <div *ngIf="activeTab === 'specifications'">
              <table class="w-full">
                <tbody>
                  <tr
                    *ngFor="let spec of product.specifications; let i = index"
                    [class.bg-gray-50]="i % 2 === 0"
                  >
                    <td class="py-3 px-4 font-medium text-gray-900 w-1/3">{{ spec.label }}</td>
                    <td class="py-3 px-4 text-gray-700">{{ spec.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="activeTab === 'reviews'">
              <div class="text-center py-8 text-gray-500">
                <p>Chưa có đánh giá nào</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div *ngIf="relatedProducts.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <app-product-card
              *ngFor="let product of relatedProducts"
              [product]="product"
            ></app-product-card>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  relatedProducts: Product[] = [];
  loading = true;
  selectedImageIndex = 0;
  selectedVariant = 0;
  quantity = 1;
  activeTab = 'description';

  tabs: Tab[] = [
    { id: 'description', label: 'Mô tả chi tiết' },
    { id: 'specifications', label: 'Thông số kỹ thuật' },
    { id: 'reviews', label: 'Đánh giá' },
  ];

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      this.loadProduct(slug);
    });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.shopService.getProductBySlug(slug).subscribe((product) => {
      this.product = product;
      this.loading = false;

      if (product) {
        this.titleService.setTitle(`${product.name} | Tech Store`);
        this.metaService.updateTag({
          name: 'description',
          content: product.description || product.name,
        });

        this.loadRelatedProducts(product.id);
      }
    });
  }

  loadRelatedProducts(productId: string): void {
    this.shopService.getRelatedProducts(productId, 8).subscribe((products) => {
      this.relatedProducts = products;
    });
  }

  get selectedImage(): string {
    return this.product?.images[this.selectedImageIndex] || '';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    console.log('Add to cart:', {
      product: this.product,
      quantity: this.quantity,
      variant: this.product?.variants?.[this.selectedVariant],
    });
    alert('Đã thêm vào giỏ hàng!');
  }

  buyNow(): void {
    console.log('Buy now:', {
      product: this.product,
      quantity: this.quantity,
      variant: this.product?.variants?.[this.selectedVariant],
    });
    alert('Chức năng mua ngay đang được phát triển!');
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }
}
