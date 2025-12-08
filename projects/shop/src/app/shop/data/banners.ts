export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
}

export const BANNERS: Banner[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    subtitle: 'Giảm ngay 2 triệu - Trả góp 0%',
    image: 'https://images.unsplash.com/photo-1696446702183-cbd80474cd2c?w=1600&h=600&fit=crop',
    link: '/shop/products/iphone-15-pro-max-256gb',
  },
  {
    id: '2',
    title: 'MacBook Air M3',
    subtitle: 'Mỏng nhẹ - Hiệu năng vượt trội',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&h=600&fit=crop',
    link: '/shop/products/macbook-air-m3-13-inch-8gb-256gb',
  },
  {
    id: '3',
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: 'Ưu đãi đặc biệt - Quà tặng hấp dẫn',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1600&h=600&fit=crop',
    link: '/shop/products/samsung-galaxy-s24-ultra-12gb-256gb',
  },
  {
    id: '4',
    title: 'Apple Watch Series 9',
    subtitle: 'Theo dõi sức khỏe toàn diện',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1600&h=600&fit=crop',
    link: '/shop/products/apple-watch-series-9-gps-41mm',
  },
];
