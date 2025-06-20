import React, { useState } from 'react';
import { 
  CashRegister as CashRegisterIcon, 
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
  Eye
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
  const { sales } = useApp();
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  
  const [openingAmount, setOpeningAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [withdrawalDescription, setWithdrawalDescription] = useState('');
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [voucherDescription, setVoucherDescription] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositDescription, setDepositDescription] = useState('');
  const [operatorName, setOperatorName] = useState('');

  // Calculate current cash balance
  const getCurrentBalance = () => {
    if (!currentSession) return 0;
    
    const totalSales = sales
      .filter(sale => {
        const isToday = new Date(sale.createdAt).toDateString() === new Date().toDateString();
        const isCash = sale.paymentMethod === 'cash' || sale.paymentMethod === 'mixed';
        return isToday && isCash;
      })
      .reduce((sum, sale) => {
        if (sale.paymentMethod === 'cash') return sum + sale.total;
        if (sale.paymentMethod === 'mixed') {
          return sum + (sale.total * 0.5);
        }
        return sum;
      }, 0);

    const totalWithdrawals = currentSession.transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalVouchers = currentSession.transactions
      .filter(t => t.type === 'voucher')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDeposits = currentSession.transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    return currentSession.openingAmount + totalSales + totalDeposits - totalWithdrawals - totalVouchers;
  };

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

      setCashSessions(prev => [...prev, newSession]);
      setCurrentSession(newSession);
      setShowOpenModal(false);
      setOpeningAmount(0);
      setOperatorName('');
    }
  };

  const handleCloseCash = () => {
    if (currentSession) {
      const closingAmount = getCurrentBalance();
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

      setCashSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(null);
      setShowCloseModal(false);
    }
  };

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

      const updatedSession: CashSession = {
        ...currentSession,
        transactions: [...currentSession.transactions, transaction]
      };

      setCashSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
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

      const updatedSession: CashSession = {
        ...currentSession,
        transactions: [...currentSession.transactions, transaction]
      };

      setCashSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
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

      const updatedSession: CashSession = {
        ...currentSession,
        transactions: [...currentSession.transactions, transaction]
      };

      setCashSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
      setShowDepositModal(false);
      setDepositAmount(0);
      setDepositDescription('');
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

  const currentBalance = getCurrentBalance();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Caixa</h1>
          <p className="text-gray-600 dark:text-gray-400">Controle de abertura, fechamento e movimentações do caixa</p>
        </div>
      </div>

      {/* Current Session Status */}
      {currentSession ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Caixa Aberto</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Operador: {currentSession.operator} | 
                  Aberto em: {format(currentSession.openingTime, 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {currentBalance.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Saldo Atual</div>
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
          <CashRegisterIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                {cashSessions.map((session) => (
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
                      {session.closingAmount ? `R$ ${session.closingAmount.toFixed(2)}` : '-'}
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
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
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
                  R$ {currentBalance.toFixed(2)}
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
    </div>
  );
} 