import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  FileText,
  DollarSign,
  Users,
  Package,
  Scissors,
  Upload,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExportOptions {
  type: 'sales' | 'credit' | 'appointments' | 'commissions';
  period: 'day' | 'week' | 'month';
  format: 'csv' | 'xlsx' | 'pdf';
}

export default function Reports() {
  const { sales, products, services, barbers, customers, appointments } = useApp();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'sales',
    period: 'day',
    format: 'csv'
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current-month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      case 'current-year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      default:
        return {
          start: new Date(0),
          end: now
        };
    }
  };

  const { start, end } = getDateRange();

  // Filter data by date range
  const filteredSales = sales.filter(sale => 
    sale.createdAt >= start && sale.createdAt <= end
  );

  const filteredAppointments = appointments.filter(appointment => 
    new Date(appointment.date) >= start && new Date(appointment.date) <= end
  );

  // Sales Report Data
  const salesData = filteredSales.map(sale => ({
    date: format(sale.createdAt, 'dd/MM'),
    amount: sale.total,
    items: sale.items.length
  }));

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Product Performance
  const productSales = products.map(product => {
    const productItems = filteredSales.flatMap(sale => 
      sale.items.filter(item => item.productId === product.id)
    );
    const totalQuantity = productItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = productItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    return {
      name: product.name,
      quantity: totalQuantity,
      revenue: totalRevenue,
      percentage: totalRevenue > 0 ? (totalRevenue / totalRevenue) * 100 : 0
    };
  }).filter(p => p.quantity > 0).sort((a, b) => b.revenue - a.revenue);

  // Service Performance
  const serviceSales = services.map(service => {
    const serviceItems = filteredSales.flatMap(sale => 
      sale.items.filter(item => item.serviceId === service.id)
    );
    const totalQuantity = serviceItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = serviceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    return {
      name: service.name,
      quantity: totalQuantity,
      revenue: totalRevenue,
      percentage: totalRevenue > 0 ? (totalRevenue / totalRevenue) * 100 : 0
    };
  }).filter(s => s.quantity > 0).sort((a, b) => b.revenue - a.revenue);

  // Barber Performance
  const barberPerformance = barbers.map(barber => {
    const barberSales = filteredSales.filter(sale => 
      sale.items.some(item => item.barberId === barber.id)
    );
    const totalRevenue = barberSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalServices = barberSales.flatMap(sale => 
      sale.items.filter(item => item.barberId === barber.id)
    ).length;
    
    return {
      name: barber.name,
      revenue: totalRevenue,
      services: totalServices,
      avgTicket: totalServices > 0 ? totalRevenue / totalServices : 0
    };
  }).filter(b => b.services > 0).sort((a, b) => b.revenue - a.revenue);

  // Payment Methods
  const paymentMethods = filteredSales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentMethods).map(([method, amount]) => ({
    name: method === 'cash' ? 'Dinheiro' : 
          method === 'card' ? 'Cartão' : 
          method === 'pix' ? 'PIX' : 
          method === 'credit' ? 'Fiado' : method,
    value: amount,
    percentage: (amount / totalRevenue) * 100
  }));

  // Colors for charts
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const exportReport = () => {
    const reportData = {
      period: selectedPeriod,
      dateRange: `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`,
      totalRevenue,
      totalSales,
      avgTicket,
      productSales: productSales.slice(0, 10),
      serviceSales: serviceSales.slice(0, 10),
      barberPerformance,
      paymentMethods: paymentData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    let csvContent = '';
    
    switch (selectedReport) {
      case 'sales':
        csvContent = 'Data,Valor,Itens\n';
        salesData.forEach(sale => {
          csvContent += `${sale.date},${sale.amount.toFixed(2)},${sale.items}\n`;
        });
        break;
      case 'products':
        csvContent = 'Produto,Quantidade,Receita\n';
        productSales.forEach(product => {
          csvContent += `${product.name},${product.quantity},${product.revenue.toFixed(2)}\n`;
        });
        break;
      case 'services':
        csvContent = 'Serviço,Quantidade,Receita\n';
        serviceSales.forEach(service => {
          csvContent += `${service.name},${service.quantity},${service.revenue.toFixed(2)}\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para exportar relatórios
  const handleExport = async () => {
    setIsProcessing(true);
    try {
      let data: any[] = [];
      let filename = '';

      switch (exportOptions.type) {
        case 'sales':
          data = getSalesData();
          filename = `vendas_${exportOptions.period}_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'credit':
          data = getCreditData();
          filename = `fiado_${exportOptions.period}_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'appointments':
          data = getAppointmentsData();
          filename = `agendamentos_${exportOptions.period}_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'commissions':
          data = getCommissionsData();
          filename = `comissoes_${exportOptions.period}_${new Date().toISOString().split('T')[0]}`;
          break;
      }

      if (exportOptions.format === 'csv') {
        exportToCSV(data, filename);
      } else if (exportOptions.format === 'xlsx') {
        exportToXLSX(data, filename);
      } else {
        exportToPDF(data, filename);
      }

      setMessage({ type: 'success', text: 'Relatório exportado com sucesso!' });
      setShowExportModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar relatório: ' + error });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para importar relatórios
  const handleImport = async () => {
    if (!importFile) {
      setMessage({ type: 'error', text: 'Selecione um arquivo para importar' });
      return;
    }

    setIsProcessing(true);
    try {
      const data = await readFile(importFile);
      // Aqui você implementaria a lógica para processar os dados importados
      setMessage({ type: 'success', text: 'Arquivo importado com sucesso!' });
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao importar arquivo: ' + error });
    } finally {
      setIsProcessing(false);
    }
  };

  // Funções para obter dados dos relatórios
  const getSalesData = () => {
    const filteredSales = filterSalesByPeriod(sales, exportOptions.period);
    return filteredSales.map(sale => ({
      'ID da Venda': sale.id,
      'Cliente': customers.find(c => c.id === sale.customerId)?.name || 'N/A',
      'Data': format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm'),
      'Total': sale.total,
      'Forma de Pagamento': sale.paymentMethod,
      'Status': sale.status,
      'Itens': sale.items.length
    }));
  };

  const getCreditData = () => {
    const creditSales = sales.filter(sale => sale.paymentMethod === 'credit');
    const filteredSales = filterSalesByPeriod(creditSales, exportOptions.period);
    return filteredSales.map(sale => ({
      'ID da Venda': sale.id,
      'Cliente': customers.find(c => c.id === sale.customerId)?.name || 'N/A',
      'Data': format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm'),
      'Valor Fiado': sale.total,
      'Status': sale.status
    }));
  };

  const getAppointmentsData = () => {
    const filteredAppointments = filterAppointmentsByPeriod(appointments, exportOptions.period);
    return filteredAppointments.map(appointment => ({
      'ID do Agendamento': appointment.id,
      'Cliente': customers.find(c => c.id === appointment.customerId)?.name || 'N/A',
      'Barbeiro': barbers.find(b => b.id === appointment.barberId)?.name || 'N/A',
      'Data': format(new Date(appointment.date), 'dd/MM/yyyy'),
      'Horário': appointment.startTime,
      'Status': appointment.status,
      'Serviços': appointment.serviceIds.length
    }));
  };

  const getCommissionsData = () => {
    const filteredSales = filterSalesByPeriod(sales, exportOptions.period);
    const commissionData: any[] = [];
    
    barbers.forEach(barber => {
      const barberSales = filteredSales.filter(sale => sale.barberId === barber.id);
      const totalSales = barberSales.reduce((sum, sale) => sum + sale.total, 0);
      const commission = totalSales * (barber.commissionRate / 100);
      
      commissionData.push({
        'Barbeiro': barber.name,
        'Total de Vendas': totalSales,
        'Taxa de Comissão': `${barber.commissionRate}%`,
        'Comissão': commission,
        'Vendas Realizadas': barberSales.length
      });
    });
    
    return commissionData;
  };

  // Funções auxiliares
  const filterSalesByPeriod = (salesList: any[], period: string) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let startDate: Date;
    switch (period) {
      case 'day':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = startOfWeek;
        break;
      case 'month':
        startDate = startOfMonth;
        break;
      default:
        startDate = startOfDay;
    }

    return salesList.filter(sale => new Date(sale.createdAt) >= startDate);
  };

  const filterAppointmentsByPeriod = (appointmentsList: any[], period: string) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let startDate: Date;
    switch (period) {
      case 'day':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = startOfWeek;
        break;
      case 'month':
        startDate = startOfMonth;
        break;
      default:
        startDate = startOfDay;
    }

    return appointmentsList.filter(appointment => new Date(appointment.date) >= startDate);
  };

  // Funções de exportação
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToXLSX = (data: any[], filename: string) => {
    // Implementação básica - em produção você usaria uma biblioteca como xlsx
    exportToCSV(data, filename.replace('.xlsx', ''));
  };

  const exportToPDF = (data: any[], filename: string) => {
    // Implementação básica - em produção você usaria uma biblioteca como jsPDF
    exportToCSV(data, filename.replace('.pdf', ''));
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index];
            });
            return row;
          });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Relatórios
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Análise detalhada do seu negócio
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Relatório
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">Vendas</option>
            <option value="products">Produtos</option>
            <option value="services">Serviços</option>
            <option value="barbers">Barbeiros</option>
            <option value="payments">Formas de Pagamento</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current-month">Mês Atual</option>
            <option value="last-month">Mês Passado</option>
            <option value="current-year">Ano Atual</option>
            <option value="all">Todos</option>
          </select>
          {selectedReport === 'barbers' && (
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Barbeiros</option>
              {barbers.map(barber => (
                <option key={barber.id} value={barber.id}>{barber.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {avgTicket.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        {selectedReport === 'sales' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vendas por Período
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Product Performance */}
        {selectedReport === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance dos Produtos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productSales.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Service Performance */}
        {selectedReport === 'services' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance dos Serviços
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Barber Performance */}
        {selectedReport === 'barbers' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance dos Barbeiros
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barberPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                <Legend />
                <Bar dataKey="revenue" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Methods */}
        {selectedReport === 'payments' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Formas de Pagamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dados Detalhados
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {selectedReport === 'sales' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Itens</th>
                    </>
                  )}
                  {selectedReport === 'products' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qtd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receita</th>
                    </>
                  )}
                  {selectedReport === 'services' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serviço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qtd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receita</th>
                    </>
                  )}
                  {selectedReport === 'barbers' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Barbeiro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serviços</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receita</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedReport === 'sales' && salesData.slice(0, 10).map((sale, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {sale.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.items}</td>
                  </tr>
                ))}
                {selectedReport === 'products' && productSales.slice(0, 10).map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {selectedReport === 'services' && serviceSales.map((service, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{service.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {service.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {selectedReport === 'barbers' && barberPerformance.map((barber, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{barber.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{barber.services}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {barber.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exportar Relatório
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={exportOptions.type}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="sales">Vendas</option>
                  <option value="credit">Fiado</option>
                  <option value="appointments">Agendamentos</option>
                  <option value="commissions">Comissões</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <select
                  value={exportOptions.period}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, period: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="day">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {isProcessing ? 'Exportando...' : 'Exportar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Importar Relatório
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar Arquivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Formatos aceitos: CSV</p>
                <p>O arquivo deve conter cabeçalhos na primeira linha.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={isProcessing || !importFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {isProcessing ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 