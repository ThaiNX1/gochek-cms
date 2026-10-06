import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { BaseClass } from '../../../../commons/base.class';
import { GET_NHANH_CREDENTIALS } from '../../../../commons/queries/partner-credential.query';
import { ApiService } from '../../../../core/shared-services.provider';
import { GET_NHANH_DASHBOARD } from '../../../../commons/queries/dashboard.query';

interface WarehouseStock {
  name: string;
  total: number;
  inbound: number;
  outbound: number;
}

interface TopProduct {
  rank: number;
  model: string;
  code: string;
  total: number;
  warehouses: number;
}

interface StockRisk {
  type: 'overstock' | 'lowstock' | 'expiring' | 'dead' | 'stockout';
  label: string;
  icon: string;
  count: number;
  unit: string;
  color: string;
  bgColor: string;
}

interface StockHealth {
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
}

interface OrderToday {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

interface POStatus {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatExpansionModule],
  templateUrl: './overview-dashboard.component.html',
})
export class OverviewDashboardComponent extends BaseClass implements OnInit {
  readonly Math = Math;
  updatedAt = new Date();

  constructor() {
    super();
  }

  // Form filter - BaseClass đã có filterForm, không cần khai báo lại
  nhanhCredentials: any[] = [];
  isLoading = false;
  
  // Check if desktop (md breakpoint = 768px)
  get isDesktop(): boolean {
    return window.innerWidth >= 768;
  }

  // ─── 1. Tổng tồn kho ───────────────────────────────────────────────────────
  totalStock = 0;
  totalInboundMonth = 0;
  totalOutboundMonth = 0;
  totalSkus = 0;

  // ─── 2. Tồn theo kho ───────────────────────────────────────────────────────
  warehouseStocks: WarehouseStock[] = [];

  // ─── 3. Top 10 sản phẩm tồn nhiều nhất ────────────────────────────────────
  topProducts: TopProduct[] = [];
  get maxTopProductTotal(): number {
    return this.topProducts[0]?.total ?? 1;
  }

  // ─── 4. Rủi ro tồn kho ─────────────────────────────────────────────────────
  stockRisks: StockRisk[] = [];
  totalRiskWarnings = 0; // Tổng số cảnh báo

  readonly stockRiskActions: { [key: string]: { action: string; actionColor: string } } = {
    'lowstock': { action: 'Bổ sung ngay', actionColor: 'text-orange-600' },
    'stockout': { action: 'Chuyển kho HN → HCM', actionColor: 'text-red-600' },
    'overstock': { action: 'Lên kế hoạch xả', actionColor: 'text-yellow-600' },
    'dead': { action: 'Kích hoạt Flashsale / Bundle', actionColor: 'text-purple-600' },
  };

  // ─── 5. Sức khỏe tồn kho & DoS ────────────────────────────────────────────

  // Filter by risk type
  stockHealthFilter: string | null = null; // null = hiển thị tất cả

  stockHealthSummary: any[] = [];

  dosTable: {
    model: string; warehouse: string; stock: number; stockColor: string;
    salesPerDay: number; dos: number; dosColor: string; dosBarColor: string;
    stockAge: number; status: string; statusColor: string; statusBg: string;
    action: string; actionColor: string;
    riskType: string; // Thêm để filter
  }[] = [];

  dosBarWidth(dos: number): number {
    return Math.min((dos / 130) * 100, 100);
  }

  // ─── 6. Tình trạng đơn hàng hôm nay ──────────────────────────────────────
  ordersToday: OrderToday[] = [];
  todayOrdersByChannel: Array<{
    channel: string;
    channelName: string;
    totalOrders: number;
  }> = [];
  ordersOverview: {
    lookbackDays: number;
    totalOrders: number;
    averageOrdersPerDay: number;
    byChannel: Array<{
      channel: string;
      channelName: string;
      totalOrders: number;
      averageOrdersPerDay: number;
    }>;
  } = {
    lookbackDays: 0,
    totalOrders: 0,
    averageOrdersPerDay: 0,
    byChannel: [],
  };

