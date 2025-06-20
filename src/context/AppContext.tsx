import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Service, Barber, Customer, Sale, Commission, Appointment, CreditAccount, CreditTransaction, PrinterConfig, CompanyConfig, FiscalEmissionType, PrintData } from '../types';

interface AppContextType {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Services
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  // Barbers
  barbers: Barber[];
  addBarber: (barber: Omit<Barber, 'id' | 'createdAt'>) => void;
  updateBarber: (id: string, barber: Partial<Barber>) => void;
  deleteBarber: (id: string) => void;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => string;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  // Credit System
  creditAccounts: CreditAccount[];
  creditTransactions: CreditTransaction[];
  addCreditAccount: (account: Omit<CreditAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditAccount: (id: string, account: Partial<CreditAccount>) => void;
  addCreditTransaction: (transaction: Omit<CreditTransaction, 'id' | 'createdAt'>) => void;
  updateCreditTransaction: (id: string, transaction: Partial<CreditTransaction>) => void;
  getCustomerCreditAccount: (customerId: string) => CreditAccount | undefined;
  getCustomerTransactions: (customerId: string) => CreditTransaction[];
  getCustomerTotalPurchases: (customerId: string) => number;
  getCustomerTotalCredit: (customerId: string) => number;
  getCustomerSales: (customerId: string) => Sale[];
  
  // Sales
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  
  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Mobile
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Printer Configuration
  printerConfigs: PrinterConfig[];
  companyConfig: CompanyConfig | null;
  addPrinterConfig: (config: Omit<PrinterConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrinterConfig: (id: string, config: Partial<PrinterConfig>) => void;
  deletePrinterConfig: (id: string) => void;
  setDefaultPrinter: (id: string) => void;
  getDefaultPrinter: () => PrinterConfig | null;
  updateCompanyConfig: (config: Partial<CompanyConfig>) => void;
  printReceipt: (printData: PrintData) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

// Mock data simplificado
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camiseta Polo Masculina',
    barcode: '7891234567890',
    category: 'clothing',
    price: 89.99,
    cost: 45.00,
    stock: 25,
    minStock: 5,
    brand: 'Fashion Brand',
    size: 'M',
    color: 'Azul Marinho',
    description: 'Camiseta polo 100% algodão',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    price: 25.00,
    duration: 30,
    category: 'haircut',
    description: 'Corte de cabelo masculino tradicional',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Barba',
    price: 15.00,
    duration: 20,
    category: 'beard',
    description: 'Fazer a barba',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Corte + Barba',
    price: 35.00,
    duration: 45,
    category: 'combo',
    description: 'Corte de cabelo + fazer a barba',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Hidratação',
    price: 20.00,
    duration: 25,
    category: 'other',
    description: 'Hidratação capilar',
    createdAt: new Date(),
  }
];

const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@barbearia.com',
    phone: '(11) 99999-9999',
    commissionRate: 40,
    specialties: 'Corte Masculino, Barba',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Miguel Costa',
    email: 'miguel@barbearia.com',
    phone: '(11) 88888-8888',
    commissionRate: 35,
    specialties: 'Corte Masculino, Hidratação',
    isActive: true,
    createdAt: new Date(),
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Carlos Santos',
    email: 'carlos@email.com',
    phone: '(11) 88888-8888',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123',
    birthDate: new Date('1990-05-15'),
    totalPurchases: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(11) 77777-7777',
    cpf: '987.654.321-00',
    address: 'Av. Principal, 456',
    birthDate: new Date('1985-08-20'),
    totalPurchases: 0,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Lucas Mendes',
    email: 'lucas@email.com',
    phone: '(11) 66666-6666',
    cpf: '456.789.123-00',
    address: 'Rua do Comércio, 789',
    birthDate: new Date('1992-12-10'),
    totalPurchases: 0,
    createdAt: new Date(),
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    customerId: '1',
    barberId: '1',
    serviceIds: ['1', '2'],
    date: new Date(),
    startTime: '14:00',
    endTime: '15:00',
    status: 'scheduled',
    notes: 'Agendamento de teste',
    createdAt: new Date(),
  },
  {
    id: '2',
    customerId: '2',
    barberId: '2',
    serviceIds: ['3'],
    date: new Date(),
    startTime: '16:00',
    endTime: '16:45',
    status: 'scheduled',
    notes: 'Corte + Barba',
    createdAt: new Date(),
  }
];

