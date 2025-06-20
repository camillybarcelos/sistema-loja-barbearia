import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Scan,
  DollarSign,
  CreditCard,
  QrCode,
  Percent,
  Calculator,
  AlertCircle,
  CheckCircle,
  X,
  UserPlus,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Service, Customer, Barber, Sale, SaleItem } from '../types';

interface CartItem extends SaleItem {
  type: 'product' | 'service';
  name: string;
  price: number;
}

interface PaymentMethod {
  type: 'cash' | 'card' | 'pix' | 'credit';
  amount: number;
}

export default function POS() {
  const { products, services, barbers, customers, addSale, addCustomer, addCreditAccount, addCreditTransaction, getCustomerCreditAccount, creditAccounts, creditTransactions } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'products' | 'services'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'cash', amount: 0 }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Filter items based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
  const remaining = total - totalPaid;
  const cashPayment = paymentMethods.find(m => m.type === 'cash')?.amount || 0;
  // Troco automático: se o pagamento em dinheiro for maior que o total, calcula o troco
  const change = cashPayment > total ? cashPayment - total : 0;
  const creditPayment = paymentMethods.find(m => m.type === 'credit')?.amount || 0;

  // Add to cart
  const addToCart = (item: any, type: 'product' | 'service') => {
    const existingItem = cart.find(cartItem => 
      cartItem.type === type && 
      (type === 'product' ? cartItem.productId === item.id : cartItem.serviceId === item.id)
    );

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        type,
        productId: type === 'product' ? item.id : undefined,
        serviceId: type === 'service' ? item.id : undefined,
        quantity: 1,
        unitPrice: item.price,
        discount: 0,
        barberId: type === 'service' ? selectedBarber : undefined,
        name: item.name,
        price: item.price
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  // Update quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer('');
    setSelectedBarber('');
    setDiscount(0);
    setPaymentMethods([{ type: 'cash', amount: 0 }]);
  };

  // Set credit payment to total
  const setCreditToTotal = () => {
    const currentTotal = subtotal - (subtotal * discount / 100);
    setPaymentMethods(prev => {
      const withoutCredit = prev.filter(m => m.type !== 'credit');
      return [...withoutCredit, { type: 'credit', amount: currentTotal }];
    });
  };

  const handleAddCustomer = () => {
    if (newCustomer.name.trim()) {
      const customerData = {
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim(),
        address: newCustomer.address.trim()
      };
      
      // Add customer using the context function and get the ID
      const newCustomerId = addCustomer(customerData);
      
      // Create credit account immediately
      addCreditAccount({
        customerId: newCustomerId,
        customerName: customerData.name,
        limit: 500,
        totalDebt: 0,
        status: 'active'
      });
      
      // Limpar formulário
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      
      // Fechar modal
      setShowCustomerModal(false);
      
      // Selecionar o cliente recém-criado
      setSelectedCustomer(newCustomerId);
      
      console.log('Cliente criado com ID:', newCustomerId);
      console.log('Conta fiado criada automaticamente');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomer();
    }
  };

  // Process sale
  const processSale = async () => {
    console.log('Iniciando processamento da venda...');
    
    // Validações básicas
    if (cart.length === 0) {
      alert('Adicione itens ao carrinho antes de finalizar a venda.');
      return;
    }
    
    const creditPayment = paymentMethods.find(m => m.type === 'credit')?.amount || 0;
    console.log('Valor em fiado:', creditPayment);
    
    if (remaining > 0) {
      alert('Valor incompleto! Complete o pagamento para finalizar a venda.');
      return;
    }
    
    if (cart.some(item => item.type === 'service') && !selectedBarber) {
      alert('Selecione um barbeiro para os serviços!');
      return;
    }
    
    if (creditPayment > 0 && !selectedCustomer) {
      alert('Selecione ou cadastre um cliente para finalizar no fiado.');
      return;
    }

    setIsProcessing(true);
    console.log('Processando venda...');

    try {
      // 1. Criar a venda primeiro
      const saleData: Omit<Sale, 'id' | 'createdAt'> = {
        customerId: selectedCustomer || undefined,
        items: cart.map(item => ({
          id: item.id,
          type: item.type,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          barberId: item.barberId
        })),
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod: creditPayment > 0 ? 'credit' : (paymentMethods.length > 1 ? 'mixed' : paymentMethods[0]?.type || 'cash'),
        status: 'completed',
        barberId: selectedBarber || undefined,
        cashierId: '1',
        completedAt: new Date()
      };

      console.log('Dados da venda:', saleData);
      addSale(saleData);
      console.log('Venda criada com sucesso');

      // 2. Processar fiado se necessário
      if (creditPayment > 0 && selectedCustomer) {
        console.log('Processando fiado para cliente:', selectedCustomer);
        
        // Verificar se o cliente já tem conta fiado
        let account = getCustomerCreditAccount(selectedCustomer);
        console.log('Conta existente:', account);
        
        if (!account) {
          console.log('Criando nova conta fiado');
          const customer = customers.find(c => c.id === selectedCustomer);
          const customerName = customer?.name || 'Cliente';
          
          addCreditAccount({
            customerId: selectedCustomer,
            customerName: customerName,
            limit: 500,
            totalDebt: 0,
            status: 'active'
          });
          
          // Aguardar um pouco para a conta ser criada
          await new Promise(resolve => setTimeout(resolve, 100));
          account = getCustomerCreditAccount(selectedCustomer);
          console.log('Nova conta criada:', account);
        }
        
        if (account) {
          console.log('Criando transação de débito');
          addCreditTransaction({
            creditAccountId: account.id,
            customerId: selectedCustomer,
            type: 'purchase',
            amount: creditPayment,
            description: `Compra no fiado (PDV) - R$ ${creditPayment.toFixed(2)}`,
            status: 'pending',
          });
          console.log('Transação de fiado criada com sucesso');
        } else {
          throw new Error('Não foi possível obter/criar conta fiado');
        }
      }

      // 3. Finalizar
      clearCart();
      setIsProcessing(false);
      
      const successMessage = `Venda concluída! Total: R$ ${total.toFixed(2)}${change > 0 ? ` | Troco: R$ ${change.toFixed(2)}` : ''}${creditPayment > 0 ? ` | Fiado: R$ ${creditPayment.toFixed(2)}` : ''}`;
      alert(successMessage);
      console.log('Venda finalizada com sucesso');
      
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      alert(`Erro ao processar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6">
      {/* Left Panel - Products/Services */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ponto de Venda
            </h2>
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar ou escanear código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Scan className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab('products')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'products'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Produtos ({filteredProducts.length})
            </button>
            <button
              onClick={() => setSelectedTab('services')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'services'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Serviços ({filteredServices.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 h-[calc(100%-140px)] overflow-y-auto">
          {/* Cart Items List */}
          {cart.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Itens Adicionados ({cart.length})
              </h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          R$ {item.unitPrice.toFixed(2)} {item.type === 'service' ? '(serviço)' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        R$ {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products/Services Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedTab === 'products' ? 'Produtos Disponíveis' : 'Serviços Disponíveis'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selectedTab === 'products' ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product, 'product')}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {product.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Est: {product.stock}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {product.brand} - {product.color}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => addToCart(service, 'service')}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {service.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {service.duration} min
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 capitalize">
                      {service.category}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        R$ {service.price.toFixed(2)}
                      </span>
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Finalizar Venda
            </h3>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {cart.length} item(s)
              </span>
            </div>
          </div>
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-6 space-y-4">
            {/* Customer Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cliente (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Adicionar Cliente</span>
                </button>
              </div>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Barber Selection (if services in cart) */}
            {cart.some(item => item.type === 'service') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barbeiro
                </label>
                <select
                  value={selectedBarber}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um barbeiro</option>
                  {barbers.filter(barber => barber.isActive).map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Desconto (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formas de Pagamento
              </label>
              
              <div className="space-y-3">
                {/* Dinheiro */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Dinheiro</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor do pagamento"
                      value={paymentMethods.find(m => m.type === 'cash')?.amount || ''}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        setPaymentMethods(prev => prev.map(method => 
                          method.type === 'cash' ? { ...method, amount } : method
                        ));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Cartão */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Cartão</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={paymentMethods.find(m => m.type === 'card')?.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      const existingCard = paymentMethods.find(m => m.type === 'card');
                      if (existingCard) {
                        setPaymentMethods(prev => prev.map(method => 
                          method.type === 'card' ? { ...method, amount } : method
                        ));
                      } else {
                        setPaymentMethods(prev => [...prev, { type: 'card', amount }]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PIX */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">PIX</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={paymentMethods.find(m => m.type === 'pix')?.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      const existingPix = paymentMethods.find(m => m.type === 'pix');
                      if (existingPix) {
                        setPaymentMethods(prev => prev.map(method => 
                          method.type === 'pix' ? { ...method, amount } : method
                        ));
                      } else {
                        setPaymentMethods(prev => [...prev, { type: 'pix', amount }]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Fiado */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Fiado</span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor"
                      value={paymentMethods.find(m => m.type === 'credit')?.amount || ''}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        const existingCredit = paymentMethods.find(m => m.type === 'credit');
                        if (existingCredit) {
                          setPaymentMethods(prev => prev.map(method => 
                            method.type === 'credit' ? { ...method, amount } : method
                          ));
                        } else {
                          setPaymentMethods(prev => [...prev, { type: 'credit', amount }]);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={setCreditToTotal}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
                      title="Usar valor total"
                    >
                      Total
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Desconto:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -R$ {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600 dark:text-green-400">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pago:</span>
                <span className="font-medium">R$ {totalPaid.toFixed(2)}</span>
              </div>
              
              {change > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Troco:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    R$ {change.toFixed(2)}
                  </span>
                </div>
              )}
              
              {remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400">Restante:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    R$ {remaining.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Validation Message */}
            {remaining > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Valor incompleto! Complete o pagamento.
                </span>
              </div>
            )}

            {remaining === 0 && totalPaid > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Pagamento completo!
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={processSale}
                disabled={isProcessing || remaining > 0 || (cart.some(item => item.type === 'service') && !selectedBarber) || (creditPayment > 0 && !selectedCustomer)}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Finalizar Venda
                  </>
                )}
              </button>
            </div>

            {creditPayment > 0 && !selectedCustomer && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Selecione ou cadastre um cliente para finalizar no fiado.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Adicionar Cliente
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Endereço completo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Adicionar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}