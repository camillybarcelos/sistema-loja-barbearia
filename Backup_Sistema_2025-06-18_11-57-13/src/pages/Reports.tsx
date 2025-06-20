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
  Scissors
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { sales, products, services, barbers, customers, appointments } = useApp();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedBarber, setSelectedBarber] = useState('all');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Relatórios
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Análise detalhada do desempenho do negócio
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button 
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
          <button 
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar JSON
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
    </div>
  );
} 