  // ─── 7. Tình trạng đơn đặt hàng (PO) ─────────────────────────────────────
  readonly poStatuses: POStatus[] = [
    { label: 'Đang sản xuất',        value: 3,  icon: 'precision_manufacturing', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', description: 'batch đang trong quy trình sản xuất' },
    { label: 'Đang vận chuyển',      value: 5,  icon: 'local_shipping',          color: 'text-blue-700',   bgColor: 'bg-blue-50 border-blue-200',     description: 'lô hàng đang trên đường' },
    { label: 'Đã nhận, chờ nhập kho', value: 2, icon: 'inventory',               color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', description: 'lô hàng chờ kiểm đếm nhập kho' },
    { label: 'Chờ xác nhận',         value: 4,  icon: 'pending_actions',         color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', description: 'PO chờ nhà cung cấp xác nhận' },
    { label: 'Hoàn thành tháng này', value: 8,  icon: 'task_alt',                color: 'text-green-700',  bgColor: 'bg-green-50 border-green-200',   description: 'PO đã nhập kho đầy đủ' },
    { label: 'Đã hủy tháng này',     value: 1,  icon: 'cancel',                  color: 'text-red-700',    bgColor: 'bg-red-50 border-red-200',       description: 'PO bị hủy trong tháng' },
  ];

  override ngOnInit(): void {
    super.ngOnInit();
    
    this.filterForm = new FormGroup({
      partnerCredentialId: new FormControl(''),
      lookbackDays: new FormControl(7),
      lowStockDays: new FormControl(7),
      overStockDays: new FormControl(90),
    });

    this.loadNhanhCredentials();
  }

  async loadNhanhCredentials() {
    // Disable global loading chỉ cho desktop
    if (this.isDesktop) {
      this.commonService.setRemoveShowGlobalLoading(true);
    }
    
    const response = await this.injector.get(ApiService).executeQuery<{ nhanhCredentials: any[] }>(
      GET_NHANH_CREDENTIALS
    );

    this.nhanhCredentials = response?.nhanhCredentials?.filter((c: any) => c.isActive) ?? [];
    
    if (this.nhanhCredentials.length > 0) {
      this.filterForm.patchValue({ partnerCredentialId: this.nhanhCredentials[0].id });
      await this.loadDashboard();
    }
    
    // Reset lại flag sau khi hoàn tất (chỉ khi đã set)
    if (this.isDesktop) {
      this.commonService.setRemoveShowGlobalLoading(false);
    }
  }

  async loadDashboard() {
    const credentialId = this.filterForm.value.partnerCredentialId;
    if (!credentialId) {
      this.commonService.openSnackBarError('Vui lòng chọn tài khoản Nhanh.vn');
      return;
    }

    this.isLoading = true;
    
    // Disable global loading chỉ cho desktop
    if (this.isDesktop) {
      this.commonService.setRemoveShowGlobalLoading(true);
    }
    
    const response = await this.injector.get(ApiService).executeQuery<{ nhanhDashboard: any }>(
      GET_NHANH_DASHBOARD,
      {
        input: {
          partnerCredentialId: credentialId,
          lookbackDays: this.filterForm.value.lookbackDays || 30,
          lowStockDays: this.filterForm.value.lowStockDays || 7,
          overStockDays: this.filterForm.value.overStockDays || 90,
        }
      }
    );

    this.isLoading = false;
    
    // Reset lại flag sau khi hoàn tất (chỉ khi đã set)
    if (this.isDesktop) {
      this.commonService.setRemoveShowGlobalLoading(false);
    }

    if (response?.nhanhDashboard) {
      this.mapDashboardData(response.nhanhDashboard);
    }
  }

  mapDashboardData(data: any) {
    // Update timestamp
    this.updatedAt = new Date(data.updatedAt);

    // 1. Tổng tồn kho
    this.totalStock = data.inventory?.totalRemain ?? 0;
    this.totalSkus = data.inventory?.totalProducts ?? 0;
    // Note: API không có inbound/outbound theo tháng, giữ nguyên hoặc tính từ orders
    this.totalInboundMonth = 0;
    this.totalOutboundMonth = 0;

    // 2. Tồn theo kho
    this.warehouseStocks = (data.inventoryByDepot ?? []).map((depot: any) => ({
      name: depot.depotName ?? depot.depotId,
      total: depot.totalRemain ?? 0,
      inbound: 0, // API không có data này
      outbound: 0, // API không có data này
    }));

    // 3. Top 10 sản phẩm
    this.topProducts = (data.topInventoryProducts ?? []).slice(0, 10).map((p: any, idx: number) => ({
      rank: idx + 1,
      model: p.name ?? '',
      code: p.code ?? '',
      total: p.remain ?? 0,
      warehouses: 1, // API không có số kho, mặc định 1
    }));

    // 4. Rủi ro tồn kho - Tổng hợp theo loại
    const risks = data.inventoryRisks ?? [];
    const risksByType: { [key: string]: any[] } = {
      'LOW_STOCK': [],
      'OUT_OF_STOCK': [],
      'OVERSTOCK': [],
      'SLOW_MOVING': [],
    };

    // Phân loại risks
    risks.forEach((r: any) => {
      if (risksByType[r.type]) {
        risksByType[r.type].push(r);
      }
    });

    // Tạo summary cho mỗi loại (hiển thị số lượng products, không phải tổng remain)
    this.stockRisks = [];
    
    if (risksByType['LOW_STOCK'].length > 0) {
      const totalRemain = risksByType['LOW_STOCK'].reduce((sum, r) => sum + (r.remain ?? 0), 0);
      this.stockRisks.push({
        type: 'lowstock',
        label: `${risksByType['LOW_STOCK'].length} SP sắp hết hàng`,
        icon: this.getRiskIcon('LOW_STOCK'),
        count: totalRemain,
        unit: 'sp tồn',
        color: this.getRiskColor('LOW_STOCK'),
        bgColor: this.getRiskBgColor('LOW_STOCK'),
      });
    }

    if (risksByType['OUT_OF_STOCK'].length > 0) {
      this.stockRisks.push({
        type: 'stockout',
        label: `${risksByType['OUT_OF_STOCK'].length} SP hết hàng`,
        icon: this.getRiskIcon('OUT_OF_STOCK'),
        count: 0,
        unit: '',
        color: this.getRiskColor('OUT_OF_STOCK'),
        bgColor: this.getRiskBgColor('OUT_OF_STOCK'),
      });
    }

    if (risksByType['OVERSTOCK'].length > 0) {
      const totalRemain = risksByType['OVERSTOCK'].reduce((sum, r) => sum + (r.remain ?? 0), 0);
      this.stockRisks.push({
        type: 'overstock',
        label: `${risksByType['OVERSTOCK'].length} SP tồn kho cao`,
        icon: this.getRiskIcon('OVERSTOCK'),
        count: totalRemain,
        unit: 'sp tồn',
        color: this.getRiskColor('OVERSTOCK'),
        bgColor: this.getRiskBgColor('OVERSTOCK'),
      });
    }

    if (risksByType['SLOW_MOVING'].length > 0) {
      const totalRemain = risksByType['SLOW_MOVING'].reduce((sum, r) => sum + (r.remain ?? 0), 0);
      this.stockRisks.push({
        type: 'dead',
        label: `${risksByType['SLOW_MOVING'].length} SP tồn lâu`,
        icon: this.getRiskIcon('SLOW_MOVING'),
        count: totalRemain,
        unit: 'sp',
        color: this.getRiskColor('SLOW_MOVING'),
        bgColor: this.getRiskBgColor('SLOW_MOVING'),
      });
    }

    this.totalRiskWarnings = this.stockRisks.length;

    // 5. Sức khỏe tồn kho & DoS
    this.mapStockHealthAndDos(risks);

    // 6. Tình trạng đơn hàng hôm nay
    this.mapTodayOrders(data.todayOrders);
    
    // Tổng quan đơn hàng (lookback period)
    if (data.orders) {
      this.ordersOverview = {
        lookbackDays: data.orders.lookbackDays ?? 0,
        totalOrders: data.orders.totalOrders ?? 0,
        averageOrdersPerDay: data.orders.averageOrdersPerDay ?? 0,
        byChannel: data.orders.byChannel ?? [],
      };
    }
  }

  mapStockHealthAndDos(risks: any[]) {
    // Đếm số lượng từng loại rủi ro
    const riskCounts = risks.reduce((acc: any, r: any) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    // Stock Health Summary
    this.stockHealthSummary = [
      { 
        key: 'LOW_STOCK',  
        label: 'Sắp hết hàng',         
        count: riskCounts['LOW_STOCK'] || 0,   
        color: 'text-orange-600', 
        bg: 'bg-orange-50 border-orange-200', 
        icon: 'shopping_cart' 
      },
      { 
        key: 'OUT_OF_STOCK',  
        label: 'Đã hết hàng',           
        count: riskCounts['OUT_OF_STOCK'] || 0,   
        color: 'text-red-600',    
        bg: 'bg-red-50 border-red-200',       
        icon: 'remove_shopping_cart' 
      },
      { 
        key: 'OVERSTOCK', 
        label: 'Tồn kho cao',           
        count: riskCounts['OVERSTOCK'] || 0,   
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50 border-yellow-200', 
        icon: 'inventory_2' 
      },
      { 
        key: 'SLOW_MOVING',      
        label: 'Tồn lâu (>90 ngày)',    
        count: riskCounts['SLOW_MOVING'] || 0,
        unit: 'sp',
        subLabel: `${riskCounts['SLOW_MOVING'] || 0} models chậm luân chuyển`,
        color: 'text-purple-600', 
        bg: 'bg-purple-50 border-purple-200', 
        icon: 'hourglass_empty' 
      },
    ];

    // Set first card as selected by default
    if (this.stockHealthSummary.length > 0) {
      this.stockHealthFilter = this.stockHealthSummary[0].key;
    }

    // DoS Table - map từ inventoryRisks
    this.dosTable = risks.map((r: any) => {
      const dos = r.daysOfCover ?? 0;
      const status = this.getDosStatus(r.type, dos);
      const action = this.getDosAction(r.type);
      
      return {
        model: r.name || r.code || 'N/A',
        warehouse: '', // API không có warehouse riêng cho từng risk
        stock: r.remain ?? 0,
        stockColor: this.getStockColor(r.type),
        salesPerDay: r.averageDailySales ?? 0,
        dos: dos,
        dosColor: this.getDosColor(r.type, dos),
        dosBarColor: this.getDosBarColor(r.type, dos),
        stockAge: dos, // Tạm dùng DoS làm stock age
        status: status.label,
        statusColor: status.color,
        statusBg: status.bg,
        action: action.label,
        actionColor: action.color,
        riskType: r.type, // Lưu type để filter
      };
    });
  }

  get filteredDosTable() {
    if (!this.stockHealthFilter) {
      return this.dosTable; // Hiển thị tất cả
    }
    return this.dosTable.filter(r => r.riskType === this.stockHealthFilter);
  }

  onFilterByRiskType(riskType: string) {
    // Toggle filter: click lại thì bỏ filter
    this.stockHealthFilter = this.stockHealthFilter === riskType ? null : riskType;
  }

  getDosStatus(type: string, dos: number): { label: string; color: string; bg: string } {
    switch (type) {
      case 'LOW_STOCK':
        return { 
          label: 'Sắp hết hàng', 
          color: 'text-orange-700', 
          bg: 'bg-orange-50 border-orange-200' 
        };
      case 'OUT_OF_STOCK':
        return { 
          label: 'Hết hàng (Stockout)', 
          color: 'text-red-700', 
          bg: 'bg-red-50 border-red-200' 
        };
      case 'OVERSTOCK':
        return { 
          label: 'Tồn cao', 
          color: 'text-yellow-700', 
          bg: 'bg-yellow-50 border-yellow-200' 
        };
      case 'SLOW_MOVING':
        return { 
          label: 'Tồn lâu (>90n)', 
          color: 'text-purple-700', 
          bg: 'bg-purple-50 border-purple-200' 
        };
      default:
        return { 
          label: 'Bình thường', 
          color: 'text-green-700', 
          bg: 'bg-green-50 border-green-200' 
        };
    }
  }

  getDosAction(type: string): { label: string; color: string } {
    switch (type) {
      case 'LOW_STOCK':
        return { label: 'Bổ sung ngay', color: 'text-orange-600' };
      case 'OUT_OF_STOCK':
        return { label: 'Chuyển kho/Đặt hàng', color: 'text-red-600' };
      case 'OVERSTOCK':
        return { label: 'Lên kế hoạch xả', color: 'text-yellow-600' };
      case 'SLOW_MOVING':
        return { label: 'Tặng kèm/Bundle', color: 'text-purple-600' };
      default:
        return { label: 'Chi tiết', color: 'text-gray-400' };
    }
  }

  getStockColor(type: string): string {
    return type === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-gray-800';
  }

  getDosColor(type: string, dos: number): string {
    if (type === 'OUT_OF_STOCK' || dos === 0) return 'text-red-500';
    if (type === 'LOW_STOCK' || dos < 14) return 'text-orange-500';
    if (type === 'OVERSTOCK' || dos > 60) return 'text-yellow-500';
    if (type === 'SLOW_MOVING') return 'text-purple-500';
    return 'text-green-500';
  }

  getDosBarColor(type: string, dos: number): string {
    if (type === 'OUT_OF_STOCK' || dos === 0) return 'bg-red-400';
    if (type === 'LOW_STOCK' || dos < 14) return 'bg-orange-400';
    if (type === 'OVERSTOCK' || dos > 60) return 'bg-yellow-400';
    if (type === 'SLOW_MOVING') return 'bg-purple-400';
    return 'bg-green-400';
  }

  mapRiskType(apiType: string): 'overstock' | 'lowstock' | 'stockout' | 'dead' {
    switch (apiType) {
      case 'LOW_STOCK': return 'lowstock';
      case 'OUT_OF_STOCK': return 'stockout';
      case 'OVERSTOCK': return 'overstock';
      case 'SLOW_MOVING': return 'dead';
      default: return 'lowstock';
    }
  }

  mapTodayOrders(todayOrders: any) {
    if (!todayOrders) {
      this.ordersToday = [];
      this.todayOrdersByChannel = [];
      return;
    }

    const byStatus = todayOrders.byStatus || [];
    
    // Map các trạng thái đơn hàng chi tiết từ Nhanh.vn
    // Dựa trên data từ API: status + statusName
    const statusMap: { [key: number]: { icon: string; color: string; bgColor: string } } = {
      57: { icon: 'verified', color: 'text-green-600', bgColor: 'bg-green-50' }, // Chờ khách xác nhận
      58: { icon: 'local_shipping', color: 'text-blue-600', bgColor: 'bg-blue-50' }, // Đang chuyển
      43: { icon: 'inventory', color: 'text-purple-600', bgColor: 'bg-purple-50' }, // Chờ thu gom
      63: { icon: 'shield', color: 'text-indigo-600', bgColor: 'bg-indigo-50' }, // Khách huy
      56: { icon: 'check_circle', color: 'text-teal-600', bgColor: 'bg-teal-50' }, // Đã xác nhận
      54: { icon: 'storefront', color: 'text-cyan-600', bgColor: 'bg-cyan-50' }, // Đơn mới
      60: { icon: 'task_alt', color: 'text-green-700', bgColor: 'bg-green-100' }, // Thành công
      64: { icon: 'block', color: 'text-orange-600', bgColor: 'bg-orange-50' }, // Hệ thống hủy
    };

    this.ordersToday = byStatus
      .filter((s: any) => s.count > 0) // Chỉ hiển thị status có đơn
      .map((s: any) => {
        const style = statusMap[s.status] || { 
          icon: 'receipt_long', 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50' 
        };
        
        return {
          label: s.statusName || `Trạng thái ${s.status}`,
          value: s.count || 0,
          icon: style.icon,
          color: style.color,
          bgColor: style.bgColor,
        };
      })
      .sort((a: any, b: any) => b.value - a.value); // Sort theo số lượng giảm dần

    // Map byChannel cho today orders
    const byChannel = todayOrders.byChannel || [];
    this.todayOrdersByChannel = byChannel
      .filter((ch: any) => ch.totalOrders > 0)
      .map((ch: any) => ({
        channel: ch.channel,
        channelName: ch.channelName || `Kênh ${ch.channel}`,
        totalOrders: ch.totalOrders || 0,
      }))
      .sort((a: any, b: any) => b.totalOrders - a.totalOrders);

    // Nếu không có data, hiển thị placeholder
    if (this.ordersToday.length === 0 && this.todayOrdersByChannel.length === 0) {
      this.ordersToday = [
        { label: 'Tổng đơn hôm nay', value: todayOrders.totalOrders || 0, icon: 'receipt_long', color: 'text-gray-600', bgColor: 'bg-gray-50' },
      ];
    }
  }

  getRiskIcon(type: string): string {
    switch (type) {
      case 'LOW_STOCK': return 'shopping_cart';
      case 'OUT_OF_STOCK': return 'remove_shopping_cart';
      case 'OVERSTOCK': return 'inventory_2';
      case 'SLOW_MOVING': return 'hourglass_empty';
      default: return 'warning';
    }
  }

  getRiskColor(type: string): string {
    switch (type) {
      case 'LOW_STOCK': return 'text-orange-700';
      case 'OUT_OF_STOCK': return 'text-red-700';
      case 'OVERSTOCK': return 'text-yellow-700';
      case 'SLOW_MOVING': return 'text-purple-700';
      default: return 'text-gray-700';
    }
  }

  getRiskBgColor(type: string): string {
    switch (type) {
      case 'LOW_STOCK': return 'bg-orange-50 border-orange-200';
      case 'OUT_OF_STOCK': return 'bg-red-50 border-red-200';
      case 'OVERSTOCK': return 'bg-yellow-50 border-yellow-200';
      case 'SLOW_MOVING': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }

  getChannelColor(channelName: string): string {
    if (!channelName) return 'text-gray-600';
    
    const name = channelName.toLowerCase();
    
    if (name.includes('tiktok')) return 'text-pink-600';
    if (name.includes('shopee')) return 'text-orange-600';
    if (name.includes('lazada')) return 'text-blue-600';
    if (name.includes('tiki')) return 'text-indigo-600';
    if (name.includes('sendo')) return 'text-red-600';
    if (name.includes('nhanh')) return 'text-purple-600';
    if (name.includes('admin')) return 'text-gray-600';
    
    return 'text-gray-600';
  }

  getChannelBgColor(channelName: string): string {
    if (!channelName) return 'bg-gray-50 border-gray-200';
    
    const name = channelName.toLowerCase();
    
    if (name.includes('tiktok')) return 'bg-pink-50 border-pink-200';
    if (name.includes('shopee')) return 'bg-orange-50 border-orange-200';
    if (name.includes('lazada')) return 'bg-blue-50 border-blue-200';
    if (name.includes('tiki')) return 'bg-indigo-50 border-indigo-200';
    if (name.includes('sendo')) return 'bg-red-50 border-red-200';
    if (name.includes('nhanh')) return 'bg-purple-50 border-purple-200';
    if (name.includes('admin')) return 'bg-gray-50 border-gray-200';
    
    return 'bg-gray-50 border-gray-200';
  }
}
