# Google Maps Loader Service

Service này giúp load Google Maps API **một lần duy nhất** khi app khởi động và **tái sử dụng** ở các component khác.

## 🎯 Lợi ích

- ✅ Load API **chỉ 1 lần** khi app khởi động
- ✅ **Cache** kết quả và tái sử dụng cho tất cả component
- ✅ **Quản lý API key tập trung** từ environment
- ✅ **Tối ưu hiệu suất** - không load lại nhiều lần
- ✅ **Error handling** tốt hơn

## 📦 Cách sử dụng

### 1. Service đã được preload trong `app.component.ts`

```typescript
// app.component.ts
export class AppComponent implements OnInit {
  googleMapsLoader = inject(GoogleMapsLoaderService);

  ngOnInit(): void {
    // Preload Google Maps API khi app khởi động
    this.googleMapsLoader.loadApi().subscribe();
  }
}
```

### 2. Sử dụng trong Component

```typescript
import { Component } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [GoogleMap, MapMarker],
  template: `
    @if (apiLoaded | async) {
      <google-map [options]="mapOptions">
        <map-marker [position]="markerPosition"></map-marker>
      </google-map>
    } @else {
      <div>Đang tải bản đồ...</div>
    }
  `
})
export class YourComponent {
  apiLoaded: Observable<boolean>;
  
  mapOptions: google.maps.MapOptions = {
    center: { lat: 21.028511, lng: 105.804817 },
    zoom: 15
  };
  
  markerPosition = { lat: 21.028511, lng: 105.804817 };

  constructor(private googleMapsLoader: GoogleMapsLoaderService) {
    // API đã được preload, chỉ cần lấy Observable đã cache
    this.apiLoaded = this.googleMapsLoader.loadApi();
  }
}
```

## 🔧 API Methods

### `loadApi(): Observable<boolean>`

Load Google Maps API và trả về Observable<boolean>
- Lần đầu tiên: Load API từ Google
- Các lần sau: Trả về kết quả đã cache (không load lại)

```typescript
this.googleMapsLoader.loadApi().subscribe(loaded => {
  if (loaded) {
    console.log('API đã sẵn sàng');
  }
});
```

### `isLoaded(): boolean`

Kiểm tra xem Google Maps API đã được load chưa (synchronous)

```typescript
if (this.googleMapsLoader.isLoaded()) {
  // API đã sẵn sàng, có thể sử dụng ngay
}
```

## 🔑 Cấu hình API Key

API key được lấy từ environment:

```typescript
// src/environments/environment.ts
export const environment = {
  keymap: 'YOUR_GOOGLE_MAPS_API_KEY'
};
```

## 📝 Lưu ý

- Service này sử dụng `providedIn: 'root'` => **Singleton** trong toàn app
- Sử dụng `shareReplay(1)` để **cache** kết quả cho tất cả subscribers
- Nên gọi `loadApi()` trong `app.component.ts` để **preload** sớm nhất
- Các component khác chỉ cần inject service và gọi `loadApi()` là nhận được kết quả đã cache

## 🚀 Performance

**Trước khi có service:**
- Mỗi component load API riêng → Nhiều request → Chậm

**Sau khi có service:**
- App load API 1 lần khi khởi động → Cache lại
- Các component sử dụng API đã cache → Nhanh, không delay

