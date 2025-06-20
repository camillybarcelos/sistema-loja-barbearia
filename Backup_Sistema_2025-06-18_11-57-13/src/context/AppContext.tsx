import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Service, Barber, Customer, Sale, Commission, Appointment, CreditAccount, CreditTransaction } from '../types';
import { BackupManager, useAutoBackup } from '../utils/backup';

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

// Mock data
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
  },
  {
    id: '2',
    name: 'Calça Jeans Skinny',
    barcode: '7891234567891',
    category: 'clothing',
    price: 129.99,
    cost: 65.00,
    stock: 15,
    minStock: 3,
    brand: 'Jeans Co.',
    size: '42',
    color: 'Azul Escuro',
    description: 'Calça jeans skinny masculina',
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
    commission: 40,
    category: 'haircut',
    description: 'Corte de cabelo masculino tradicional',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Barba + Bigode',
    price: 20.00,
    duration: 20,
    commission: 35,
    category: 'beard',
    description: 'Aparar e modelar barba e bigode',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Combo Completo',
    price: 40.00,
    duration: 50,
    commission: 45,
    category: 'combo',
    description: 'Corte + Barba + Finalização',
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
    specialties: ['Corte Masculino', 'Barba'],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Pedro Santos',
    email: 'pedro@barbearia.com',
    phone: '(11) 99999-8888',
    commissionRate: 35,
    specialties: ['Corte Moderno', 'Combo'],
    isActive: true,
    createdAt: new Date(),
  }
];

export function AppProvider({ children }: AppProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [barbers, setBarbers] = useState<Barber[]>(mockBarbers);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto backup setup
  useEffect(() => {
    const backupData = {
      products,
      services,
      barbers,
      customers,
      sales,
      commissions: [], // Will be calculated from sales
      appointments,
      creditAccounts,
      creditTransactions
    };

    // Start auto backup
    BackupManager.startAutoBackup(backupData);

    // Clean old backups weekly
    const cleanupInterval = setInterval(() => {
      BackupManager.cleanOldBackups(30);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [products, services, barbers, customers, sales, appointments, creditAccounts, creditTransactions]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...updates, updatedAt: new Date() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
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
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...updates } : service
    ));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
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
    setBarbers(prev => prev.map(barber => 
      barber.id === id ? { ...barber, ...updates } : barber
    ));
  };

  const deleteBarber = (id: string) => {
    setBarbers(prev => prev.filter(barber => barber.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      totalPurchases: 0,
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer.id;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    ));
  };

  // Credit System Functions
  const addCreditAccount = (account: Omit<CreditAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: CreditAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCreditAccounts(prev => [...prev, newAccount]);
    
    // Update customer to mark as having credit account
    updateCustomer(account.customerId, { hasCreditAccount: true });
  };

  const updateCreditAccount = (id: string, updates: Partial<CreditAccount>) => {
    setCreditAccounts(prev => prev.map(account => 
      account.id === id 
        ? { ...account, ...updates, updatedAt: new Date() }
        : account
    ));
  };

  const addCreditTransaction = (transaction: Omit<CreditTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: CreditTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setCreditTransactions(prev => [...prev, newTransaction]);
    
    // Update credit account total debt using functional update
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
    setCreditTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updates } : transaction
    ));
  };

  const getCustomerCreditAccount = (customerId: string) => {
    return creditAccounts.find(account => account.customerId === customerId);
  };

  const getCustomerTransactions = (customerId: string) => {
    return creditTransactions.filter(transaction => transaction.customerId === customerId);
  };

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setSales(prev => [...prev, newSale]);
    
    // Update customer total purchases (only for non-credit sales)
    if (sale.customerId && sale.paymentMethod !== 'credit') {
      const customer = customers.find(c => c.id === sale.customerId);
      if (customer) {
        updateCustomer(customer.id, { 
          totalPurchases: customer.totalPurchases + sale.total,
          lastVisit: new Date()
        });
      }
    } else if (sale.customerId) {
      // For credit sales, only update last visit
      const customer = customers.find(c => c.id === sale.customerId);
      if (customer) {
        updateCustomer(customer.id, { 
          lastVisit: new Date()
        });
      }
    }
  };

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id ? { ...appointment, ...updates } : appointment
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  return (
    <AppContext.Provider value={{
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
    }}>
      {children}
    </AppContext.Provider>
  );
}