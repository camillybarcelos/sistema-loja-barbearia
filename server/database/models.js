import mongoose from 'mongoose';

// Função para criar modelo apenas se não existir
const createModel = (modelName, schema) => {
  return mongoose.models[modelName] || mongoose.model(modelName, schema);
};

// Schema de Usuários
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'active' }
}, { timestamps: true });

// Schema de Produtos
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  brand: String,
  size: String,
  color: String,
  description: String,
  image: String
}, { timestamps: true });

// Schema de Serviços
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  commission: { type: Number, required: true },
  category: { type: String, required: true },
  description: String
}, { timestamps: true });

// Schema de Barbeiros
const barberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  commissionRate: { type: Number, required: true },
  specialties: String,
  avatar: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Schema de Clientes
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  cpf: String,
  address: String,
  birthDate: Date,
  totalPurchases: { type: Number, default: 0 },
  lastVisit: Date,
  hasCreditAccount: { type: Boolean, default: false }
}, { timestamps: true });

// Schema de Vendas
const saleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  cashAmount: Number,
  cardAmount: Number,
  pixAmount: Number,
  creditAmount: Number,
  status: { type: String, default: 'pending' },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber' },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String,
  completedAt: Date
}, { timestamps: true });

// Schema de Itens de Venda
const saleItemSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  type: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber' }
}, { timestamps: true });

// Schema de Agendamentos
const appointmentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, default: 'scheduled' },
  notes: String
}, { timestamps: true });

// Schema de Comissões
const commissionSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  period: { type: String, required: true },
  paidAt: Date
}, { timestamps: true });

// Schema de Pagamentos de Comissões
const commissionPaymentSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  barberName: { type: String, required: true },
  period: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  receiptId: String,
  status: { type: String, default: 'pending' },
  observations: String
}, { timestamps: true });

// Criar e exportar os modelos
export const User = createModel('User', userSchema);
export const Product = createModel('Product', productSchema);
export const Service = createModel('Service', serviceSchema);
export const Barber = createModel('Barber', barberSchema);
export const Customer = createModel('Customer', customerSchema);
export const Sale = createModel('Sale', saleSchema);
export const SaleItem = createModel('SaleItem', saleItemSchema);
export const Appointment = createModel('Appointment', appointmentSchema);
export const Commission = createModel('Commission', commissionSchema);
export const CommissionPayment = createModel('CommissionPayment', commissionPaymentSchema); 