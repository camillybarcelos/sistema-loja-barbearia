import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, CreditAccount, CreditTransaction } from '../types';
import { format } from 'date-fns';

export default function Customers() {
  const { 
    customers, 
    addCustomer, 
    updateCustomer,
    creditAccounts,
    creditTransactions,
    addCreditAccount,
    addCreditTransaction,
    getCustomerCreditAccount,
    getCustomerTransactions,
    updateCreditAccount,
    getCustomerTotalPurchases,
    getCustomerTotalCredit,
    getCustomerSales,
    addSale
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showCreditAccountModal, setShowCreditAccountModal] = useState(false);
  const [newCreditAccount, setNewCreditAccount] = useState({
    customerId: '',
    customerName: '',
    limit: 500
  });
  const [showEditCreditLimitModal, setShowEditCreditLimitModal] = useState(false);
  const [editingCreditLimit, setEditingCreditLimit] = useState({
    customerId: '',
    customerName: '',
    currentLimit: 0,
    newLimit: 0
  });
  const [showSalesHistoryModal, setShowSalesHistoryModal] = useState(false);
  const [selectedCustomerForSales, setSelectedCustomerForSales] = useState<Customer | null>(null);
  
  // Estados para o modal de pagamento de fiado
  const [showCreditPaymentModal, setShowCreditPaymentModal] = useState(false);
  const [creditPaymentAmount, setCreditPaymentAmount] = useState(0);
  const [creditPaymentMethod, setCreditPaymentMethod] = useState<'cash' | 'pix' | 'debit' | 'credit'>('cash');
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);

  // Filter customers
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const totalPurchases = customers.reduce((sum, c) => sum + getCustomerTotalPurchases(c.id), 0);
  const totalCredit = customers.reduce((sum, c) => sum + getCustomerTotalCredit(c.id), 0);
  const avgPurchases = totalCustomers > 0 ? totalPurchases / totalCustomers : 0;

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => {
    addCustomer(customerData);
    setShowAddModal(false);
  };

  const handleEditCustomer = (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
      setEditingCustomer(null);
    }
  };

  // Credit system functions
  const handleOpenCreditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCreditModal(true);
  };

  const handleOpenPaymentModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    const account = getCustomerCreditAccount(customer.id);
    if (account) {
      setPaymentAmount(account.totalDebt);
      setShowPaymentModal(true);
    }
  };

  const handleOpenCreditAccountModal = (customer: Customer) => {
    setNewCreditAccount({
      customerId: customer.id,
      customerName: customer.name,
      limit: 500
    });
    setShowCreditAccountModal(true);
  };

  const handleCreateCreditAccount = () => {
    addCreditAccount({
      ...newCreditAccount,
      totalDebt: 0,
      status: 'active'
    });
    setShowCreditAccountModal(false);
    setNewCreditAccount({ customerId: '', customerName: '', limit: 500 });
  };

  const handleOpenEditCreditLimitModal = (customer: Customer) => {
    const account = getCustomerCreditAccount(customer.id);
    if (account) {
      setEditingCreditLimit({
        customerId: customer.id,
        customerName: customer.name,
        currentLimit: account.limit,
        newLimit: account.limit
      });
      setShowEditCreditLimitModal(true);
    }
  };

  const handleSaveCreditLimit = () => {
    const account = getCustomerCreditAccount(editingCreditLimit.customerId);
    if (account && editingCreditLimit.newLimit >= 0) {
      updateCreditAccount(account.id, { limit: editingCreditLimit.newLimit });
      setShowEditCreditLimitModal(false);
      setEditingCreditLimit({
        customerId: '',
        customerName: '',
        currentLimit: 0,
        newLimit: 0
      });
    }
  };

  const handlePayment = () => {
    if (selectedCustomer && paymentAmount > 0) {
      const account = getCustomerCreditAccount(selectedCustomer.id);
      if (account) {
        addCreditTransaction({
          creditAccountId: account.id,
          customerId: selectedCustomer.id,
          type: 'payment',
          amount: paymentAmount,
          description: `Pagamento de R$ ${paymentAmount.toFixed(2)}`,
          status: 'paid',
          paidAt: new Date()
        });
        setShowPaymentModal(false);
        setPaymentAmount(0);
      }
    }
  };

  // Nova função para abrir modal de pagamento de fiado
  const handleOpenCreditPaymentModal = (customer: Customer) => {
    setSelectedCustomerForPayment(customer);
    const totalCredit = getCustomerTotalCredit(customer.id);
    setCreditPaymentAmount(totalCredit);
    setShowCreditPaymentModal(true);
  };

  // Nova função para processar pagamento de fiado
  const handleCreditPayment = () => {
    if (selectedCustomerForPayment && creditPaymentAmount > 0) {
      const account = getCustomerCreditAccount(selectedCustomerForPayment.id);
      if (account) {
        // Registrar a transação de crédito
        addCreditTransaction({
          creditAccountId: account.id,
          customerId: selectedCustomerForPayment.id,
          type: 'payment',
          amount: creditPaymentAmount,
          description: `Pagamento de fiado - R$ ${creditPaymentAmount.toFixed(2)} (${creditPaymentMethod})`,
          status: 'paid',
          paidAt: new Date()
        });

        // Registrar no caixa como venda do dia
        const currentSession = localStorage.getItem('currentCashSession');
        if (currentSession) {
          try {
            const session = JSON.parse(currentSession);
            if (session.status === 'open') {
              // Adicionar transação ao caixa como venda
              const transaction = {
                id: Date.now().toString(),
                type: 'deposit',
                amount: creditPaymentAmount,
                description: `Venda - Pagamento de fiado: ${selectedCustomerForPayment.name} (${creditPaymentMethod})`,
                operator: session.operator,
                createdAt: new Date()
              };

              const updatedSession = {
                ...session,
                transactions: [...session.transactions, transaction]
              };

              localStorage.setItem('currentCashSession', JSON.stringify(updatedSession));
            }
          } catch (error) {
            console.error('Erro ao registrar no caixa:', error);
          }
        }

        // Fechar modal e limpar estados
        setShowCreditPaymentModal(false);
        setCreditPaymentAmount(0);
        setCreditPaymentMethod('cash');
        setSelectedCustomerForPayment(null);

        // Mostrar mensagem de sucesso
        alert(`Pagamento de R$ ${creditPaymentAmount.toFixed(2)} registrado com sucesso!\nValor contabilizado no caixa como venda do dia.`);
      }
    }
  };

  const getCustomerDebt = (customerId: string) => {
    const account = getCustomerCreditAccount(customerId);
    console.log('getCustomerDebt:', { customerId, account, totalDebt: account?.totalDebt });
    return account ? account.totalDebt : 0;
  };

  const getCustomerTransactionsList = (customerId: string) => {
    return creditTransactions.filter(t => t.customerId === customerId);
  };

  const handleOpenSalesHistoryModal = (customer: Customer) => {
    setSelectedCustomerForSales(customer);
    setShowSalesHistoryModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clientes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie sua base de clientes
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total em Compras</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalPurchases.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes com Fiado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {customers.filter(c => c.hasCreditAccount).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total em Fiado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {totalCredit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total em Compras
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fiado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Última Visita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => {
                const hasCreditAccount = customer.hasCreditAccount;
                const totalCredit = getCustomerTotalCredit(customer.id);
                const isInDebt = hasCreditAccount && totalCredit > 0;
                
                return (
                  <tr key={customer.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isInDebt ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isInDebt ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {customer.name}
                            {isInDebt && <AlertTriangle className="inline h-4 w-4 ml-1 text-red-500" />}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div>Total em compras: R$ {getCustomerTotalPurchases(customer.id).toFixed(2)}</div>
                            <div>Total fiado: R$ {getCustomerTotalCredit(customer.id).toFixed(2)}</div>
                          </div>
                          {customer.cpf && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              CPF: {customer.cpf}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      R$ {getCustomerTotalPurchases(customer.id).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                        <div 
                          className={`text-sm font-medium cursor-pointer hover:underline ${getCustomerTotalCredit(customer.id) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                          onClick={() => {
                            if (getCustomerTotalCredit(customer.id) > 0) {
                              handleOpenCreditPaymentModal(customer);
                            }
                          }}
                          title={getCustomerTotalCredit(customer.id) > 0 ? "Clique para registrar pagamento" : ""}
                        >
                          R$ {getCustomerTotalCredit(customer.id).toFixed(2)}
                          </div>
                        {getCustomerTotalCredit(customer.id) > 0 && (
                            <div className="text-xs text-red-500 dark:text-red-400">
                              Em débito
                            </div>
                          )}
                        {getCustomerTotalCredit(customer.id) === 0 && hasCreditAccount && (
                          <div className="text-xs text-green-500 dark:text-green-400">
                            Em dia
                        </div>
                      )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {customer.lastVisit ? format(new Date(customer.lastVisit), 'dd/MM/yyyy') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {format(new Date(customer.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!hasCreditAccount ? (
                          <button
                            onClick={() => handleOpenCreditAccountModal(customer)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Criar conta fiado"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenCreditModal(customer)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Ver histórico"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditCreditLimitModal(customer)}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                              title="Editar limite de crédito"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                            {getCustomerTotalCredit(customer.id) > 0 && (
                              <>
                              <button
                                onClick={() => handleOpenPaymentModal(customer)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Receber pagamento"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                                <button
                                  onClick={() => handleOpenCreditPaymentModal(customer)}
                                  className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                                  title="Registrar pagamento de fiado"
                                >
                                  <DollarSign className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenSalesHistoryModal(customer)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Histórico de vendas"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Excluir cliente">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <CustomerModal
          onSave={handleAddCustomer}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingCustomer && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleEditCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}

      {showCreditModal && selectedCustomer && (
        <CreditHistoryModal
          customer={selectedCustomer}
          onClose={() => setShowCreditModal(false)}
        />
      )}

      {showSalesHistoryModal && selectedCustomerForSales && (
        <SalesHistoryModal
          customer={selectedCustomerForSales}
          onClose={() => setShowSalesHistoryModal(false)}
        />
      )}

      {/* Credit Account Modal */}
      {showCreditAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Criar Conta Fiado
              </h3>
              <button
                onClick={() => setShowCreditAccountModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={newCreditAccount.customerName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Limite de Crédito (R$)
                </label>
                <input
                  type="number"
                  value={newCreditAccount.limit}
                  onChange={(e) => setNewCreditAccount(prev => ({ ...prev, limit: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreditAccountModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCreditAccount}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receber Pagamento
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={selectedCustomer.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor do Pagamento (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Receber Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Credit Limit Modal */}
      {showEditCreditLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Editar Limite de Crédito
              </h3>
              <button
                onClick={() => setShowEditCreditLimitModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={editingCreditLimit.customerName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Limite Atual (R$)
                </label>
                <input
                  type="number"
                  value={editingCreditLimit.currentLimit}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Novo Limite (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingCreditLimit.newLimit}
                  onChange={(e) => setEditingCreditLimit(prev => ({ 
                    ...prev, 
                    newLimit: Number(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Digite o novo limite"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Dica:</strong> O limite de crédito define o valor máximo que o cliente pode comprar no fiado.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditCreditLimitModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCreditLimit}
                disabled={editingCreditLimit.newLimit < 0}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Salvar Limite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Payment Modal */}
      {showCreditPaymentModal && selectedCustomerForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receber Pagamento de Fiado
              </h3>
              <button
                onClick={() => setShowCreditPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={selectedCustomerForPayment.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Total em Fiado
                </label>
                <input
                  type="text"
                  value={`R$ ${getCustomerTotalCredit(selectedCustomerForPayment.id).toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor do Pagamento (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={getCustomerTotalCredit(selectedCustomerForPayment.id)}
                  value={creditPaymentAmount}
                  onChange={(e) => setCreditPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Digite o valor a pagar"
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => setCreditPaymentAmount(getCustomerTotalCredit(selectedCustomerForPayment.id))}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30"
                  >
                    Pagar Total
                  </button>
                  <button
                    onClick={() => setCreditPaymentAmount(getCustomerTotalCredit(selectedCustomerForPayment.id) / 2)}
                    className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/30"
                  >
                    Pagar Metade
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={creditPaymentMethod}
                  onChange={(e) => setCreditPaymentMethod(e.target.value as 'cash' | 'pix' | 'debit' | 'credit')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreditPaymentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreditPayment}
                disabled={creditPaymentAmount <= 0 || creditPaymentAmount > getCustomerTotalCredit(selectedCustomerForPayment.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Receber Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Customer Modal Component
function CustomerModal({ 
  customer, 
  onSave, 
  onClose 
}: { 
  customer?: Customer | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    cpf: customer?.cpf || '',
    address: customer?.address || '',
    birthDate: customer?.birthDate ? format(new Date(customer.birthDate), 'yyyy-MM-dd') : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined
    };
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endereço
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {customer ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Credit History Modal Component
function CreditHistoryModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { getCustomerCreditAccount, getCustomerTransactions } = useApp();
  
  const account = getCustomerCreditAccount(customer.id);
  const transactions = getCustomerTransactions(customer.id);

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Fiado - {customer.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
      </div>
        
        {account && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informações da Conta</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
                <span className="text-gray-600 dark:text-gray-400">Limite:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
            R$ {account.limit.toFixed(2)}
                </span>
        </div>
        <div>
                <span className="text-gray-600 dark:text-gray-400">Débito Atual:</span>
                <span className={`ml-2 font-medium ${account.totalDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            R$ {account.totalDebt.toFixed(2)}
                </span>
        </div>
        <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  account.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : account.status === 'blocked'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {account.status === 'active' ? 'Ativa' : account.status === 'blocked' ? 'Bloqueada' : 'Fechada'}
                </span>
        </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Criada em:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {format(new Date(account.createdAt), 'dd/MM/yyyy')}
                </span>
      </div>
        </div>
          </div>
        )}
        
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Histórico de Transações</h4>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'purchase' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {transaction.type === 'purchase' ? 'Compra' : 'Pagamento'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${
                    transaction.type === 'purchase' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                    }`}>
                    {transaction.type === 'purchase' ? '-' : '+'}R$ {transaction.amount.toFixed(2)}
                    </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Data: {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                  <div>Status: {transaction.status}</div>
                  {transaction.paidAt && (
                    <div>Pago em: {format(new Date(transaction.paidAt), 'dd/MM/yyyy HH:mm')}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma transação encontrada
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// Sales History Modal Component
function SalesHistoryModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { getCustomerSales } = useApp();
  
  const sales = getCustomerSales(customer.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Vendas - {customer.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {sales.length > 0 ? (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Venda #{sale.id.slice(-6)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sale.paymentMethod === 'credit' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {sale.paymentMethod === 'credit' ? 'Fiado' : 'Pago'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    R$ {sale.total.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Data: {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                  <div>Itens: {sale.items.length}</div>
                  {sale.notes && <div>Observações: {sale.notes}</div>}
                </div>
              </div>
            ))}
        </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma venda encontrada para este cliente
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}