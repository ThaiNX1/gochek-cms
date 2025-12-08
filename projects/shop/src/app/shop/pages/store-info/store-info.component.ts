import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ShopService } from '../../services/shop.service';
import { StoreInfo } from '../../data/store';

@Component({
  selector: 'app-store-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <!-- Breadcrumb -->
      <nav class="flex mb-6 text-sm">
        <a routerLink="/shop" class="text-gray-500 hover:text-gray-700">Trang chủ</a>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-900 font-medium">Thông tin cửa hàng</span>
      </nav>

      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!loading && storeInfo">
        <!-- Banner -->
        <div class="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
          <img
            [src]="storeInfo.bannerImage"
            alt="Store Banner"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ storeInfo.name }}</h1>
            <p class="text-lg opacity-90">{{ storeInfo.description }}</p>
          </div>
        </div>

        <!-- Store Info Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <!-- Contact Info -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                  <p class="text-gray-600">{{ storeInfo.address }}</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                  <p class="text-gray-600">{{ storeInfo.phone }}</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Email</h3>
                  <p class="text-gray-600">{{ storeInfo.email }}</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Giờ mở cửa</h3>
                  <p class="text-gray-600">{{ storeInfo.openingHours }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Liên kết nhanh</h2>
            <div class="space-y-3">
              <a
                routerLink="/shop"
                class="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
              >
                Trang chủ
              </a>
              <a
                routerLink="/shop/products"
                class="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
              >
                Sản phẩm
              </a>
              <a
                href="#policies"
                class="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
              >
                Chính sách
              </a>
            </div>
          </div>
        </div>

        <!-- Map Placeholder -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Bản đồ</h2>
          <div class="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
            <div class="text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p class="font-medium">Bản đồ sẽ được hiển thị tại đây</p>
              <p class="text-sm mt-2">{{ storeInfo.address }}</p>
            </div>
          </div>
        </div>

        <!-- Policies -->
        <div id="policies" class="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Chính sách & Điều khoản</h2>
          <div class="space-y-6">
            <div *ngFor="let policy of storeInfo.policies" class="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ policy.title }}</h3>
              <p class="text-gray-600 leading-relaxed">{{ policy.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StoreInfoComponent implements OnInit {
  storeInfo?: StoreInfo;
  loading = true;

  constructor(
    private shopService: ShopService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Thông tin cửa hàng | Tech Store');
    this.metaService.updateTag({
      name: 'description',
      content: 'Thông tin liên hệ và chính sách của Tech Store Vietnam',
    });

    this.loadStoreInfo();
  }

  loadStoreInfo(): void {
    this.shopService.getStoreInfo().subscribe((data) => {
      this.storeInfo = data;
      this.loading = false;
    });
  }
}
