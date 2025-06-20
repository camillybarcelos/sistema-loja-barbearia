export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barber' | 'cashier';
  avatar?: string;
  createdAt: Date;
}

// Sistema de Usuários e Permissões
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  function: 'admin' | 'cashier' | 'barber' | 'manager' | 'salesperson';
  password: string;
  status: 'active' | 'inactive';
  permissions: UserPermissions;
  lastAccess?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // ID do usuário que criou
}

export interface UserPermissions {
  // Menus principais
  dashboard: boolean;
  pdv: boolean;
  cashRegister: boolean;
  customers: boolean;
  products: boolean;
  appointments: boolean;
  sales: boolean;
  reports: boolean;
  settings: boolean;
  userManagement: boolean; // Apenas para admins
  
  // Submenus específicos
  barbers: boolean;
  services: boolean;
  commissions: boolean;
  loyalty: boolean;
  backup: boolean;
  
  // Ações específicas
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewReports: boolean;
  canEditSettings: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  function: SystemUser['function'];
  password?: string; // Opcional, pode ser gerada automaticamente
  permissions: Partial<UserPermissions>;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  function?: SystemUser['function'];
  status?: 'active' | 'inactive';
  permissions?: Partial<UserPermissions>;
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
  specialties: string;
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
  cashAmount?: number;
  cardAmount?: number;
  pixAmount?: number;
  creditAmount?: number;
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

// Configurações de Impressora
export interface PrinterConfig {
  id: string;
  name: string;
  model: 'epson' | 'bematech' | 'elgin' | 'daruma' | 'sweda' | 'generic';
  port: string;
  baudRate?: number;
  isDefault: boolean;
  type: 'thermal' | 'laser' | 'inkjet' | 'roll' | 'a4';
  isNetwork: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Impressora detectada do sistema
export interface SystemPrinter {
  name: string;
  port: string;
  type: 'thermal' | 'laser' | 'inkjet' | 'roll' | 'a4';
  isNetwork: boolean;
  isDefault: boolean;
}

// Dados para cadastro manual de impressora
export interface ManualPrinterData {
  name: string;
  model: PrinterConfig['model'];
  port: string;
  baudRate?: number;
  type: PrinterConfig['type'];
  isNetwork: boolean;
}

// Configurações da Empresa para Impressão
export interface CompanyConfig {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de Emissão Fiscal
export type FiscalEmissionType = 'nfe' | 'fiscal_receipt' | 'non_fiscal_receipt' | 'none';

// Interface para dados de impressão
export interface PrintData {
  saleId: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethods: Array<{
    type: string;
    amount: number;
  }>;
  emissionType: FiscalEmissionType;
  printDate: Date;
}

// Configuração de Impressão de Cupom
export interface ReceiptConfig {
  id: string;
  name: string;
  
  // Configuração da Impressora
  printerId: string;
  printerType: 'thermal' | 'laser' | 'inkjet' | 'roll' | 'a4';
  
  // Configuração do Papel
  paperSize: '57mm' | '80mm' | 'a4' | 'custom';
  customWidth?: number; // em mm
  customHeight?: number; // em mm
  
  // Tipo de Cupom
  receiptType: 'fiscal' | 'non_fiscal' | 'simple';
  
  // Conteúdo do Cupom
  content: {
    showCompanyName: boolean;
    showCnpj: boolean;
    showAddress: boolean;
    showPhone: boolean;
    showCustomerName: boolean;
    showItemsList: boolean;
    showQuantity: boolean;
    showUnitPrice: boolean;
    showTotal: boolean;
    showPaymentMethod: boolean;
    showDateTime: boolean;
    showSaleNumber: boolean;
    showBarberName: boolean;
    showCustomMessage: boolean;
    customMessage: string;
  };
  
  // Formatação
  formatting: {
    fontSize: number;
    lineSpacing: number;
    margin: number;
    alignment: 'left' | 'center' | 'right';
    boldHeaders: boolean;
    showSeparators: boolean;
  };
  
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Dados para Impressão de Cupom
export interface ReceiptPrintData {
  saleId: string;
  saleNumber: string;
  customerName?: string;
  barberName?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    type: 'product' | 'service';
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethods: Array<{
    type: string;
    amount: number;
  }>;
  saleDate: Date;
  companyInfo: {
    name: string;
    cnpj: string;
    address: string;
    phone: string;
  };
  config: ReceiptConfig;
}

// Tipos para Comissões - Novas funcionalidades
export interface CommissionReport {
  id: string;
  barberId?: string; // undefined = todos os barbeiros
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  totalCommissions: number;
  paidAmount: number;
  pendingAmount: number;
  commissionCount: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface CommissionReceipt {
  id: string;
  barberId: string;
  barberName: string;
  period: string; // ex: "Semana de 10 a 16 de junho"
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paymentDate: Date;
  observations?: string;
  generatedAt: Date;
  generatedBy: string;
  status: 'generated' | 'paid';
  paidAt?: Date;
}

export interface CommissionPayment {
  id: string;
  barberId: string;
  barberName: string;
  period: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  paymentDate: Date;
  receiptId?: string;
  status: 'pending' | 'paid';
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CommissionExportFilters {
  startDate: Date;
  endDate: Date;
  barberId?: string;
  status?: 'all' | 'pending' | 'paid';
  format: 'pdf' | 'excel';
}

export interface CommissionReceiptData {
  barberName: string;
  totalAmount: number;
  period: string;
  paymentDate: Date;
  observations?: string;
  companyName?: string;
  companyLogo?: string;
}