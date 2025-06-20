export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barber' | 'cashier';
  avatar?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: 'clothing' | 'accessory';
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  brand: string;
  size?: string;
  color?: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  commission: number; // percentage
  category: 'haircut' | 'beard' | 'combo' | 'other';
  description?: string;
  createdAt: Date;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  commissionRate: number; // percentage
  specialties: string[];
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  address?: string;
  birthDate?: Date;
  totalPurchases: number;
  lastVisit?: Date;
  createdAt: Date;
  hasCreditAccount?: boolean;
}

export interface SaleItem {
  id: string;
  type: 'product' | 'service';
  productId?: string;
  serviceId?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  barberId?: string; // for services
}

export interface Sale {
  id: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'mixed' | 'credit';
  status: 'pending' | 'completed' | 'cancelled';
  barberId?: string;
  cashierId: string;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Commission {
  id: string;
  barberId: string;
  saleId: string;
  serviceId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid';
  period: string; // YYYY-MM format
  createdAt: Date;
  paidAt?: Date;
}

export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceIds: string[];
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface DashboardStats {
  todaySales: number;
  todayServices: number;
  monthRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  activeBarbers: number;
  pendingCommissions: number;
  totalCustomers: number;
}

export interface CreditAccount {
  id: string;
  customerId: string;
  customerName: string;
  totalDebt: number;
  limit: number;
  status: 'active' | 'blocked' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  creditAccountId: string;
  customerId: string;
  type: 'purchase' | 'payment' | 'adjustment';
  amount: number;
  description: string;
  saleId?: string;
  dueDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  paidAt?: Date;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerReal: number;
  pointsToDiscount: number;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  totalPoints: number;
  usedPoints: number;
  availablePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierMultiplier: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  saleId?: string;
  expiresAt?: Date;
  createdAt: Date;
}