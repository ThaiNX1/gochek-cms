export interface StoreInfo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  bannerImage: string;
  logoImage: string;
  policies: { title: string; content: string }[];
}

export const STORE_INFO: StoreInfo = {
  name: 'Tech Store Vietnam',
  description:
    'Cửa hàng công nghệ hàng đầu Việt Nam, chuyên cung cấp các sản phẩm điện tử, điện thoại, laptop, phụ kiện chính hãng với giá tốt nhất. Cam kết 100% hàng chính hãng, bảo hành đầy đủ.',
  address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  phone: '1900 1234',
  email: 'support@techstore.vn',
  openingHours: 'Thứ 2 - Chủ Nhật: 8:00 - 22:00',
  bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  logoImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
  policies: [
    {
      title: 'Chính sách bảo hành',
      content:
        'Tất cả sản phẩm đều được bảo hành chính hãng từ 12-24 tháng tùy theo từng sản phẩm. Hỗ trợ đổi trả trong 7 ngày đầu nếu có lỗi từ nhà sản xuất.',
    },
    {
      title: 'Chính sách vận chuyển',
      content:
        'Miễn phí vận chuyển cho đơn hàng từ 500.000đ trong nội thành. Giao hàng toàn quốc trong 2-5 ngày làm việc. Hỗ trợ kiểm tra hàng trước khi thanh toán.',
    },
    {
      title: 'Chính sách thanh toán',
      content:
        'Chấp nhận thanh toán qua tiền mặt, chuyển khoản, thẻ tín dụng, ví điện tử (Momo, ZaloPay, VNPay). Hỗ trợ trả góp 0% lãi suất cho đơn hàng từ 3 triệu đồng.',
    },
    {
      title: 'Chính sách đổi trả',
      content:
        'Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi, không đúng mô tả. Sản phẩm phải còn nguyên seal, đầy đủ phụ kiện và hóa đơn mua hàng.',
    },
  ],
};
