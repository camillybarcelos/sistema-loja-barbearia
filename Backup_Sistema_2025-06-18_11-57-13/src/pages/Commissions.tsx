import React, { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function Commissions() {
  const { sales, services, barbers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Calculate commissions from sales
  const commissions = sales.flatMap(sale => 
    sale.items
      .filter(item => item.type === 'service' && item.barberId)
      .map(item => {
        const service = services.find(s => s.id === item.serviceId);
        const barber = barbers.find(b => b.id === item.barberId);
        const commissionAmount = (item.unitPrice * item.quantity * (service?.commission || 0)) / 100;
        
        return {
          id: `${sale.id}-${item.id}`,
          saleId: sale.id,
          barberId: item.barberId!,
          barberName: barber?.name || 'Barbeiro não encontrado',
          serviceId: item.serviceId!,
          serviceName: service?.name || 'Serviço não encontrado',
          amount: commissionAmount,
          percentage: service?.commission || 0,
          saleDate: sale.createdAt,
          status: sale.status === 'completed' ? 'pending' : 'cancelled',
          period: format(sale.createdAt, 'yyyy-MM')
        };
      })
  );

  // Filter commissions
  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBarber = selectedBarber === 'all' || commission.barberId === selectedBarber;
    
    const matchesPeriod = selectedPeriod === 'all' || (() => {
      const commissionDate = new Date(commission.saleDate);
      const today = new Date();
      
      switch (selectedPeriod) {
        case 'current-month':
          return commissionDate.getMonth() === today.getMonth() && 
                 commissionDate.getFullYear() === today.getFullYear();
        case 'last-month':
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
          return commissionDate.getMonth() === lastMonth.getMonth() && 
                 commissionDate.getFullYear() === lastMonth.getFullYear();
        case 'current-year':
          return commissionDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    })();
    
    const matchesStatus = selectedStatus === 'all' || commission.status === selectedStatus;
    
    return matchesSearch && matchesBarber && matchesPeriod && matchesStatus;
  });

  // Calculate stats
  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = filteredCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = filteredCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  const avgCommissionRate = filteredCommissions.length > 0 ? 
    filteredCommissions.reduce((sum, c) => sum + c.percentage, 0) / filteredCommissions.length : 0;

  // Group commissions by barber
  const commissionsByBarber = barbers.map(barber => {
    const barberCommissions = filteredCommissions.filter(c => c.barberId === barber.id);
    const total = barberCommissions.reduce((sum, c) => sum + c.amount, 0);
    const pending = barberCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
    
    return {
      barber,
      total,
      pending,
      count: barberCommissions.length
    };
  }).filter(item => item.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Comissões
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Controle de comissões dos barbeiros
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total em Comissões</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalCommissions.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {pendingCommissions.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {paidCommissions.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Média</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgCommissionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por barbeiro ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Períodos</option>
              <option value="current-month">Mês Atual</option>
              <option value="last-month">Mês Passado</option>
              <option value="current-year">Ano Atual</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commissions by Barber */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comissões por Barbeiro
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {commissionsByBarber.map(({ barber, total, pending, count }) => (
                <div key={barber.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-medium">
                        {barber.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {barber.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {count} serviço(s) • {barber.commissionRate}% taxa
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      R$ {total.toFixed(2)}
                    </p>
                    {pending > 0 && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        R$ {pending.toFixed(2)} pendente
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Commissions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comissões Recentes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredCommissions.slice(0, 10).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {commission.barberName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {commission.serviceName} • {commission.percentage}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(commission.saleDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      R$ {commission.amount.toFixed(2)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      commission.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {commission.status === 'pending' ? 'Pendente' : 'Pago'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Commissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalhamento de Comissões
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Barbeiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Comissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {commission.barberName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {commission.serviceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {commission.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    R$ {commission.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {format(new Date(commission.saleDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      commission.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {commission.status === 'pending' ? 'Pendente' : 'Pago'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}