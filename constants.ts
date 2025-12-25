
import { Order, OrderStatus, OrderType, Product, UserRole, Customer, Florist, Branch, TaxRule, Contract, FlowerSample, Shipper } from './types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PRE_ORDER]: 'Đặt trước',
  [OrderStatus.NEW]: 'Mới tạo',
  [OrderStatus.ASSIGNED]: 'Đã phân thợ',
  [OrderStatus.PROCESSING]: 'Đang cắm',
  [OrderStatus.READY]: 'Đã xong (Chờ giao)',
  [OrderStatus.DELIVERING]: 'Đang giao',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELED]: 'Đã hủy',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị hệ thống',
  [UserRole.SELLER]: 'Kinh doanh (VIP Sales)',
  [UserRole.FLORIST]: 'Nghệ nhân thợ hoa',
  [UserRole.SHIPPER]: 'Giao hàng chuyên nghiệp',
  [UserRole.ACCOUNTANT]: 'Kế toán tài chính & Thuế'
};

export const BRANCHES: Branch[] = [
  { id: 'BR001', name: 'BloomFlow Quận 1 (Trụ sở)', address: '15 Lê Thánh Tôn, Quận 1, TP.HCM', phone: '028.38001111', isMain: true },
  { id: 'BR002', name: 'BloomFlow Thảo Điền', address: '88 Xuân Thủy, Quận 2, TP.HCM', phone: '028.38002222' },
  { id: 'BR003', name: 'BloomFlow Hà Nội', address: '12 Ngô Quyền, Hoàn Kiếm, HN', phone: '024.39003333' }
];

export const TAX_RULES: TaxRule[] = [
  { taxCode: 'VAT_0', rate: 0, effectiveFrom: '2000-01-01', isEligibleForReduction: false, description: 'Hàng hóa không chịu thuế' },
  { taxCode: 'VAT_5', rate: 0.05, effectiveFrom: '2000-01-01', isEligibleForReduction: false, description: 'Thuế suất ưu đãi 5%' },
  { taxCode: 'VAT_8', rate: 0.08, effectiveFrom: '2025-07-01', effectiveTo: '2026-12-31', isEligibleForReduction: true, description: 'Thuế suất giảm theo Nghị quyết 2026' },
  { taxCode: 'VAT_10', rate: 0.1, effectiveFrom: '2000-01-01', isEligibleForReduction: false, description: 'Thuế suất phổ thông 10%' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Hoa Hồng Đỏ Ecuador', type: 'FLOWER', price: 50000, stock: 150, unit: 'cành', imageUrl: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=100&q=80', isVatReductionEligible: true, recipe: [] },
  { id: 'p2', name: 'Hoa Ly Trắng Ù', type: 'FLOWER', price: 70000, stock: 5, unit: 'cành', imageUrl: 'https://images.unsplash.com/photo-1591196726298-54877395066a?auto=format&fit=crop&w=100&q=80', isVatReductionEligible: true, recipe: [] },
  { id: 'p3', name: 'Hoa Hướng Dương', type: 'FLOWER', price: 30000, stock: 2, unit: 'cành', imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=100&q=80', isVatReductionEligible: true, recipe: [] },
  { id: 'p4', name: 'Lá Nguyệt Quế', type: 'FLOWER', price: 5000, stock: 200, unit: 'nhánh', imageUrl: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=100&q=80', recipe: [] },
  { id: 'a3', name: 'Lẵng Gỗ Sang Trọng', type: 'ACCESSORY', price: 150000, stock: 3, unit: 'chiếc', imageUrl: 'https://images.unsplash.com/photo-1509503908666-8806c9a9307c?auto=format&fit=crop&w=100&q=80', isVatReductionEligible: false, recipe: [] },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'Anh Minh', phone: '0901234567', address: '123 Lê Lợi, Q.1, TP.HCM', type: 'VIP', totalSpent: 25000000, lastOrderDate: '2024-05-15', branchId: 'BR001' },
  { id: 'C2', name: 'Chị Lan', phone: '0987654321', address: '456 Nguyễn Huệ, Q.1, TP.HCM', type: 'GOLD', totalSpent: 12000000, lastOrderDate: '2024-05-20', branchId: 'BR001' },
  { id: 'C3', name: 'Cty Thiên Hòa', phone: '0283999888', address: '789 Võ Văn Kiệt, Q.5, TP.HCM', type: 'CORPORATE', totalSpent: 45000000, lastOrderDate: '2024-05-22', companyName: 'Công ty TNHH Thiên Hòa', taxId: '0311223344', branchId: 'BR002' },
];

export const MOCK_FLORISTS: Florist[] = [
  { id: 'florist1', name: 'Nguyễn Thị Cúc', phone: '0911222333', avatar: 'https://i.pravatar.cc/150?u=florist1', joinDate: '2023-01-15', branchId: 'BR001' },
  { id: 'florist2', name: 'Trần Thị Mai', phone: '0944555666', avatar: 'https://i.pravatar.cc/150?u=florist2', joinDate: '2023-05-20', branchId: 'BR001' },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'DH-101', type: OrderType.RETAIL, branchId: 'BR001', customerName: 'Anh Minh', customerPhone: '0901234567', deliveryAddress: '123 Lê Lợi, Q.1', deliveryTime: '2026-01-05T09:00:00Z', status: OrderStatus.COMPLETED, paymentStatus: 'PAID', totalAmount: 450000, items: [{ productId: 'p1', productName: 'Bó Hướng Dương', quantity: 1, price: 450000 }], createdAt: '2026-01-05T08:00:00Z', occasion: 'Sinh nhật' },
  { id: 'DH-102', type: OrderType.RETAIL, branchId: 'BR001', customerName: 'Chị Lan', customerPhone: '0987654321', deliveryAddress: '456 Nguyễn Huệ, Q.1', deliveryTime: '2026-01-05T15:30:00Z', status: OrderStatus.COMPLETED, paymentStatus: 'PAID', totalAmount: 1200000, items: [{ productId: 'p2', productName: 'Kệ hoa khai trương', quantity: 1, price: 1200000 }], createdAt: '2026-01-05T10:00:00Z', occasion: 'Khai trương' },
];

