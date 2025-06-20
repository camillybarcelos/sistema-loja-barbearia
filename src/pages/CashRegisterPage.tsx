import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Minus, 
  DollarSign, 
  Calendar,
  Clock,
  User,
  Receipt,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Eye,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

interface CashTransaction {
  id: string;
  type: 'opening' | 'closing' | 'withdrawal' | 'voucher' | 'deposit';
  amount: number;
  description: string;
  operator: string;
  createdAt: Date;
  notes?: string;
}

interface CashSession {
  id: string;
  openingAmount: number;
  closingAmount?: number;
  openingTime: Date;
  closingTime?: Date;
  operator: string;
  status: 'open' | 'closed';
  transactions: CashTransaction[];
}

export default function CashRegisterPage() {
  const { sales, services, products, customers, appointments } = useApp();
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [openingAmount, setOpeningAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [withdrawalDescription, setWithdrawalDescription] = useState('');
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [voucherDescription, setVoucherDescription] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositDescription, setDepositDescription] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string | null>(null);

  // Carregar histórico ao iniciar
  useEffect(() => {
    const savedSessions = localStorage.getItem('cashSessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      parsed.forEach((session: any) => {
        session.openingTime = new Date(session.openingTime);
        if (session.closingTime) session.closingTime = new Date(session.closingTime);
        session.transactions = session.transactions.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) }));
      });
      setCashSessions(parsed);
    }
    // Restaurar sessão atual
    const savedSession = localStorage.getItem('currentCashSession');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      parsed.openingTime = new Date(parsed.openingTime);
      if (parsed.closingTime) parsed.closingTime = new Date(parsed.closingTime);
      parsed.transactions = parsed.transactions.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) }));
      setCurrentSession(parsed);
    }
  }, []);

  // Salvar sempre que cashSessions mudar
  useEffect(() => {
    localStorage.setItem('cashSessions', JSON.stringify(cashSessions));
  }, [cashSessions]);

  // Função para calcular saldo por forma de pagamento
  const getBalanceByPaymentMethod = () => {
    if (!currentSession) return { cash: 0, card: 0, pix: 0, total: 0 };

    // Filtrar vendas do dia atual
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString();
    });

    // Calcular valores por forma de pagamento usando os valores específicos armazenados
    let cashTotal = currentSession.openingAmount; // Incluir valor de abertura no dinheiro
    let cardTotal = 0;
    let pixTotal = 0;

    todaySales.forEach(sale => {
      // Usar os valores específicos por forma de pagamento se disponíveis
      if (sale.cashAmount) {
        cashTotal += sale.cashAmount;
      }
      if (sale.cardAmount) {
        cardTotal += sale.cardAmount;
      }
      if (sale.pixAmount) {
        pixTotal += sale.pixAmount;
      }
      
      // Para vendas antigas que não têm os valores específicos, usar a lógica de fallback
      if (!sale.cashAmount && !sale.cardAmount && !sale.pixAmount) {
        // Vendas 100% no fiado não entram no caixa
        if (sale.paymentMethod === 'credit') {
          return;
        }
        
        // Vendas mistas: apenas a parte paga entra no caixa (assumindo 50%)
        if (sale.paymentMethod === 'mixed') {
          const paidAmount = sale.total * 0.5;
          // Assumindo que vendas mistas são divididas igualmente entre cash e card
          cashTotal += paidAmount * 0.5;
          cardTotal += paidAmount * 0.5;
          return;
        }
        
        // Vendas pagas: valor total entra no caixa
        switch (sale.paymentMethod) {
          case 'cash':
            cashTotal += sale.total;
            break;
          case 'card':
            cardTotal += sale.total;
            break;
          case 'pix':
            pixTotal += sale.total;
            break;
        }
      }
    });

    // Adicionar pagamentos de fiado do dia (que são registrados como depósitos)
    const todayDeposits = currentSession.transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const today = new Date();
        return t.type === 'deposit' && 
               transactionDate.toDateString() === today.toDateString() &&
               t.description.includes('Pagamento de fiado');
      });

    todayDeposits.forEach(deposit => {
      // Extrair forma de pagamento da descrição
      const description = deposit.description.toLowerCase();
      if (description.includes('dinheiro') || description.includes('cash')) {
        cashTotal += deposit.amount;
      } else if (description.includes('pix')) {
        pixTotal += deposit.amount;
      } else if (description.includes('débito') || description.includes('crédito') || description.includes('card')) {
        cardTotal += deposit.amount;
      }
    });

    // Descontar retiradas e vales do saldo em dinheiro
    const todayWithdrawals = currentSession.transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const today = new Date();
        return (t.type === 'withdrawal' || t.type === 'voucher') && 
               transactionDate.toDateString() === today.toDateString();
      });

    todayWithdrawals.forEach(transaction => {
      // Retiradas e vales são sempre descontados do dinheiro
      cashTotal -= transaction.amount;
    });

    const total = cashTotal + cardTotal + pixTotal;

    return { cash: cashTotal, card: cardTotal, pix: pixTotal, total };
  };

  // Atualizar cashSessions ao abrir caixa
  const handleOpenCash = () => {
    if (openingAmount >= 0 && operatorName.trim()) {
      const newSession: CashSession = {
        id: Date.now().toString(),
        openingAmount,
        openingTime: new Date(),
        operator: operatorName,
        status: 'open',
        transactions: [{
          id: Date.now().toString(),
          type: 'opening',
          amount: openingAmount,
          description: 'Abertura de caixa',
          operator: operatorName,
          createdAt: new Date()
        }]
      };
      setCashSessions(prev => {
        // Fecha qualquer sessão aberta antes de abrir nova
        const updated = prev.map(s =>
          s.status === 'open' ? { ...s, status: 'closed' as 'closed', closingTime: new Date(), closingAmount: s.openingAmount } : s
        );
        const allSessions = [...updated, newSession];
        localStorage.setItem('cashSessions', JSON.stringify(allSessions));
        return allSessions;
      });
      setCurrentSession(newSession);
      localStorage.setItem('currentCashSession', JSON.stringify(newSession));
      setShowOpenModal(false);
      setOpeningAmount(0);
      setOperatorName('');
    }
  };

  // Atualizar cashSessions ao fechar caixa
  const handleCloseCash = () => {
    if (currentSession) {
      const closingAmount = getBalanceByPaymentMethod().total;
      const updatedSession: CashSession = {
        ...currentSession,
        closingAmount,
        closingTime: new Date(),
        status: 'closed',
        transactions: [
          ...currentSession.transactions,
          {
            id: Date.now().toString(),
            type: 'closing',
            amount: closingAmount,
            description: 'Fechamento de caixa',
            operator: currentSession.operator,
            createdAt: new Date()
          }
        ]
      };
      setCashSessions(prev => {
        const allSessions = prev.map(s => s.id === currentSession.id ? updatedSession : s);
        localStorage.setItem('cashSessions', JSON.stringify(allSessions));
        return allSessions;
      });
      setCurrentSession(null);
      localStorage.removeItem('currentCashSession');
      setShowCloseModal(false);
    }
  };

  // Atualizar cashSessions ao registrar movimentações (retirada, vale, depósito)
  const updateSessionTransaction = (transaction: CashTransaction) => {
    if (currentSession) {
      const updatedSession: CashSession = {
        ...currentSession,
        transactions: [...currentSession.transactions, transaction]
      };
      setCurrentSession(updatedSession);
      setCashSessions(prev => {
        const allSessions = prev.map(s => s.id === updatedSession.id ? updatedSession : s);
        localStorage.setItem('cashSessions', JSON.stringify(allSessions));
        return allSessions;
      });
      localStorage.setItem('currentCashSession', JSON.stringify(updatedSession));
    }
  };

  // Exemplo de uso nas funções de movimentação:
  const handleWithdrawal = () => {
    if (withdrawalAmount > 0 && withdrawalDescription.trim() && currentSession) {
      const transaction: CashTransaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: withdrawalAmount,
        description: withdrawalDescription,
        operator: currentSession.operator,
        createdAt: new Date()
      };
      updateSessionTransaction(transaction);
      setShowWithdrawalModal(false);
      setWithdrawalAmount(0);
      setWithdrawalDescription('');
    }
  };

  const handleVoucher = () => {
    if (voucherAmount > 0 && voucherDescription.trim() && currentSession) {
      const transaction: CashTransaction = {
        id: Date.now().toString(),
        type: 'voucher',
        amount: voucherAmount,
        description: voucherDescription,
        operator: currentSession.operator,
        createdAt: new Date()
      };
      updateSessionTransaction(transaction);
      setShowVoucherModal(false);
      setVoucherAmount(0);
      setVoucherDescription('');
    }
  };

  const handleDeposit = () => {
    if (depositAmount > 0 && depositDescription.trim() && currentSession) {
      const transaction: CashTransaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: depositAmount,
        description: depositDescription,
        operator: currentSession.operator,
        createdAt: new Date()
      };
      updateSessionTransaction(transaction);
      setShowDepositModal(false);
      setDepositAmount(0);
      setDepositDescription('');
    }
  };

  // Função para registrar pagamento de fiado no caixa
  // Esta função deve ser chamada quando um cliente pagar um fiado
  // Exemplo de uso: handleCreditPayment("João Silva", 50.00, "pix")
  const handleCreditPayment = (customerName: string, amount: number, paymentMethod: string) => {
    if (currentSession) {
      const transaction: CashTransaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: amount,
        description: `Pagamento de fiado - ${customerName} (${paymentMethod})`,
        operator: currentSession.operator,
        createdAt: new Date()
      };

      const updatedSession: CashSession = {
        ...currentSession,
        transactions: [...currentSession.transactions, transaction]
      };

      setCashSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
    }
  };

  const getTransactionIcon = (type: CashTransaction['type']) => {
    switch (type) {
      case 'opening': return <Plus className="h-4 w-4 text-green-600" />;
      case 'closing': return <Minus className="h-4 w-4 text-red-600" />;
      case 'withdrawal': return <Minus className="h-4 w-4 text-red-600" />;
      case 'voucher': return <Receipt className="h-4 w-4 text-orange-600" />;
      case 'deposit': return <Plus className="h-4 w-4 text-green-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: CashTransaction['type']) => {
    switch (type) {
      case 'opening':
      case 'deposit':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'closing':
      case 'withdrawal':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'voucher':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const balanceByMethod = getBalanceByPaymentMethod();

  // Função para abrir modal de detalhes
  const handleShowSessionDetails = (session: CashSession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  // Função para fechar modal de detalhes
  const handleCloseSessionDetails = () => {
    setShowSessionDetails(false);
    setSelectedSession(null);
  };

  // Exibir sessões ordenadas (mais recentes primeiro)
  const orderedSessions = [...cashSessions].sort((a, b) => b.openingTime.getTime() - a.openingTime.getTime());

  // Função para calcular totais por forma de pagamento para uma sessão
  const getSessionTotals = (session: CashSession) => {
    let cash = session.openingAmount;
    let card = 0;
    let pix = 0;
    let credit = 0;
    let total = 0;
    // Vendas da sessão
    const sessionSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= session.openingTime && (!session.closingTime || saleDate <= session.closingTime);
    });
    sessionSales.forEach(sale => {
      if (sale.cashAmount) cash += sale.cashAmount;
      if (sale.cardAmount) card += sale.cardAmount;
      if (sale.pixAmount) pix += sale.pixAmount;
      if (sale.creditAmount) credit += sale.creditAmount;
      if (!sale.cashAmount && !sale.cardAmount && !sale.pixAmount && !sale.creditAmount) {
        switch (sale.paymentMethod) {
          case 'cash': cash += sale.total; break;
          case 'card': card += sale.total; break;
          case 'pix': pix += sale.total; break;
          case 'credit': credit += sale.total; break;
        }
      }
    });
    // Depositos e retiradas
    session.transactions.forEach(t => {
      if (t.type === 'deposit') cash += t.amount;
      if (t.type === 'withdrawal' || t.type === 'voucher') cash -= t.amount;
    });
    total = cash + card + pix + credit;
    return { cash, card, pix, credit, total, sessionSales };
  };

  // Se houver erro, mostrar mensagem amigável
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar dados do caixa
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Caixa</h1>
          <p className="text-gray-600 dark:text-gray-400">Controle de abertura, fechamento e movimentações do caixa</p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => setShowFullHistory(true)}
        >
          <History className="h-5 w-5 mr-2" />
          Histórico Completo
        </button>
      </div>

      {/* Current Session Status */}
      {currentSession ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Header com informações da sessão */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Caixa Aberto
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Operador: {currentSession.operator} | 
                  Aberto em: {format(currentSession.openingTime, 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo por Forma de Pagamento */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Saldo por Forma de Pagamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl">💵</div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dinheiro</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {balanceByMethod.cash.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl">💳</div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cartão</div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    R$ {balanceByMethod.card.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl">⚡</div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">PIX</div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    R$ {balanceByMethod.pix.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📊</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Saldo Total Atual</div>
                </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {balanceByMethod.total.toFixed(2)}
              </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="flex items-center justify-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Minus className="h-5 w-5 text-red-600" />
              <span className="text-red-700 dark:text-red-300 font-medium">Retirada</span>
            </button>
            <button
              onClick={() => setShowVoucherModal(true)}
              className="flex items-center justify-center space-x-2 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Receipt className="h-5 w-5 text-orange-600" />
              <span className="text-orange-700 dark:text-orange-300 font-medium">Vale</span>
            </button>
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Plus className="h-5 w-5 text-green-600" />
              <span className="text-green-700 dark:text-green-300 font-medium">Depósito</span>
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Fechar Caixa</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Movimentações Recentes</h4>
            <div className="space-y-3">
              {currentSession.transactions.slice(-5).reverse().map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${getTransactionColor(transaction.type)}`}
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {format(transaction.createdAt, 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      R$ {transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.operator}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Caixa Fechado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não há uma sessão de caixa aberta. Abra o caixa para começar a trabalhar.
          </p>
          <button
            onClick={() => setShowOpenModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Abrir Caixa
          </button>
        </div>
      )}

      {/* Session History */}
      {cashSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Sessões</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Abertura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fechamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orderedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {format(session.openingTime, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      R$ {session.openingAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.closingAmount !== undefined ? `R$ ${session.closingAmount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'open' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {session.status === 'open' ? 'Aberto' : 'Fechado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleShowSessionDetails(session)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Cash Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Abrir Caixa
              </h3>
              <button
                onClick={() => setShowOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor de Abertura (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Operador
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleOpenCash}
                disabled={openingAmount < 0 || !operatorName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Cash Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fechar Caixa
              </h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Atual</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {balanceByMethod.total.toFixed(2)}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Confirma o fechamento do caixa com o saldo atual?
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseCash}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Fechar Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Retirada de Caixa
              </h3>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={withdrawalDescription}
                  onChange={(e) => setWithdrawalDescription(e.target.value)}
                  placeholder="Motivo da retirada"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={withdrawalAmount <= 0 || !withdrawalDescription.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Confirmar Retirada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registrar Vale
              </h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={voucherDescription}
                  onChange={(e) => setVoucherDescription(e.target.value)}
                  placeholder="Motivo do vale"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleVoucher}
                disabled={voucherAmount <= 0 || !voucherDescription.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Registrar Vale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Depósito no Caixa
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                  placeholder="Motivo do depósito"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeposit}
                disabled={depositAmount <= 0 || !depositDescription.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Confirmar Depósito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Sessão */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalhes da Sessão do Caixa
              </h3>
              <button
                onClick={handleCloseSessionDetails}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Dados Gerais */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Informações Gerais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Data de Abertura:</span> {format(selectedSession.openingTime, 'dd/MM/yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium">Data de Fechamento:</span> {selectedSession.closingTime ? format(selectedSession.closingTime, 'dd/MM/yyyy HH:mm') : '-'}
                </div>
                <div>
                  <span className="font-medium">Operador:</span> {selectedSession.operator}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedSession.status === 'open' ? 'Aberto' : 'Fechado'}
                </div>
                <div>
                  <span className="font-medium">Saldo Inicial:</span> R$ {selectedSession.openingAmount.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Saldo Final:</span> {selectedSession.closingAmount !== undefined ? `R$ ${selectedSession.closingAmount.toFixed(2)}` : '-'}
                </div>
              </div>
            </div>
            {/* Movimentações */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Movimentações</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Data/Hora</th>
                      <th className="px-2 py-1 text-left">Tipo</th>
                      <th className="px-2 py-1 text-left">Descrição</th>
                      <th className="px-2 py-1 text-right">Valor</th>
                      <th className="px-2 py-1 text-left">Operador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSession.transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="px-2 py-1">{format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="px-2 py-1">{t.type}</td>
                        <td className="px-2 py-1">{t.description}</td>
                        <td className="px-2 py-1 text-right">R$ {t.amount.toFixed(2)}</td>
                        <td className="px-2 py-1">{t.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Totais por Forma de Pagamento */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Totais por Forma de Pagamento</h4>
              {/* Aqui você pode calcular os totais usando as vendas relacionadas à sessão */}
              {/* Exemplo simplificado: */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><span className="font-medium">Dinheiro:</span> R$ {/* calcular total em dinheiro */}</div>
                <div><span className="font-medium">Cartão:</span> R$ {/* calcular total em cartão */}</div>
                <div><span className="font-medium">Pix:</span> R$ {/* calcular total em pix */}</div>
              </div>
            </div>
            {/* Outras seções: vendas, serviços, produtos, agendamentos, observações, etc. */}
            {/* Você pode adicionar mais detalhes conforme necessário */}
          </div>
        </div>
      )}

      {/* Modal de Histórico Completo */}
      {showFullHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Histórico Completo do Caixa
              </h3>
              <button
                onClick={() => setShowFullHistory(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Lista de sessões */}
              <div className="md:w-1/3 w-full max-h-[60vh] overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Sessões</h4>
                <ul className="space-y-2">
                  {orderedSessions.length === 0 && (
                    <li className="text-center text-gray-500">Nenhuma sessão encontrada.</li>
                  )}
                  {orderedSessions.map((session, idx) => (
                    <li
                      key={session.id}
                      className={`p-3 rounded-lg cursor-pointer border ${selectedHistorySessionId === session.id ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400' : 'bg-gray-50 dark:bg-gray-700 border-transparent'} hover:bg-blue-50 dark:hover:bg-blue-800 transition`}
                      onClick={() => setSelectedHistorySessionId(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {format(session.openingTime, 'dd/MM/yyyy')}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {session.status === 'open' ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Operador: {session.operator}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Abertura: R$ {session.openingAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Fechamento: {session.closingAmount !== undefined ? `R$ ${session.closingAmount.toFixed(2)}` : '-'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Detalhes da sessão selecionada */}
              <div className="md:w-2/3 w-full">
                {(() => {
                  const session = orderedSessions.find(s => s.id === selectedHistorySessionId) || orderedSessions[0];
                  if (!session) {
                    return <div className="text-gray-500 text-center mt-10">Selecione uma sessão para ver os detalhes.</div>;
                  }
                  const totals = getSessionTotals(session);
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {format(session.openingTime, 'dd/MM/yyyy HH:mm')} ({session.status === 'open' ? 'Aberto' : 'Fechado'})
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Operador: {session.operator}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div><span className="font-medium">Abertura:</span> R$ {session.openingAmount.toFixed(2)}</div>
                        <div><span className="font-medium">Fechamento:</span> {session.closingAmount !== undefined ? `R$ ${session.closingAmount.toFixed(2)}` : '-'}</div>
                        <div><span className="font-medium">Data Fechamento:</span> {session.closingTime ? format(session.closingTime, 'dd/MM/yyyy HH:mm') : '-'}</div>
                        <div><span className="font-medium">Status:</span> {session.status === 'open' ? 'Aberto' : 'Fechado'}</div>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Totais por Forma de Pagamento:</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                          <div>Dinheiro: <span className="font-semibold">R$ {totals.cash.toFixed(2)}</span></div>
                          <div>Cartão: <span className="font-semibold">R$ {totals.card.toFixed(2)}</span></div>
                          <div>Pix: <span className="font-semibold">R$ {totals.pix.toFixed(2)}</span></div>
                          <div>Fiado: <span className="font-semibold">R$ {totals.credit.toFixed(2)}</span></div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Movimentações:</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs mt-1">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left">Data/Hora</th>
                                <th className="px-2 py-1 text-left">Tipo</th>
                                <th className="px-2 py-1 text-left">Descrição</th>
                                <th className="px-2 py-1 text-right">Valor</th>
                                <th className="px-2 py-1 text-left">Operador</th>
                              </tr>
                            </thead>
                            <tbody>
                              {session.transactions.map((t) => (
                                <tr key={t.id}>
                                  <td className="px-2 py-1">{format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                  <td className="px-2 py-1">{t.type}</td>
                                  <td className="px-2 py-1">{t.description}</td>
                                  <td className="px-2 py-1 text-right">R$ {t.amount.toFixed(2)}</td>
                                  <td className="px-2 py-1">{t.operator}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Vendas da Sessão:</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs mt-1">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left">Data/Hora</th>
                                <th className="px-2 py-1 text-left">Cliente</th>
                                <th className="px-2 py-1 text-left">Produtos</th>
                                <th className="px-2 py-1 text-left">Serviços</th>
                                <th className="px-2 py-1 text-right">Total</th>
                                <th className="px-2 py-1 text-left">Forma Pgto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {totals.sessionSales.map((sale) => (
                                <tr key={sale.id}>
                                  <td className="px-2 py-1">{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                  <td className="px-2 py-1">{typeof sale['customerName'] === 'string' && sale['customerName'].length > 0 ? sale['customerName'] : '-'}</td>
                                  <td className="px-2 py-1">{sale.items.filter(i => i.type === 'product').map(i => `${i.quantity}x ${products.find(p => p.id === i.productId)?.name || ''}`).join(', ') || '-'}</td>
                                  <td className="px-2 py-1">{sale.items.filter(i => i.type === 'service').map(i => services.find(s => s.id === i.serviceId)?.name || '').join(', ') || '-'}</td>
                                  <td className="px-2 py-1 text-right">R$ {sale.total.toFixed(2)}</td>
                                  <td className="px-2 py-1">{sale.paymentMethod}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 