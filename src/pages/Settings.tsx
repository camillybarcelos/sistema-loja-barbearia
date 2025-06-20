import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building, 
  CreditCard,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Clock,
  HardDrive,
  Printer,
  Plus,
  Edit,
  Trash,
  Receipt,
  Eye,
  FileText,
  X,
  Check,
  Search,
  Wifi,
  Usb,
  Monitor,
  AlertCircle,
  Info,
  Users,
  Key,
  EyeOff,
  Copy
} from 'lucide-react';
import { BackupManager } from '../utils/backup';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Product, 
  Service, 
  Barber, 
  Customer, 
  Sale, 
  Commission, 
  Appointment, 
  DashboardStats, 
  CreditAccount, 
  CreditTransaction, 
  LoyaltyProgram, 
  CustomerLoyalty, 
  LoyaltyTransaction,
  PrinterConfig,
  CompanyConfig,
  ReceiptConfig,
  SystemPrinter,
  ManualPrinterData,
  SystemUser,
  UserPermissions,
  CreateUserData,
  UpdateUserData
} from '../types';

export default function Settings() {
  const { 
    printerConfigs, 
    companyConfig, 
    addPrinterConfig, 
    updatePrinterConfig, 
    getDefaultPrinter, 
    updateCompanyConfig,
    setDefaultPrinter: contextSetDefault,
    deletePrinterConfig: contextDeletePrinter
  } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [backupStats, setBackupStats] = useState({
    totalBackups: 0,
    latestBackup: null as string | null,
    totalSize: 0
  });
  
  // Estados para configuração de cupom
  const [receiptConfigs, setReceiptConfigs] = useState<ReceiptConfig[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptConfig | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Configuração padrão de cupom
  const [defaultReceiptConfig, setDefaultReceiptConfig] = useState<ReceiptConfig>({
    id: 'default',
    name: 'Configuração Padrão',
    printerId: '',
    printerType: 'thermal',
    paperSize: '80mm',
    receiptType: 'non_fiscal',
    content: {
      showCompanyName: true,
      showCnpj: true,
      showAddress: true,
      showPhone: true,
      showCustomerName: true,
      showItemsList: true,
      showQuantity: true,
      showUnitPrice: true,
      showTotal: true,
      showPaymentMethod: true,
      showDateTime: true,
      showSaleNumber: true,
      showBarberName: true,
      showCustomMessage: false,
      customMessage: ''
    },
    formatting: {
      fontSize: 12,
      lineSpacing: 1.2,
      margin: 10,
      alignment: 'left',
      boldHeaders: true,
      showSeparators: true
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [settings, setSettings] = useState({
    businessName: 'Loja de Roupas e Barbearia',
    businessAddress: 'Rua das Flores, 123',
    businessPhone: '(11) 99999-9999',
    businessEmail: 'contato@loja.com',
    taxRate: 0.05,
    currency: 'BRL',
    language: 'pt-BR',
    theme: 'light',
    backup: {
      autoBackup: true,
      backupInterval: 60, // minutes
      keepBackups: 30, // days
      compressBackups: true
    },
    notifications: {
      lowStock: true,
      newSales: true,
      appointments: true,
      commissions: false
    },
    security: {
      requirePassword: true,
      sessionTimeout: 30,
      twoFactorAuth: false
    }
  });

  // Estados para configuração de impressoras
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<SystemPrinter[]>([]);
  const [isDetectingPrinters, setIsDetectingPrinters] = useState(false);
  const [printerModalMode, setPrinterModalMode] = useState<'detect' | 'manual'>('detect');

  // Estados para gerenciamento de usuários
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userMessage, setUserMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load backup statistics
    const stats = BackupManager.getBackupStats();
    setBackupStats(stats);
  }, []);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => {
      const categoryKey = category as keyof typeof prev;
      const categorySettings = prev[categoryKey] as Record<string, any>;
      return {
      ...prev,
      [category]: {
          ...categorySettings,
        [key]: value
      }
      };
    });
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as configurações
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
  };

  const handleCreateBackup = () => {
    try {
      // Mock data for backup
      const mockData = {
        products: [],
        services: [],
        barbers: [],
        customers: [],
        sales: [],
        commissions: [],
        appointments: [],
        creditAccounts: [],
        creditTransactions: []
      };
      
      const backup = BackupManager.createBackup(mockData);
      BackupManager.exportBackup(backup);
      
      // Update stats
      const stats = BackupManager.getBackupStats();
      setBackupStats(stats);
      
      alert('Backup criado e exportado com sucesso!');
    } catch (error) {
      alert('Erro ao criar backup: ' + error);
    }
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    BackupManager.importBackup(file)
      .then(backup => {
        // Here you would restore the data
        console.log('Backup imported:', backup);
        alert('Backup importado com sucesso!');
      })
      .catch(error => {
        alert('Erro ao importar backup: ' + error.message);
      });
  };

  const handleCleanOldBackups = () => {
    BackupManager.cleanOldBackups(settings.backup.keepBackups);
    const stats = BackupManager.getBackupStats();
    setBackupStats(stats);
    alert('Backups antigos removidos com sucesso!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'general', name: 'Geral', icon: SettingsIcon },
    { id: 'business', name: 'Empresa', icon: Building },
    { id: 'printer', name: 'Impressora', icon: Printer },
    { id: 'receipt', name: 'Cupom', icon: Receipt },
    { id: 'users', name: 'Gerenciar Acessos', icon: Users },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'backup', name: 'Backup', icon: Database }
  ];

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const loadReceiptConfigs = () => {
      try {
        const savedConfigs = localStorage.getItem('receiptConfigs');
        if (savedConfigs) {
          const parsedConfigs = JSON.parse(savedConfigs);
          setReceiptConfigs(parsedConfigs);
          
          // Encontrar configuração padrão
          const defaultConfig = parsedConfigs.find((config: ReceiptConfig) => config.isDefault);
          if (defaultConfig) {
            setDefaultReceiptConfig(defaultConfig);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de cupom:', error);
      }
    };

    loadReceiptConfigs();
  }, []);

  // Salvar configurações no localStorage
  const saveReceiptConfigsToStorage = (configs: ReceiptConfig[]) => {
    try {
      localStorage.setItem('receiptConfigs', JSON.stringify(configs));
    } catch (error) {
      console.error('Erro ao salvar configurações de cupom:', error);
    }
  };

  // Funções para configuração de cupom
  const handleSaveReceiptConfig = (config: ReceiptConfig) => {
    let updatedConfigs: ReceiptConfig[];
    
    if (editingReceipt) {
      // Atualizar configuração existente
      updatedConfigs = receiptConfigs.map(c => 
        c.id === editingReceipt.id 
          ? { ...config, updatedAt: new Date() }
          : c
      );
    } else {
      // Criar nova configuração
      const newConfig: ReceiptConfig = {
        ...config,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      updatedConfigs = [...receiptConfigs, newConfig];
    }

    // Se esta configuração é padrão, remover padrão das outras
    if (config.isDefault) {
      updatedConfigs = updatedConfigs.map(c => ({
        ...c,
        isDefault: c.id === config.id
      }));
    }

    // Salvar no estado e localStorage
    setReceiptConfigs(updatedConfigs);
    saveReceiptConfigsToStorage(updatedConfigs);
    
    // Atualizar configuração padrão se necessário
    if (config.isDefault) {
      setDefaultReceiptConfig(config);
    }

    // Mostrar mensagem de sucesso
    setSaveMessage('Configuração salva com sucesso!');
    setTimeout(() => setSaveMessage(''), 3000);

    setShowReceiptModal(false);
    setEditingReceipt(null);
  };

  const handleEditReceipt = (config: ReceiptConfig) => {
    setEditingReceipt(config);
    setShowReceiptModal(true);
  };

  const handleDeleteReceipt = (id: string) => {
    const updatedConfigs = receiptConfigs.filter(c => c.id !== id);
    setReceiptConfigs(updatedConfigs);
    saveReceiptConfigsToStorage(updatedConfigs);
    
    // Se a configuração deletada era padrão, definir a primeira como padrão
    const deletedConfig = receiptConfigs.find(c => c.id === id);
    if (deletedConfig?.isDefault && updatedConfigs.length > 0) {
      const newDefault = { ...updatedConfigs[0], isDefault: true };
      const finalConfigs = updatedConfigs.map(c => 
        c.id === newDefault.id ? newDefault : { ...c, isDefault: false }
      );
      setReceiptConfigs(finalConfigs);
      setDefaultReceiptConfig(newDefault);
      saveReceiptConfigsToStorage(finalConfigs);
    }
  };

  const handleSetDefaultReceipt = (id: string) => {
    const updatedConfigs = receiptConfigs.map(c => ({
      ...c,
      isDefault: c.id === id
    }));
    
    setReceiptConfigs(updatedConfigs);
    saveReceiptConfigsToStorage(updatedConfigs);
    
    const newDefault = updatedConfigs.find(c => c.id === id);
    if (newDefault) {
      setDefaultReceiptConfig(newDefault);
    }
  };

  const handleTestPrint = () => {
    // Simular impressão de teste
    const testData = {
      saleId: 'TEST-001',
      saleNumber: '001',
      customerName: 'Cliente Teste',
      barberName: 'Barbeiro Teste',
      items: [
        { name: 'Corte Masculino', quantity: 1, unitPrice: 30, total: 30, type: 'service' as const },
        { name: 'Pomada Modeladora', quantity: 1, unitPrice: 15, total: 15, type: 'product' as const }
      ],
      subtotal: 45,
      discount: 0,
      total: 45,
      paymentMethods: [{ type: 'Dinheiro', amount: 45 }],
      saleDate: new Date(),
      companyInfo: {
        name: companyConfig?.name || 'Empresa Teste',
        cnpj: companyConfig?.cnpj || '00.000.000/0000-00',
        address: companyConfig?.address || 'Endereço Teste',
        phone: companyConfig?.phone || '(11) 99999-9999'
      },
      config: defaultReceiptConfig
    };
    
    // Abrir janela de impressão de teste
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML(testData));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReceiptHTML = (data: any) => {
    const { companyInfo, items, total, paymentMethods, saleDate, config } = data;
    const { content, formatting } = config;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cupom de Teste</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: ${formatting.fontSize}px;
            line-height: ${formatting.lineSpacing};
            margin: ${formatting.margin}mm;
            text-align: ${formatting.alignment};
            width: ${config.paperSize === '80mm' ? '80mm' : config.paperSize === '57mm' ? '57mm' : '210mm'};
          }
          .header { ${formatting.boldHeaders ? 'font-weight: bold;' : ''} text-align: center; }
          .separator { border-top: 1px dashed #000; margin: 5px 0; }
          .item { display: flex; justify-content: space-between; margin: 2px 0; }
          .total { font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 10px; }
        </style>
      </head>
      <body>
        ${content.showCompanyName ? `<div class="header">${companyInfo.name}</div>` : ''}
        ${content.showCnpj ? `<div class="header">CNPJ: ${companyInfo.cnpj}</div>` : ''}
        ${content.showAddress ? `<div class="header">${companyInfo.address}</div>` : ''}
        ${content.showPhone ? `<div class="header">Tel: ${companyInfo.phone}</div>` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        ${content.showDateTime ? `<div>Data: ${saleDate.toLocaleDateString()}</div>` : ''}
        ${content.showDateTime ? `<div>Hora: ${saleDate.toLocaleTimeString()}</div>` : ''}
        ${content.showSaleNumber ? `<div>Venda: ${data.saleNumber}</div>` : ''}
        ${content.showCustomerName ? `<div>Cliente: ${data.customerName}</div>` : ''}
        ${content.showBarberName ? `<div>Atendente: ${data.barberName}</div>` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        ${content.showItemsList ? `
          <div class="header">ITENS</div>
          ${items.map((item: any) => `
            <div class="item">
              <span>${item.name}</span>
              <span>${item.quantity}x R$ ${item.unitPrice.toFixed(2)}</span>
            </div>
          `).join('')}
        ` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        <div class="total">TOTAL: R$ ${total.toFixed(2)}</div>
        
        ${content.showPaymentMethod ? `
          <div>Forma de Pagamento:</div>
          ${paymentMethods.map((pm: any) => `<div>${pm.type}: R$ ${pm.amount.toFixed(2)}</div>`).join('')}
        ` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        ${content.showCustomMessage ? `<div class="footer">${content.customMessage}</div>` : ''}
        
        <div class="footer">*** CUPOM DE TESTE ***</div>
      </body>
      </html>
    `;
  };

  // Função para detectar impressoras do sistema
  const detectSystemPrinters = async () => {
    setIsDetectingPrinters(true);
    try {
      // Simulação de detecção de impressoras (em um ambiente real, isso seria feito via API nativa)
      const mockPrinters: SystemPrinter[] = [
        {
          name: 'Impressora Térmica EPSON TM-T20',
          port: 'USB001',
          type: 'thermal',
          isNetwork: false,
          isDefault: true
        },
        {
          name: 'Impressora Laser HP LaserJet Pro',
          port: 'USB002',
          type: 'laser',
          isNetwork: false,
          isDefault: false
        },
        {
          name: 'Impressora de Rede Brother HL-L2350DW',
          port: '192.168.1.100',
          type: 'laser',
          isNetwork: true,
          isDefault: false
        },
        {
          name: 'Impressora Térmica Bematech MP-4200',
          port: 'COM3',
          type: 'thermal',
          isNetwork: false,
          isDefault: false
        }
      ];
      
      // Simular delay de detecção
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAvailablePrinters(mockPrinters);
    } catch (error) {
      console.error('Erro ao detectar impressoras:', error);
      setAvailablePrinters([]);
    } finally {
      setIsDetectingPrinters(false);
    }
  };

  // Função para adicionar impressora detectada
  const addDetectedPrinter = (systemPrinter: SystemPrinter) => {
    const newPrinter: PrinterConfig = {
      id: Date.now().toString(),
      name: systemPrinter.name,
      model: getPrinterModel(systemPrinter.name),
      port: systemPrinter.port,
      baudRate: systemPrinter.type === 'thermal' ? 9600 : undefined,
      isDefault: printerConfigs.length === 0,
      type: systemPrinter.type,
      isNetwork: systemPrinter.isNetwork,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addPrinterConfig(newPrinter);
    setShowPrinterModal(false);
    setAvailablePrinters([]);
  };

  // Função para adicionar impressora manual
  const addManualPrinter = (printerData: ManualPrinterData) => {
    const newPrinter: PrinterConfig = {
      id: Date.now().toString(),
      name: printerData.name,
      model: printerData.model,
      port: printerData.port,
      baudRate: printerData.baudRate,
      isDefault: printerConfigs.length === 0,
      type: printerData.type,
      isNetwork: printerData.isNetwork,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addPrinterConfig(newPrinter);
    setShowPrinterModal(false);
  };

  // Função para definir impressora padrão
  const setDefaultPrinter = (printerId: string) => {
    contextSetDefault(printerId);
  };

  // Função para deletar impressora
  const deletePrinterConfig = (printerId: string) => {
    contextDeletePrinter(printerId);
  };

  // Função para abrir modal de impressora
  const openPrinterModal = (mode: 'detect' | 'manual' = 'detect') => {
    setPrinterModalMode(mode);
    setShowPrinterModal(true);
    setEditingPrinter(null);
    if (mode === 'detect') {
      detectSystemPrinters();
    }
  };

  // Função auxiliar para determinar o modelo da impressora
  const getPrinterModel = (printerName: string): PrinterConfig['model'] => {
    const name = printerName.toLowerCase();
    if (name.includes('epson')) return 'epson';
    if (name.includes('bematech')) return 'bematech';
    if (name.includes('elgin')) return 'elgin';
    if (name.includes('daruma')) return 'daruma';
    if (name.includes('sweda')) return 'sweda';
    return 'generic';
  };

  // Carregar usuários do localStorage
  useEffect(() => {
    const loadSystemUsers = () => {
      try {
        const savedUsers = localStorage.getItem('systemUsers');
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          setSystemUsers(parsedUsers);
        } else {
          // Criar usuário administrador padrão se não existir
          const defaultAdmin: SystemUser = {
            id: 'admin-001',
            name: 'Administrador',
            email: 'admin@sistema.com',
            function: 'admin',
            password: 'admin123',
            status: 'active',
            permissions: {
              dashboard: true,
              pdv: true,
              cashRegister: true,
              customers: true,
              products: true,
              appointments: true,
              sales: true,
              reports: true,
              settings: true,
              userManagement: true,
              barbers: true,
              services: true,
              commissions: true,
              loyalty: true,
              backup: true,
              canCreateUsers: true,
              canEditUsers: true,
              canDeleteUsers: true,
              canViewReports: true,
              canEditSettings: true
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system'
          };
          setSystemUsers([defaultAdmin]);
          localStorage.setItem('systemUsers', JSON.stringify([defaultAdmin]));
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    loadSystemUsers();
  }, []);

  // Salvar usuários no localStorage
  const saveUsersToStorage = (users: SystemUser[]) => {
    try {
      localStorage.setItem('systemUsers', JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
    }
  };

  // Gerar senha automática
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Funções para gerenciamento de usuários
  const handleSaveUser = (userData: CreateUserData | UpdateUserData) => {
    let updatedUsers: SystemUser[];
    
    if (editingUser) {
      // Atualizar usuário existente
      updatedUsers = systemUsers.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              name: userData.name || user.name,
              email: userData.email || user.email,
              function: userData.function || user.function,
              updatedAt: new Date(),
              permissions: { ...user.permissions, ...userData.permissions }
            }
          : user
      );
    } else {
      // Criar novo usuário
      const createData = userData as CreateUserData;
      const newUser: SystemUser = {
        id: Date.now().toString(),
        name: createData.name,
        email: createData.email,
        function: createData.function,
        password: createData.password || generatePassword(),
        status: 'active',
        permissions: {
          dashboard: false,
          pdv: false,
          cashRegister: false,
          customers: false,
          products: false,
          appointments: false,
          sales: false,
          reports: false,
          settings: false,
          userManagement: false,
          barbers: false,
          services: false,
          commissions: false,
          loyalty: false,
          backup: false,
          canCreateUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewReports: false,
          canEditSettings: false,
          ...createData.permissions
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-001' // ID do usuário atual
      };
      updatedUsers = [...systemUsers, newUser];
    }

    setSystemUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    
    setUserMessage(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    setTimeout(() => setUserMessage(''), 3000);

    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = systemUsers.filter(user => user.id !== userId);
    setSystemUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    
    setUserMessage('Usuário removido com sucesso!');
    setTimeout(() => setUserMessage(''), 3000);
  };

  const handleResetPassword = (userId: string) => {
    const newPassword = generatePassword();
    const updatedUsers = systemUsers.map(user => 
      user.id === userId 
        ? { ...user, password: newPassword, updatedAt: new Date() }
        : user
    );
    
    setSystemUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    
    setUserMessage(`Senha redefinida: ${newPassword}`);
    setTimeout(() => setUserMessage(''), 5000);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = systemUsers.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' as const : 'active' as const, updatedAt: new Date() }
        : user
    );
    
    setSystemUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    
    setUserMessage('Status do usuário atualizado!');
    setTimeout(() => setUserMessage(''), 3000);
  };

  const openUserModal = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure as preferências do sistema
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configurações Gerais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Idioma
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Moeda
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BRL">Real (R$)</option>
                        <option value="USD">Dólar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Taxa de Imposto (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.taxRate * 100}
                        onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) / 100})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informações da Empresa
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        value={settings.businessName}
                        onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={settings.businessAddress}
                        onChange={(e) => setSettings({...settings, businessAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={settings.businessPhone}
                          onChange={(e) => setSettings({...settings, businessPhone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.businessEmail}
                          onChange={(e) => setSettings({...settings, businessEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'printer' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Configurações de Impressora
                    </h3>
                    <button
                      onClick={() => openPrinterModal('detect')}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Impressora
                    </button>
                  </div>
                  
                  {/* Lista de Impressoras */}
                  <div className="space-y-4">
                    {printerConfigs.length === 0 ? (
                      <div className="text-center py-8">
                        <Printer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Nenhuma impressora configurada
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Adicione uma impressora para começar a imprimir recibos
                        </p>
                      </div>
                    ) : (
                      printerConfigs.map((printer) => (
                        <div
                          key={printer.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Printer className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {printer.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {printer.model} - {printer.port}
                                {printer.isDefault && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Padrão
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!printer.isDefault && (
                              <button
                                onClick={() => setDefaultPrinter(printer.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Definir como padrão"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deletePrinterConfig(printer.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remover impressora"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Configurações da Empresa para Impressão */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Informações da Empresa para Impressão
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={companyConfig?.name || ''}
                          onChange={(e) => updateCompanyConfig({ name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nome da empresa"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={companyConfig?.cnpj || ''}
                          onChange={(e) => updateCompanyConfig({ cnpj: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={companyConfig?.address || ''}
                          onChange={(e) => updateCompanyConfig({ address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Endereço completo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={companyConfig?.phone || ''}
                          onChange={(e) => updateCompanyConfig({ phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={companyConfig?.email || ''}
                          onChange={(e) => updateCompanyConfig({ email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="contato@empresa.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={companyConfig?.website || ''}
                          onChange={(e) => updateCompanyConfig({ website: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.empresa.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'receipt' && (
                <div className="space-y-6">
                  {/* Mensagem de Confirmação */}
                  {saveMessage && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800 dark:text-green-200 font-medium">
                          {saveMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Configuração de Impressão de Cupom
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleTestPrint}
                        className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Imprimir Teste
                      </button>
                      <button
                        onClick={() => {
                          setEditingReceipt(null);
                          setShowReceiptModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Configuração
                      </button>
                    </div>
                  </div>
                  
                  {/* Configuração Atual */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Configuração Atual
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Nome:</span>
                        <p className="text-blue-700 dark:text-blue-300">{defaultReceiptConfig.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Tipo de Impressora:</span>
                        <p className="text-blue-700 dark:text-blue-300">{defaultReceiptConfig.printerType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Tamanho do Papel:</span>
                        <p className="text-blue-700 dark:text-blue-300">{defaultReceiptConfig.paperSize}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Tipo de Cupom:</span>
                        <p className="text-blue-700 dark:text-blue-300">{defaultReceiptConfig.receiptType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Última Atualização:</span>
                        <p className="text-blue-700 dark:text-blue-300">
                          {defaultReceiptConfig.updatedAt ? new Date(defaultReceiptConfig.updatedAt).toLocaleString('pt-BR') : 'Nunca'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lista de Configurações de Cupom */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Configurações Salvas
                    </h4>
                    {receiptConfigs.length === 0 ? (
                      <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Nenhuma configuração de cupom salva
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Crie configurações personalizadas para diferentes tipos de impressão
                        </p>
                      </div>
                    ) : (
                      receiptConfigs.map((receipt) => (
                        <div
                          key={receipt.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Receipt className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {receipt.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {receipt.printerType} - {receipt.paperSize}
                                {receipt.isDefault && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Padrão
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditReceipt(receipt)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar configuração"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {!receipt.isDefault && (
                              <button
                                onClick={() => handleSetDefaultReceipt(receipt.id)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Definir como padrão"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remover configuração"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Mensagem de Confirmação */}
                  {userMessage && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800 dark:text-green-200 font-medium">
                          {userMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Gerenciar Usuários
                    </h3>
                    <button
                      onClick={openUserModal}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Usuário
                    </button>
                  </div>
                  
                  {/* Lista de Usuários */}
                  <div className="space-y-4">
                    {systemUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Nenhum usuário cadastrado
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Adicione um usuário para começar a gerenciar acessos
                        </p>
                      </div>
                    ) : (
                      systemUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email} • {user.function}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Status: {user.status === 'active' ? 'Ativo' : 'Inativo'} • 
                                Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                {user.lastAccess && ` • Último acesso: ${new Date(user.lastAccess).toLocaleDateString('pt-BR')}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Redefinir senha"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`p-2 transition-colors ${
                                user.status === 'active' 
                                  ? 'text-green-400 hover:text-red-600' 
                                  : 'text-red-400 hover:text-green-600'
                              }`}
                              title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                            >
                              {user.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            {user.id !== 'admin-001' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Remover usuário"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notificações
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {key === 'lowStock' && 'Estoque Baixo'}
                            {key === 'newSales' && 'Novas Vendas'}
                            {key === 'appointments' && 'Agendamentos'}
                            {key === 'commissions' && 'Comissões'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receber notificações sobre {key === 'lowStock' && 'produtos com estoque baixo'}
                            {key === 'newSales' && 'novas vendas realizadas'}
                            {key === 'appointments' && 'agendamentos confirmados'}
                            {key === 'commissions' && 'comissões pendentes'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', key, !value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Segurança
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Exigir Senha
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Exigir senha para acessar o sistema
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('security', 'requirePassword', !settings.security.requirePassword)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.requirePassword ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security.requirePassword ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timeout da Sessão (minutos)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Aparência
                  </h3>
                  
                  <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tema
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configurações de Backup
                  </h3>
                  
                  {/* Backup Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Backups</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{backupStats.totalBackups}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Último Backup</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {backupStats.latestBackup ? 
                              new Date(backupStats.latestBackup).toLocaleDateString('pt-BR') : 
                              'Nunca'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <HardDrive className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamanho Total</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatFileSize(backupStats.totalSize)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Backup Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleCreateBackup}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Criar Backup
                    </button>
                    
                    <label className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                      <Upload className="h-5 w-5 mr-2" />
                      Restaurar Backup
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleRestoreBackup}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Backup Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Configurações Automáticas
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Backup Automático
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Criar backups automaticamente
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.backup.autoBackup}
                          onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </div>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Intervalo de Backup (minutos)
                        </label>
                        <input
                          type="number"
                          min="15"
                          max="1440"
                          value={settings.backup.backupInterval}
                          onChange={(e) => handleSettingChange('backup', 'backupInterval', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Manter Backups por (dias)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={settings.backup.keepBackups}
                          onChange={(e) => handleSettingChange('backup', 'keepBackups', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Comprimir Backups
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Reduzir tamanho dos arquivos
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.backup.compressBackups}
                          onChange={(e) => handleSettingChange('backup', 'compressBackups', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Manutenção
                    </h4>
                    
                    <button
                      onClick={handleCleanOldBackups}
                      className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Backups Antigos
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configuração de Cupom */}
      {showReceiptModal && (
        <ReceiptConfigModal
          config={editingReceipt || defaultReceiptConfig}
          printers={printerConfigs}
          onSave={handleSaveReceiptConfig}
          onClose={() => {
            setShowReceiptModal(false);
            setEditingReceipt(null);
          }}
        />
      )}

      {/* Modal de Configuração de Impressora */}
      {showPrinterModal && (
        <PrinterConfigModal
          mode={printerModalMode}
          availablePrinters={availablePrinters}
          isDetecting={isDetectingPrinters}
          onDetectPrinters={detectSystemPrinters}
          onAddDetected={addDetectedPrinter}
          onAddManual={addManualPrinter}
          onClose={() => setShowPrinterModal(false)}
        />
      )}

      {/* Modal de Gerenciamento de Usuários */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </div>
  );
}

// Modal de Configuração de Cupom
function ReceiptConfigModal({ 
  config, 
  printers, 
  onSave, 
  onClose 
}: { 
  config: ReceiptConfig;
  printers: PrinterConfig[];
  onSave: (config: ReceiptConfig) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ReceiptConfig>(config);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const generatePreviewHTML = () => {
    const testData = {
      saleId: 'PREVIEW-001',
      saleNumber: '001',
      customerName: 'Cliente Exemplo',
      barberName: 'Barbeiro Exemplo',
      items: [
        { name: 'Corte Masculino', quantity: 1, unitPrice: 30, total: 30, type: 'service' as const },
        { name: 'Pomada Modeladora', quantity: 1, unitPrice: 15, total: 15, type: 'product' as const }
      ],
      subtotal: 45,
      discount: 0,
      total: 45,
      paymentMethods: [{ type: 'Dinheiro', amount: 45 }],
      saleDate: new Date(),
      companyInfo: {
        name: 'Empresa Exemplo',
        cnpj: '00.000.000/0000-00',
        address: 'Rua Exemplo, 123',
        phone: '(11) 99999-9999'
      },
      config: formData
    };

    const { companyInfo, items, total, paymentMethods, saleDate } = testData;
    const { content, formatting } = formData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prévia do Cupom</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: ${formatting.fontSize}px;
            line-height: ${formatting.lineSpacing};
            margin: ${formatting.margin}mm;
            text-align: ${formatting.alignment};
            width: ${formData.paperSize === '80mm' ? '80mm' : formData.paperSize === '57mm' ? '57mm' : '210mm'};
            background: white;
            padding: 10px;
            border: 1px solid #ccc;
          }
          .header { ${formatting.boldHeaders ? 'font-weight: bold;' : ''} text-align: center; }
          .separator { border-top: 1px dashed #000; margin: 5px 0; }
          .item { display: flex; justify-content: space-between; margin: 2px 0; }
          .total { font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 10px; }
        </style>
      </head>
      <body>
        ${content.showCompanyName ? `<div class="header">${companyInfo.name}</div>` : ''}
        ${content.showCnpj ? `<div class="header">CNPJ: ${companyInfo.cnpj}</div>` : ''}
        ${content.showAddress ? `<div class="header">${companyInfo.address}</div>` : ''}
        ${content.showPhone ? `<div class="header">Tel: ${companyInfo.phone}</div>` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        ${content.showDateTime ? `<div>Data: ${saleDate.toLocaleDateString()}</div>` : ''}
        ${content.showDateTime ? `<div>Hora: ${saleDate.toLocaleTimeString()}</div>` : ''}
        ${content.showSaleNumber ? `<div>Venda: ${testData.saleNumber}</div>` : ''}
        ${content.showCustomerName ? `<div>Cliente: ${testData.customerName}</div>` : ''}
        ${content.showBarberName ? `<div>Atendente: ${testData.barberName}</div>` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        ${content.showItemsList ? `
          <div class="header">ITENS</div>
          ${items.map((item: any) => `
            <div class="item">
              <span>${item.name}</span>
              <span>${item.quantity}x R$ ${item.unitPrice.toFixed(2)}</span>
            </div>
          `).join('')}
        ` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        <div class="total">TOTAL: R$ ${total.toFixed(2)}</div>
        
        ${content.showPaymentMethod ? `
          <div>Forma de Pagamento:</div>
          ${paymentMethods.map((pm: any) => `<div>${pm.type}: R$ ${pm.amount.toFixed(2)}</div>`).join('')}
        ` : ''}
        
        ${formatting.showSeparators ? '<div class="separator"></div>' : ''}
        
        ${content.showCustomMessage ? `<div class="footer">${content.customMessage}</div>` : ''}
        
        <div class="footer">*** PRÉVIA ***</div>
      </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {config.id === 'default' ? 'Nova Configuração de Cupom' : 'Editar Configuração de Cupom'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
                      </button>
                    </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Informações Básicas
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome da Configuração
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Cupom Térmico 80mm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Impressora
                    </label>
                    <select
                      value={formData.printerId}
                      onChange={(e) => setFormData({...formData, printerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma impressora</option>
                      {printers.map(printer => (
                        <option key={printer.id} value={printer.id}>
                          {printer.name} ({printer.model})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Impressora
                    </label>
                    <select
                      value={formData.printerType}
                      onChange={(e) => setFormData({...formData, printerType: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="thermal">Térmica</option>
                      <option value="laser">Laser</option>
                      <option value="inkjet">Jato de Tinta</option>
                      <option value="roll">Impressora de Rolo</option>
                      <option value="a4">Impressora A4</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Configuração do Papel */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Configuração do Papel
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tamanho do Papel
                    </label>
                    <select
                      value={formData.paperSize}
                      onChange={(e) => setFormData({...formData, paperSize: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="57mm">57mm (Térmica)</option>
                      <option value="80mm">80mm (Térmica)</option>
                      <option value="a4">A4</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  
                  {formData.paperSize === 'custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Largura (mm)
                        </label>
                        <input
                          type="number"
                          value={formData.customWidth || ''}
                          onChange={(e) => setFormData({...formData, customWidth: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Altura (mm)
                        </label>
                        <input
                          type="number"
                          value={formData.customHeight || ''}
                          onChange={(e) => setFormData({...formData, customHeight: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                  </div>
                </div>
              )}
            </div>
          </div>

              {/* Tipo de Cupom */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Tipo de Cupom
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="fiscal"
                      checked={formData.receiptType === 'fiscal'}
                      onChange={(e) => setFormData({...formData, receiptType: e.target.value as any})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cupom Fiscal</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="non_fiscal"
                      checked={formData.receiptType === 'non_fiscal'}
                      onChange={(e) => setFormData({...formData, receiptType: e.target.value as any})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cupom Não Fiscal</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="simple"
                      checked={formData.receiptType === 'simple'}
                      onChange={(e) => setFormData({...formData, receiptType: e.target.value as any})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Recibo Simples</span>
                  </label>
        </div>
              </div>

              {/* Conteúdo do Cupom */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Conteúdo do Cupom
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showCompanyName}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showCompanyName: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nome da empresa</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showCnpj}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showCnpj: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">CNPJ</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showAddress}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showAddress: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Endereço da empresa</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showPhone}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showPhone: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Telefone</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showCustomerName}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showCustomerName: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nome do cliente</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showItemsList}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showItemsList: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lista de itens</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showQuantity}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showQuantity: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Quantidade</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showUnitPrice}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showUnitPrice: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Valor unitário</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showTotal}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showTotal: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Valor total</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showPaymentMethod}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showPaymentMethod: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Forma de pagamento</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showDateTime}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showDateTime: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Data e hora</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showSaleNumber}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showSaleNumber: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Número da venda</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showBarberName}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showBarberName: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nome do barbeiro</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.content.showCustomMessage}
                      onChange={(e) => setFormData({...formData, content: {...formData.content, showCustomMessage: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mensagem personalizada</span>
                  </label>
                  
                  {formData.content.showCustomMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mensagem Personalizada
                      </label>
                      <input
                        type="text"
                        value={formData.content.customMessage}
                        onChange={(e) => setFormData({...formData, content: {...formData.content, customMessage: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Obrigado pela preferência!"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Formatação */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Formatação
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tamanho da Fonte
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="16"
                      value={formData.formatting.fontSize}
                      onChange={(e) => setFormData({...formData, formatting: {...formData.formatting, fontSize: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Espaçamento
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="2"
                      step="0.1"
                      value={formData.formatting.lineSpacing}
                      onChange={(e) => setFormData({...formData, formatting: {...formData.formatting, lineSpacing: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Margem (mm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.formatting.margin}
                      onChange={(e) => setFormData({...formData, formatting: {...formData.formatting, margin: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alinhamento
                    </label>
                    <select
                      value={formData.formatting.alignment}
                      onChange={(e) => setFormData({...formData, formatting: {...formData.formatting, alignment: e.target.value as any}})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.formatting.boldHeaders}
                      onChange={(e) => setFormData({...formData, formatting: {...formData.formatting, boldHeaders: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cabeçalhos em negrito</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.formatting.showSeparators}
                      onChange={(e) => setFormData({...formData, formatting: {...formData.formatting, showSeparators: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar separadores</span>
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  {showPreview ? 'Ocultar' : 'Mostrar'} Prévia
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Salvar Configuração
                </button>
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Pré-visualização
              </h4>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div 
                  className="bg-white border border-gray-200 rounded p-4 mx-auto"
                  style={{
                    width: formData.paperSize === '80mm' ? '80mm' : formData.paperSize === '57mm' ? '57mm' : '210mm',
                    fontFamily: 'Courier New, monospace',
                    fontSize: `${formData.formatting.fontSize}px`,
                    lineHeight: formData.formatting.lineSpacing,
                    textAlign: formData.formatting.alignment
                  }}
                  dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 

// Componente Modal de Configuração de Impressora
function PrinterConfigModal({ 
  mode, 
  availablePrinters, 
  isDetecting, 
  onDetectPrinters, 
  onAddDetected, 
  onAddManual, 
  onClose 
}: { 
  mode: 'detect' | 'manual';
  availablePrinters: SystemPrinter[];
  isDetecting: boolean;
  onDetectPrinters: () => void;
  onAddDetected: (printer: SystemPrinter) => void;
  onAddManual: (data: ManualPrinterData) => void;
  onClose: () => void;
}) {
  const [manualData, setManualData] = useState<ManualPrinterData>({
    name: '',
    model: 'generic',
    port: '',
    baudRate: 9600,
    type: 'thermal',
    isNetwork: false
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualData.name && manualData.port) {
      onAddManual(manualData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'detect' ? 'Detectar Impressoras' : 'Adicionar Impressora Manualmente'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === 'detect' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Impressoras Detectadas
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selecione uma impressora para adicionar ao sistema
                  </p>
                </div>
                <button
                  onClick={onDetectPrinters}
                  disabled={isDetecting}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isDetecting ? 'Detectando...' : 'Detectar Novamente'}
                </button>
              </div>

              {isDetecting ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detectando impressoras disponíveis...
                  </p>
                </div>
              ) : availablePrinters.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Nenhuma impressora detectada
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    Verifique se as impressoras estão conectadas e ligadas
                  </p>
                  <button
                    onClick={() => {/* Mudar para modo manual */}}
                    className="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Manualmente
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePrinters.map((printer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => onAddDetected(printer)}
                    >
                      <div className="flex items-center space-x-3">
                        {printer.isNetwork ? (
                          <Wifi className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Usb className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {printer.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {printer.port} • {printer.type}
                            {printer.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Padrão
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Impressora
                </label>
                <input
                  type="text"
                  value={manualData.name}
                  onChange={(e) => setManualData({...manualData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Impressora Térmica EPSON"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modelo
                  </label>
                  <select
                    value={manualData.model}
                    onChange={(e) => setManualData({...manualData, model: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="generic">Genérico</option>
                    <option value="epson">EPSON</option>
                    <option value="bematech">Bematech</option>
                    <option value="elgin">Elgin</option>
                    <option value="daruma">Daruma</option>
                    <option value="sweda">Sweda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={manualData.type}
                    onChange={(e) => setManualData({...manualData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="thermal">Térmica</option>
                    <option value="laser">Laser</option>
                    <option value="inkjet">Jato de Tinta</option>
                    <option value="roll">Rolo</option>
                    <option value="a4">A4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Porta/Endereço
                  </label>
                  <input
                    type="text"
                    value={manualData.port}
                    onChange={(e) => setManualData({...manualData, port: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: USB001, COM3, 192.168.1.100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Baud Rate (opcional)
                  </label>
                  <input
                    type="number"
                    value={manualData.baudRate || ''}
                    onChange={(e) => setManualData({...manualData, baudRate: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNetwork"
                  checked={manualData.isNetwork}
                  onChange={(e) => setManualData({...manualData, isNetwork: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isNetwork" className="text-sm text-gray-700 dark:text-gray-300">
                  Impressora de rede
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Adicionar Impressora
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal de Gerenciamento de Usuários
function UserModal({ 
  user, 
  onSave, 
  onClose 
}: { 
  user: SystemUser | null;
  onSave: (userData: CreateUserData | UpdateUserData) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
    name: user?.name || '',
    email: user?.email || '',
    function: user?.function || 'cashier',
    password: '',
    permissions: {
      dashboard: user?.permissions.dashboard || false,
      pdv: user?.permissions.pdv || false,
      cashRegister: user?.permissions.cashRegister || false,
      customers: user?.permissions.customers || false,
      products: user?.permissions.products || false,
      appointments: user?.permissions.appointments || false,
      sales: user?.permissions.sales || false,
      reports: user?.permissions.reports || false,
      settings: user?.permissions.settings || false,
      userManagement: user?.permissions.userManagement || false,
      barbers: user?.permissions.barbers || false,
      services: user?.permissions.services || false,
      commissions: user?.permissions.commissions || false,
      loyalty: user?.permissions.loyalty || false,
      backup: user?.permissions.backup || false,
      canCreateUsers: user?.permissions.canCreateUsers || false,
      canEditUsers: user?.permissions.canEditUsers || false,
      canDeleteUsers: user?.permissions.canDeleteUsers || false,
      canViewReports: user?.permissions.canViewReports || false,
      canEditSettings: user?.permissions.canEditSettings || false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {user ? 'Editar Usuário' : 'Adicionar Usuário'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: João Silva"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: joao@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Função
            </label>
            <select
              value={formData.function}
              onChange={(e) => setFormData({...formData, function: e.target.value as SystemUser['function']})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="cashier">Caixa</option>
              <option value="barber">Barbeiro</option>
              <option value="manager">Gerente</option>
              <option value="salesperson">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha (deixe em branco para gerar automaticamente)
              </label>
              <input
                type="password"
                value={(formData as CreateUserData).password || ''}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deixe em branco para gerar automaticamente"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permissões
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {formData.permissions && (
                <>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.dashboard}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, dashboard: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dashboard</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.pdv}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, pdv: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">PDV</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.cashRegister}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, cashRegister: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Caixa</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.customers}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, customers: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Clientes</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.products}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, products: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Produtos</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.appointments}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, appointments: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Agendamentos</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.sales}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, sales: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Vendas</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, reports: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Relatórios</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.settings}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, settings: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Configurações</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.userManagement}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, userManagement: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Gerenciar Usuários</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.barbers}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, barbers: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Barbeiros</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.services}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, services: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Serviços</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.commissions}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, commissions: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Comissões</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.loyalty}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, loyalty: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Fidelidade</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.permissions.backup}
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions!, backup: e.target.checked}})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Backup</span>
                  </label>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {user ? 'Salvar Alterações' : 'Adicionar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 