export function AppProvider({ children }: AppProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [barbers, setBarbers] = useState<Barber[]>(mockBarbers);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [sales, setSales] = useState<Sale[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem('appointments');
    console.log('=== DEBUG: Carregando agendamentos do localStorage ===');
    console.log('Dados armazenados:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Dados parseados:', parsed);
        
        const converted = parsed.map((a: any) => ({
          ...a,
          date: new Date(a.date),
          createdAt: new Date(a.createdAt),
        }));
        
        console.log('Agendamentos convertidos:', converted);
        return converted;
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return [];
      }
    }
    
    console.log('Nenhum dado encontrado, usando mock');
    return [
      {
        id: '1',
        customerId: '1',
        barberId: '1',
        serviceIds: ['1', '2'],
        date: new Date(),
        startTime: '14:00',
        endTime: '15:00',
        status: 'scheduled',
        notes: 'Agendamento de teste',
        createdAt: new Date(),
      }
    ];
  });
  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [printerConfigs, setPrinterConfigs] = useState<PrinterConfig[]>([]);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addService = (service: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addBarber = (barber: Omit<Barber, 'id' | 'createdAt'>) => {
    const newBarber: Barber = {
      ...barber,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBarbers(prev => [...prev, newBarber]);
  };

  const updateBarber = (id: string, updates: Partial<Barber>) => {
    setBarbers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBarber = (id: string) => {
    setBarbers(prev => prev.filter(b => b.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalPurchases: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer.id;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCreditAccount = (account: Omit<CreditAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: CreditAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCreditAccounts(prev => [...prev, newAccount]);
  };

  const updateCreditAccount = (id: string, updates: Partial<CreditAccount>) => {
    setCreditAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a));
  };

  const addCreditTransaction = (transaction: Omit<CreditTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: CreditTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCreditTransactions(prev => [...prev, newTransaction]);
    
    // Atualizar totalDebt da conta de crédito
    setCreditAccounts(prev => prev.map(account => {
      if (account.id === transaction.creditAccountId) {
        const newTotalDebt = account.totalDebt + (transaction.type === 'purchase' ? transaction.amount : -transaction.amount);
        return {
          ...account,
          totalDebt: newTotalDebt,
          updatedAt: new Date()
        };
      }
      return account;
    }));
  };

  const updateCreditTransaction = (id: string, updates: Partial<CreditTransaction>) => {
    setCreditTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const getCustomerCreditAccount = (customerId: string) => {
    return creditAccounts.find(account => account.customerId === customerId);
  };

  const getCustomerTransactions = (customerId: string) => {
    return creditTransactions.filter(transaction => transaction.customerId === customerId);
  };

  // Função para calcular o total de compras baseado nas vendas reais
  const getCustomerTotalPurchases = (customerId: string) => {
    const customerSales = sales.filter(sale => sale.customerId === customerId);
    return customerSales.reduce((total, sale) => {
      // Para vendas 100% no fiado, não contar no total de compras
      if (sale.paymentMethod === 'credit') {
        return total;
      }
      
      // Para vendas mistas, somar apenas a parte paga (assumindo 50%)
      if (sale.paymentMethod === 'mixed') {
        return total + (sale.total * 0.5);
      }
      
      // Para vendas pagas (cash, card, pix), somar o valor total
      return total + sale.total;
    }, 0);
  };

  // Função para calcular o total fiado baseado nas vendas reais
  const getCustomerTotalCredit = (customerId: string) => {
    const customerSales = sales.filter(sale => sale.customerId === customerId);
    
    return customerSales.reduce((total, sale) => {
      // Para vendas 100% no fiado, somar o valor total
      if (sale.paymentMethod === 'credit') {
        return total + sale.total;
      }
      
      // Para vendas mistas, somar apenas a parte fiada (assumindo 50%)
      if (sale.paymentMethod === 'mixed') {
        return total + (sale.total * 0.5);
      }
      
      // Para vendas pagas (cash, card, pix), não somar nada no fiado
      return total;
    }, 0);
  };

  // Função para obter o histórico de vendas de um cliente
  const getCustomerSales = (customerId: string) => {
    return sales.filter(sale => sale.customerId === customerId);
  };

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale = {
      ...sale,
      id: `sale-${Date.now()}`,
      createdAt: new Date()
    };
    setSales(prev => [...prev, newSale]);

    // Lógica para gerar comissão (exemplo)
    const newCommissions: Commission[] = [];
    sale.items.forEach(item => {
      if (item.type === 'service' && item.barberId && item.serviceId) {
        const service = services.find(s => s.id === item.serviceId);
        const barber = barbers.find(b => b.id === item.barberId);

        if (service && barber) {
          const commissionAmount = service.price * (barber.commissionRate / 100);
          const newCommission: Commission = {
            id: `comm-${Date.now()}-${item.serviceId}`,
            barberId: item.barberId,
            saleId: newSale.id,
            serviceId: item.serviceId,
            amount: commissionAmount,
            percentage: barber.commissionRate,
            status: 'pending',
            period: new Date().toISOString().slice(0, 7), // Formato YYYY-MM
            createdAt: new Date(),
          };
          newCommissions.push(newCommission);
        }
      }
    });

    // Adiciona as novas comissões ao estado (se houver um estado de comissões)
    if (newCommissions.length > 0) {
      console.log('Comissões geradas:', newCommissions);
      // setCommissions(prev => [...prev, ...newCommissions]);
    }
  };

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    console.log('=== DEBUG: Adicionando novo agendamento ===');
    console.log('Dados recebidos:', appointment);
    
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date(),
      date: new Date(appointment.date),
    };
    
    console.log('Agendamento criado:', newAppointment);
    
    setAppointments(prev => {
      const newAppointments = [...prev, newAppointment];
      console.log('Total de agendamentos após adição:', newAppointments.length);
      console.log('Agendamentos:', newAppointments);
      return newAppointments;
    });
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Printer Configuration Functions
  const addPrinterConfig = (config: Omit<PrinterConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newConfig: PrinterConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPrinterConfigs(prev => [...prev, newConfig]);
  };

  const updatePrinterConfig = (id: string, updates: Partial<PrinterConfig>) => {
    setPrinterConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, ...updates, updatedAt: new Date() } : config
    ));
  };

  const deletePrinterConfig = (id: string) => {
    setPrinterConfigs(prev => prev.filter(config => config.id !== id));
  };

  const setDefaultPrinter = (id: string) => {
    setPrinterConfigs(prev => prev.map(config => ({
      ...config,
      isDefault: config.id === id,
      updatedAt: new Date()
    })));
  };

  const getDefaultPrinter = () => {
    return printerConfigs.find(config => config.isDefault) || null;
  };

  const updateCompanyConfig = (config: Partial<CompanyConfig>) => {
    if (companyConfig) {
      setCompanyConfig(prev => prev ? { ...prev, ...config, updatedAt: new Date() } : null);
    } else {
      const newConfig: CompanyConfig = {
        id: Date.now().toString(),
        name: config.name || '',
        cnpj: config.cnpj || '',
        address: config.address || '',
        phone: config.phone || '',
        email: config.email || '',
        website: config.website,
        logo: config.logo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCompanyConfig(newConfig);
    }
  };

  const printReceipt = async (printData: PrintData): Promise<void> => {
    const defaultPrinter = getDefaultPrinter();
    if (!defaultPrinter) {
      throw new Error('Nenhuma impressora padrão configurada');
    }

    // Simular impressão - em produção, aqui seria a integração real com a impressora
    console.log('Imprimindo recibo:', printData);
    console.log('Impressora:', defaultPrinter.name);
    
    // Simular delay de impressão
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Recibo impresso com sucesso!');
  };

  React.useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const value: AppContextType = {
    isDarkMode,
    toggleTheme,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    services,
    addService,
    updateService,
    deleteService,
    barbers,
    addBarber,
    updateBarber,
    deleteBarber,
    customers,
    addCustomer,
    updateCustomer,
    creditAccounts,
    creditTransactions,
    addCreditAccount,
    updateCreditAccount,
    addCreditTransaction,
    updateCreditTransaction,
    getCustomerCreditAccount,
    getCustomerTransactions,
    sales,
    addSale,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    getCustomerTotalPurchases,
    getCustomerTotalCredit,
    getCustomerSales,
    printerConfigs,
    companyConfig,
    addPrinterConfig,
    updatePrinterConfig,
    deletePrinterConfig,
    setDefaultPrinter,
    getDefaultPrinter,
    updateCompanyConfig,
    printReceipt,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}