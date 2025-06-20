import React, { useState, useRef } from 'react';
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
  Clock,
  FileText,
  Receipt,
  X,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CommissionExportFilters, 
  CommissionReceiptData, 
  CommissionPayment 
} from '../types';

export default function Commissions() {
  const { sales, services, barbers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Estados para as novas funcionalidades
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [exportFilters, setExportFilters] = useState<CommissionExportFilters>({
    startDate: new Date(),
    endDate: new Date(),
    barberId: undefined,
    status: 'all',
    format: 'pdf'
  });
  const [receiptData, setReceiptData] = useState<CommissionReceiptData>({
    barberName: '',
    totalAmount: 0,
    period: '',
    paymentDate: new Date(),
    observations: '',
    companyName: 'Barbearia & Loja de Roupas',
    companyLogo: undefined
  });
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Carregar pagamentos salvos
  React.useEffect(() => {
    const savedPayments = localStorage.getItem('commissionPayments');
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Salvar pagamentos
  const savePayments = (newPayments: CommissionPayment[]) => {
    setPayments(newPayments);
    localStorage.setItem('commissionPayments', JSON.stringify(newPayments));
  };

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

  // Verificar se comissão foi paga
  const isCommissionPaid = (barberId: string, startDate: Date, endDate: Date) => {
    return payments.some(payment => 
      payment.barberId === barberId && 
      payment.status === 'paid' &&
      payment.startDate <= startDate && 
      payment.endDate >= endDate
    );
  };

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

  // Função para exportar relatório
  const exportReport = () => {
    const filteredData = commissions.filter(commission => {
      const commissionDate = new Date(commission.saleDate);
      const matchesDate = commissionDate >= exportFilters.startDate && commissionDate <= exportFilters.endDate;
      const matchesBarber = !exportFilters.barberId || commission.barberId === exportFilters.barberId;
      const matchesStatus = exportFilters.status === 'all' || commission.status === exportFilters.status;
      
      return matchesDate && matchesBarber && matchesStatus;
    });

    const totalAmount = filteredData.reduce((sum, c) => sum + c.amount, 0);
    
    if (exportFilters.format === 'pdf') {
      // Simular exportação PDF
      const data = {
        filters: exportFilters,
        data: filteredData,
        totalAmount,
        generatedAt: new Date()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-comissoes-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Simular exportação Excel
      const csvData = [
        ['Barbeiro', 'Serviço', 'Taxa (%)', 'Comissão (R$)', 'Data', 'Status'],
        ...filteredData.map(c => [
          c.barberName,
          c.serviceName,
          c.percentage.toString(),
          c.amount.toFixed(2),
          format(new Date(c.saleDate), 'dd/MM/yyyy'),
          c.status === 'pending' ? 'Pendente' : 'Pago'
        ])
      ];
      
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-comissoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    setShowExportModal(false);
  };

  // Função para gerar recibo
  const generateReceipt = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar canvas
    canvas.width = 800;
    canvas.height = 600;
    
    // Limpar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configurar fonte
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    
    // Título
    ctx.font = 'bold 24px Arial';
    ctx.fillText('RECIBO DE COMISSÃO', canvas.width / 2, 50);
    
    // Linha separadora
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 70);
    ctx.lineTo(canvas.width - 100, 70);
    ctx.stroke();
    
    // Dados do recibo
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    const startY = 120;
    const lineHeight = 30;
    
    ctx.fillText(`Barbeiro: ${receiptData.barberName}`, 100, startY);
    ctx.fillText(`Período: ${receiptData.period}`, 100, startY + lineHeight);
    ctx.fillText(`Data do Pagamento: ${format(receiptData.paymentDate, 'dd/MM/yyyy')}`, 100, startY + lineHeight * 2);
    ctx.fillText(`Valor Total: R$ ${receiptData.totalAmount.toFixed(2)}`, 100, startY + lineHeight * 3);
    
    if (receiptData.observations) {
      ctx.fillText(`Observações: ${receiptData.observations}`, 100, startY + lineHeight * 4);
    }
    
    // Linha separadora
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, startY + lineHeight * 5 + 20);
    ctx.lineTo(canvas.width - 100, startY + lineHeight * 5 + 20);
    ctx.stroke();
    
    // Assinatura
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Assinatura do Responsável', canvas.width / 2, startY + lineHeight * 6 + 40);
    
    // Data e hora
    ctx.font = '12px Arial';
    ctx.fillText(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, canvas.width / 2, canvas.height - 30);
  };

  // Função para salvar recibo como imagem
  const saveReceiptAsImage = () => {
    if (!canvasRef.current) return;
    
    generateReceipt();
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-comissao-${receiptData.barberName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  // Função para marcar como pago
  const markAsPaid = (barberId: string, barberName: string) => {
    const startDate = startOfWeek(new Date(), { locale: ptBR });
    const endDate = endOfWeek(new Date(), { locale: ptBR });
    const period = `Semana de ${format(startDate, 'dd')} a ${format(endDate, 'dd')} de ${format(startDate, 'MMMM', { locale: ptBR })}`;
    
    const newPayment: CommissionPayment = {
      id: Date.now().toString(),
      barberId,
      barberName,
      period,
      startDate,
      endDate,
      amount: pendingCommissions,
      paymentDate: new Date(),
      status: 'paid',
      observations: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin'
    };
    
    savePayments([...payments, newPayment]);
    
    // Atualizar status das comissões
    const updatedCommissions = commissions.map(commission => {
      if (commission.barberId === barberId && 
          new Date(commission.saleDate) >= startDate && 
          new Date(commission.saleDate) <= endDate) {
        return { ...commission, status: 'paid' as const };
      }
      return commission;
    });
    
    // Aqui você atualizaria o contexto com as comissões atualizadas
    // Por enquanto, vamos apenas mostrar uma mensagem
    alert(`Comissão marcada como paga para ${barberName}`);
  };

  // Função para abrir modal de recibo
  const openReceiptModal = (barberId: string, barberName: string) => {
    const startDate = startOfWeek(new Date(), { locale: ptBR });
    const endDate = endOfWeek(new Date(), { locale: ptBR });
    const period = `Semana de ${format(startDate, 'dd')} a ${format(endDate, 'dd')} de ${format(startDate, 'MMMM', { locale: ptBR })}`;
    
    setReceiptData({
      barberName,
      totalAmount: pendingCommissions,
      period,
      paymentDate: new Date(),
      observations: '',
      companyName: 'Barbearia & Loja de Roupas',
      companyLogo: undefined
    });
    
    setShowReceiptModal(true);
  };

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
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </button>
          <button 
            onClick={() => openReceiptModal('', '')}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Gerar Recibo
          </button>
        </div>
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
                      <div className="flex flex-col items-end space-y-1">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          R$ {pending.toFixed(2)} pendente
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openReceiptModal(barber.id, barber.name)}
                            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            Recibo
                          </button>
                          <button
                            onClick={() => markAsPaid(barber.id, barber.name)}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            Marcar Pago
                          </button>
                        </div>
                      </div>
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

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exportar Relatório
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={format(exportFilters.startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setExportFilters({
                      ...exportFilters,
                      startDate: new Date(e.target.value)
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={format(exportFilters.endDate, 'yyyy-MM-dd')}
                    onChange={(e) => setExportFilters({
                      ...exportFilters,
                      endDate: new Date(e.target.value)
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barbeiro
                </label>
                <select
                  value={exportFilters.barberId || ''}
                  onChange={(e) => setExportFilters({
                    ...exportFilters,
                    barberId: e.target.value || undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os Barbeiros</option>
                  {barbers.map(barber => (
                    <option key={barber.id} value={barber.id}>{barber.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters({
                    ...exportFilters,
                    status: e.target.value as 'all' | 'pending' | 'paid'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="paid">Pagos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  value={exportFilters.format}
                  onChange={(e) => setExportFilters({
                    ...exportFilters,
                    format: e.target.value as 'pdf' | 'excel'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel (CSV)</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={exportReport}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Exportar
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recibo */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gerar Recibo de Comissão
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Barbeiro
                  </label>
                  <select
                    value={receiptData.barberName}
                    onChange={(e) => setReceiptData({
                      ...receiptData,
                      barberName: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione um barbeiro</option>
                    {barbers.map(barber => (
                      <option key={barber.id} value={barber.name}>{barber.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Total da Comissão
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={receiptData.totalAmount}
                    onChange={(e) => setReceiptData({
                      ...receiptData,
                      totalAmount: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                  </label>
                  <input
                    type="text"
                    value={receiptData.period}
                    onChange={(e) => setReceiptData({
                      ...receiptData,
                      period: e.target.value
                    })}
                    placeholder="Ex: Semana de 10 a 16 de junho"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data do Pagamento
                  </label>
                  <input
                    type="date"
                    value={format(receiptData.paymentDate, 'yyyy-MM-dd')}
                    onChange={(e) => setReceiptData({
                      ...receiptData,
                      paymentDate: new Date(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={receiptData.observations}
                    onChange={(e) => setReceiptData({
                      ...receiptData,
                      observations: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={generateReceipt}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Gerar Preview
                  </button>
                  <button
                    onClick={saveReceiptAsImage}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Salvar como Imagem
                  </button>
                </div>
              </div>
              
              {/* Preview */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview do Recibo
                </h4>
                <canvas
                  ref={canvasRef}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}