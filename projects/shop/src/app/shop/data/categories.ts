export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Điện thoại', slug: 'dien-thoai', icon: '📱' },
  { id: '2', name: 'Laptop', slug: 'laptop', icon: '💻' },
  { id: '3', name: 'Tablet', slug: 'tablet', icon: '📱' },
  { id: '4', name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', icon: '⌚' },
  { id: '5', name: 'Tai nghe', slug: 'tai-nghe', icon: '🎧' },
  { id: '6', name: 'Phụ kiện', slug: 'phu-kien', icon: '🔌' },
  { id: '7', name: 'PC & Màn hình', slug: 'pc-man-hinh', icon: '🖥️' },
  { id: '8', name: 'Camera', slug: 'camera', icon: '📷' },
  { id: '9', name: 'Loa', slug: 'loa', icon: '🔊' },
  { id: '10', name: 'Tivi', slug: 'tivi', icon: '📺' },
  { id: '11', name: 'Gia dụng', slug: 'gia-dung', icon: '🏠' },
  { id: '12', name: 'Gaming', slug: 'gaming', icon: '🎮' },
];
