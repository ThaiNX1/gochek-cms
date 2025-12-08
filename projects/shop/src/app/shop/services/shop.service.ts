import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CATEGORIES, Category } from '../data/categories';
import { PRODUCTS, Product } from '../data/products';
import { STORE_INFO, StoreInfo } from '../data/store';
import { BANNERS, Banner } from '../data/banners';

export interface ProductFilter {
  categoryId?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  constructor() {}

  getCategories(): Observable<Category[]> {
    return of(CATEGORIES).pipe(delay(100));
  }

  getBanners(): Observable<Banner[]> {
    return of(BANNERS).pipe(delay(100));
  }

  getProducts(filter?: ProductFilter, sort: SortOption = 'default'): Observable<Product[]> {
    let products = [...PRODUCTS];

    // Apply filters
    if (filter) {
      if (filter.categoryId) {
        products = products.filter((p) => p.categoryId === filter.categoryId);
      }

      if (filter.brand && filter.brand.length > 0) {
        products = products.filter((p) => p.brand && filter.brand!.includes(p.brand));
      }

      if (filter.minPrice !== undefined) {
        products = products.filter((p) => {
          const price = p.salePrice || p.price;
          return price >= filter.minPrice!;
        });
      }

      if (filter.maxPrice !== undefined) {
        products = products.filter((p) => {
          const price = p.salePrice || p.price;
          return price <= filter.maxPrice!;
        });
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.brand?.toLowerCase().includes(searchLower) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchLower))
        );
      }
    }

    // Apply sorting
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        products.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'default':
      default:
        // Sort by sold (most popular first)
        products.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
    }

    return of(products).pipe(delay(200));
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    const product = PRODUCTS.find((p) => p.slug === slug);
    return of(product).pipe(delay(100));
  }

  getTopSelling(limit: number = 10): Observable<Product[]> {
    const topProducts = [...PRODUCTS]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, limit);
    return of(topProducts).pipe(delay(100));
  }

  getRelatedProducts(productId: string, limit: number = 8): Observable<Product[]> {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return of([]);

    const related = PRODUCTS.filter(
      (p) => p.id !== productId && p.categoryId === product.categoryId
    ).slice(0, limit);

    return of(related).pipe(delay(100));
  }

  getStoreInfo(): Observable<StoreInfo> {
    return of(STORE_INFO).pipe(delay(100));
  }

  getBrands(): Observable<string[]> {
    const brands = [...new Set(PRODUCTS.map((p) => p.brand).filter((b) => b))].sort() as string[];
    return of(brands).pipe(delay(50));
  }
}