export const MOCK_SAMPLES: FlowerSample[] = [
  { id: 'S1', name: 'Bó Hồng Ecuador Mix', price: 1200000, description: 'Sự kết hợp sang trọng giữa hồng đỏ và baby trắng', imageUrl: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=400&q=80', isBestSeller: true, occasion: 'Sinh nhật', ingredients: ['Hoa Hồng Đỏ Ecuador', 'Lá Nguyệt Quế'] },
  { id: 'S2', name: 'Kệ Hoa Khai Trương Thịnh Vượng', price: 2500000, description: 'Hoa lan hồ điệp và hoa ly sang trọng', imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80', isBestSeller: true, occasion: 'Khai trương', ingredients: ['Hoa Ly Trắng Ù', 'Lá Nguyệt Quế'] },
  { id: 'S3', name: 'Bó Hoa Hướng Dương Rạng Rỡ', price: 650000, description: '3 bông hướng dương mix cùng lá bạc', imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80', isBestSeller: false, occasion: 'Sinh nhật', ingredients: ['Hoa Hướng Dương', 'Lá Nguyệt Quế'] },
  { id: 'S4', name: 'Hộp Hoa Hồng Luxury', price: 1800000, description: 'Hộp gỗ sang trọng với 20 bông hồng Ecuador', imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80', isBestSeller: false, occasion: 'Tình yêu', ingredients: ['Hoa Hồng Đỏ Ecuador', 'Lẵng Gỗ Sang Trọng'] },
];

// Fix: Add missing MOCK_SHIPPERS export
export const MOCK_SHIPPERS: Shipper[] = [
  { id: 'shipper1', name: 'Nguyễn Văn Giao', phone: '0901112223' },
  { id: 'shipper2', name: 'Trần Văn Nhận', phone: '0902223334' },
];

// Fix: Add missing MOCK_CONTRACTS export
export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'CT-001',
    contractNumber: 'HD-2026-001',
    title: 'Trang trí tiệc cưới Diamond',
    customerId: 'C1',
    customerName: 'Anh Minh',
    totalValue: 150000000,
    depositAmount: 45000000,
    signedDate: '2026-01-01',
    startDate: '2026-02-14',
    endDate: '2026-02-15',
    status: 'ACTIVE',
    branchId: 'BR001',
    milestones: [
      { id: 'm1', name: 'Đặt cọc giữ chỗ', percentage: 30, amount: 45000000, dueDate: '2026-01-05', status: 'PAID' },
      { id: 'm2', name: 'Quyết toán hoàn tất', percentage: 70, amount: 105000000, dueDate: '2026-02-16', status: 'PENDING' }
    ]
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Điều hành tổng thể', roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] },
  { id: 'orders', label: 'Bán lẻ & VIP Orders', roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.ACCOUNTANT] },
  { id: 'kanban-ai', label: 'AI Florist Assistant', roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.FLORIST] },
  { id: 'contracts', label: 'Hợp đồng & Event', roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.ACCOUNTANT] },
  { id: 'customers', label: 'Hệ quản trị CRM VIP', roles: [UserRole.ADMIN, UserRole.SELLER] },
  { id: 'accounting', label: 'Tài chính & Thuế 2026', roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] },
  { id: 'kanban', label: 'Xưởng thiết kế', roles: [UserRole.FLORIST, UserRole.ADMIN] },
  { id: 'inventory', label: 'Kho hàng', roles: [UserRole.ADMIN, UserRole.FLORIST] },
  { id: 'purchasing', label: 'Kế hoạch nhập hàng', roles: [UserRole.ADMIN, UserRole.FLORIST] },
  { id: 'employees', label: 'Nhân sự & Hiệu suất', roles: [UserRole.ADMIN] },
];
