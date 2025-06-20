import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  User, 
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
  HardDrive
} from 'lucide-react';
import { BackupManager } from '../utils/backup';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [backupStats, setBackupStats] = useState({
    totalBackups: 0,
    latestBackup: null as string | null,
    totalSize: 0
  });
  const [settings, setSettings] = useState({
    businessName: 'Barbearia & Loja de Roupas',
    businessAddress: 'Rua das Flores, 123 - Centro',
    businessPhone: '(11) 99999-9999',
    businessEmail: 'contato@barbearia.com',
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

  useEffect(() => {
    // Load backup statistics
    const stats = BackupManager.getBackupStats();
    setBackupStats(stats);
  }, []);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
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
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'backup', name: 'Backup', icon: Database }
  ];

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
    </div>
  );
} 