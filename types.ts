
export enum UserRole {
  ADMIN = 'Admin',
  SELLER = 'Seller',
  FLORIST = 'Florist',
  SHIPPER = 'Shipper',
  ACCOUNTANT = 'Accountant'
}

export enum OrderType {
  RETAIL = 'Retail',
  PRE_ORDER = 'PreOrder',
  EVENT = 'Event',
  CORPORATE = 'Corporate'
}

export enum OrderStatus {
  PRE_ORDER = 'PreOrder',
  NEW = 'New',
  ASSIGNED = 'Assigned',
  PROCESSING = 'Processing',
  READY = 'Ready',
  DELIVERING = 'Delivering',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled'
}

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMain?: boolean;
}

// --- E-INVOICE 2026 TYPES ---
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'ISSUED' | 'ADJUSTED' | 'REPLACED' | 'CANCELLED' | 'REJECTED';
export type BuyerType = 'BUSINESS' | 'INDIVIDUAL' | 'HOUSEHOLD' | 'BUDGET_UNIT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'ORDER' | 'INVOICE' | 'PAYMENT' | 'CUSTOMER';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface EInvoice {
  id: string;
  invoiceNumber?: string;
  invoiceSymbol?: string;
  taxCode: string;
  orderId: string;
  customerId: string;
  branchId: string;
  
  buyerType: BuyerType;
  customerTaxName: string;
  customerTaxId?: string;
  customerPersonalId?: string;
  customerBudgetCode?: string;
  customerTaxAddress: string;
  customerEmail?: string;
  
  issueDate: string;
  totalBeforeTax: number;
  taxRate: number;
  taxAmount: number;
  totalAfterTax: number;
  status: InvoiceStatus;
  
  xmlUrl?: string;
  pdfUrl?: string;
  qrCodeData?: string;
  isVatReduced?: boolean;
  note?: string;
  relatedInvoiceId?: string;
  history?: any[];
}

export interface TaxRule {
  taxCode: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isEligibleForReduction: boolean;
  description: string;
}

// --- EVENT & CONTRACT ---
export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
  invoiceId?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  customerId: string;
  customerName: string;
  totalValue: number;
  depositAmount: number;
  signedDate: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  milestones: PaymentMilestone[];
  branchId: string;
}

// --- CRM & CUSTOMERS ---
export type CustomerTier = 'REGULAR' | 'SILVER' | 'GOLD' | 'VIP' | 'CORPORATE';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: CustomerTier;
  companyName?: string;
  taxId?: string;
  taxAddress?: string;
  personalId?: string;
  totalSpent: number;
  lastOrderDate: string;
  branchId?: string;
  preferences?: {
    style: string;
    likedColors: string[];
    allergies?: string;
  };
  importantDates?: {
    name: string;
    date: string;
    type: 'BIRTHDAY' | 'ANNIVERSARY';
  }[];
}

// --- ORDERS ---
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  taxRateDefault?: number;
}

export interface Order {
  id: string;
  type: OrderType;
  branchId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryTime: string; 
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  totalAmount: number; 
  subTotal?: number; 
  discount?: number; 
  depositAmount?: number; 
  note?: string;
  specialNote?: string; // New field for critical requirements
  assignedFloristId?: string;
  assignedShipperId?: string;
  createdAt: string;
  occasion?: string;
  referenceImageUrl?: string;
  referenceImageNote?: string;
  completedImageUrl?: string;
  invoiceId?: string;
  contractId?: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'FLOWER' | 'ACCESSORY';
  price: number;
  stock: number;
  unit: string;
  imageUrl: string;
  isVatReductionEligible?: boolean;
  recipe?: RecipeItem[];
}

export interface Florist {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  joinDate: string;
  branchId: string;
}

export interface RecipeItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
}

export interface MonthlyTarget {
  month: string;
  targetAmount: number;
}

export interface OrderReminder {
  id: string;
  orderId: string;
  customerName: string;
  remindAt: string;
  note: string;
  isRead: boolean;
}

export interface FlowerSample {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isBestSeller?: boolean;
  occasion?: string;
  ingredients?: string[]; // Danh sách các loại hoa chính cấu thành mẫu này
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  type: 'FLOWER' | 'ACCESSORY';
  unit: string;
  currentStock: number;
  buyQuantity: number;
  estimatedCost: number;
}

export interface Shipper {
  id: string;
  name: string;
  phone: string;
}
