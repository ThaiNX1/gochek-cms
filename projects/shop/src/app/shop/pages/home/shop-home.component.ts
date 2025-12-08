import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ShopService } from '../../services/shop.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Category } from '../../data/categories';
import { Product } from '../../data/products';
import { Banner } from '../../data/banners';
import { BannerSliderComponent } from '../../components/banner-slider/banner-slider.component';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';

@Component({
  selector: 'app-shop-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BannerSliderComponent,
    ProductCardComponent,
    CategoryCardComponent,
  ],
  template: `
    <div class="container mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <!-- Banner Slider -->
      <section class="mb-8">
        <app-banner-slider [banners]="banners" [autoPlay]="true" [interval]="5000"></app-banner-slider>
      </section>

      <!-- Categories -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Danh mục sản phẩm</h2>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          <app-category-card
            *ngFor="let category of categories"
            [category]="category"
          ></app-category-card>
        </div>
      </section>

      <!-- Top Selling Products -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Sản phẩm bán chạy</h2>
          <a
            routerLink="/shop/products"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            Xem tất cả
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <app-product-card
            *ngFor="let product of topProducts"
            [product]="product"
          ></app-product-card>
        </div>
      </section>

      <!-- Featured Banner -->
      <section class="mb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 p-8 text-white">
            <h3 class="text-2xl font-bold mb-2">iPhone 15 Series</h3>
            <p class="mb-4">Giảm ngay 2 triệu - Trả góp 0%</p>
            <a
              routerLink="/shop/products"
              [queryParams]="{ category: '1' }"
              class="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Mua ngay
            </a>
          </div>
          <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white">
            <h3 class="text-2xl font-bold mb-2">MacBook Air M3</h3>
            <p class="mb-4">Mỏng nhẹ - Hiệu năng vượt trội</p>
            <a
              routerLink="/shop/products"
              [queryParams]="{ category: '2' }"
              class="inline-block bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Khám phá
            </a>
          </div>
        </div>
      </section>

      <!-- New Products -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Sản phẩm mới</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <app-product-card
            *ngFor="let product of newProducts"
            [product]="product"
          ></app-product-card>
        </div>
      </section>
    </div>
  `,
})
export class ShopHomeComponent implements OnInit {
  categories: Category[] = [];
  topProducts: Product[] = [];
  newProducts: Product[] = [];
  banners: Banner[] = [];

  constructor(
    private shopService: ShopService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Shop - Trang chủ | Tech Store');
    this.metaService.updateTag({
      name: 'description',
      content: 'Cửa hàng công nghệ hàng đầu Việt Nam - Điện thoại, Laptop, Phụ kiện chính hãng',
    });

    this.loadData();
  }

  loadData(): void {
    this.shopService.getCategories().subscribe((data) => {
      this.categories = data;
    });

    this.shopService.getTopSelling(10).subscribe((data) => {
      this.topProducts = data;
    });

    this.shopService.getProducts().subscribe((data) => {
      this.newProducts = data.filter((p) => p.tags?.includes('new')).slice(0, 8);
    });

    this.shopService.getBanners().subscribe((data) => {
      this.banners = data;
    });
  }
}
