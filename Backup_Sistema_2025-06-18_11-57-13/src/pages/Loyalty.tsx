import React, { useState } from 'react';
import { 
  Star, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Gift,
  TrendingUp,
  Users,
  Award,
  Crown,
  Zap,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoyaltyProgram, CustomerLoyalty, LoyaltyTransaction } from '../types';

export default function Loyalty() {
  const { customers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);

  // Mock data for loyalty programs
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([
    {
      id: '1',
      name: 'Programa Básico',
      description: 'Programa de fidelidade básico',
      pointsPerReal: 1,
      pointsToDiscount: 100,
      discountPercentage: 5,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Programa Premium',
      description: 'Programa de fidelidade premium com mais benefícios',
      pointsPerReal: 2,
      pointsToDiscount: 200,
      discountPercentage: 10,
      isActive: true,
      createdAt: new Date(),
    }
  ]);

  // Mock data for customer loyalty
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyalty[]>([
    {
      id: '1',
      customerId: '1',
      totalPoints: 1500,
      usedPoints: 500,
      availablePoints: 1000,
      tier: 'gold',
      tierMultiplier: 1.5,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  // Mock data for loyalty transactions
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([
    {
      id: '1',
      customerId: '1',
      type: 'earned',
      points: 100,
      description: 'Compra realizada',
      saleId: '1',
      createdAt: new Date(),
    }
  ]);

  // Filter customers with loyalty data
  const customersWithLoyalty = customers.map(customer => {
    const loyalty = customerLoyalty.find(l => l.customerId === customer.id);
    return {
      ...customer,
      loyalty: loyalty || null
    };
  });

  const filteredCustomers = customersWithLoyalty.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'all' || customer.loyalty?.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Star className="h-4 w-4 text-orange-500" />;
      case 'silver': return <Star className="h-4 w-4 text-gray-400" />;
      case 'gold': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'Bronze';
      case 'silver': return 'Prata';
      case 'gold': return 'Ouro';
      case 'platinum': return 'Platina';
      default: return 'Sem Tier';
    }
  };

  const calculateTier = (totalPoints: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (totalPoints >= 10000) return 'platinum';
    if (totalPoints >= 5000) return 'gold';
    if (totalPoints >= 1000) return 'silver';
    return 'bronze';
  };

  const calculateTierMultiplier = (tier: string): number => {
    switch (tier) {
      case 'bronze': return 1.0;
      case 'silver': return 1.2;
      case 'gold': return 1.5;
      case 'platinum': return 2.0;
      default: return 1.0;
    }
  };

  const handleAddProgram = (programData: Omit<LoyaltyProgram, 'id' | 'createdAt'>) => {
    const newProgram: LoyaltyProgram = {
      ...programData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setLoyaltyPrograms(prev => [...prev, newProgram]);
    setShowAddProgram(false);
  };

  const handleEditProgram = (programData: Partial<LoyaltyProgram>) => {
    if (editingProgram) {
      setLoyaltyPrograms(prev => prev.map(program => 
        program.id === editingProgram.id ? { ...program, ...programData } : program
      ));
      setEditingProgram(null);
    }
  };

  const handleDeleteProgram = (id: string) => {
    setLoyaltyPrograms(prev => prev.filter(program => program.id !== id));
  };

  const handleAddPoints = (customerId: string, points: number, description: string) => {
    const existingLoyalty = customerLoyalty.find(l => l.customerId === customerId);
    
    if (existingLoyalty) {
      const newTotalPoints = existingLoyalty.totalPoints + points;
      const newTier = calculateTier(newTotalPoints);
      const newMultiplier = calculateTierMultiplier(newTier);
      
      // Update loyalty
      setCustomerLoyalty(prev => prev.map(l => 
        l.customerId === customerId 
          ? {
              ...l,
              totalPoints: newTotalPoints,
              availablePoints: l.availablePoints + points,
              tier: newTier,
              tierMultiplier: newMultiplier,
              lastActivity: new Date(),
              updatedAt: new Date(),
            }
          : l
      ));

      // Add transaction
      const newTransaction: LoyaltyTransaction = {
        id: Date.now().toString(),
        customerId,
        type: 'earned',
        points,
        description,
        createdAt: new Date(),
      };
      setLoyaltyTransactions(prev => [...prev, newTransaction]);
    } else {
      // Create new loyalty account
      const newLoyalty: CustomerLoyalty = {
        id: Date.now().toString(),
        customerId,
        totalPoints: points,
        usedPoints: 0,
        availablePoints: points,
        tier: 'bronze',
        tierMultiplier: 1.0,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCustomerLoyalty(prev => [...prev, newLoyalty]);

      // Add transaction
      const newTransaction: LoyaltyTransaction = {
        id: Date.now().toString(),
        customerId,
        type: 'earned',
        points,
        description,
        createdAt: new Date(),
      };
      setLoyaltyTransactions(prev => [...prev, newTransaction]);
    }
  };

  const handleRedeemPoints = (customerId: string, points: number, description: string) => {
    const existingLoyalty = customerLoyalty.find(l => l.customerId === customerId);
    
    if (existingLoyalty && existingLoyalty.availablePoints >= points) {
      // Update loyalty
      setCustomerLoyalty(prev => prev.map(l => 
        l.customerId === customerId 
          ? {
              ...l,
              usedPoints: l.usedPoints + points,
              availablePoints: l.availablePoints - points,
              lastActivity: new Date(),
              updatedAt: new Date(),
            }
          : l
      ));

      // Add transaction
      const newTransaction: LoyaltyTransaction = {
        id: Date.now().toString(),
        customerId,
        type: 'redeemed',
        points: -points,
        description,
        createdAt: new Date(),
      };
      setLoyaltyTransactions(prev => [...prev, newTransaction]);
    }
  };

  // Calculate stats
  const totalCustomers = customersWithLoyalty.length;
  const activeCustomers = customersWithLoyalty.filter(c => c.loyalty).length;
  const totalPoints = customerLoyalty.reduce((sum, l) => sum + l.totalPoints, 0);
  const redeemedPoints = customerLoyalty.reduce((sum, l) => sum + l.usedPoints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Programa de Fidelidade
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie o programa de fidelidade dos clientes
          </p>
        </div>
        <button 
          onClick={() => setShowAddProgram(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Programa
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
            <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Pontos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Gift className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pontos Resgatados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{redeemedPoints.toLocaleString()}</p>
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
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Prata</option>
            <option value="gold">Ouro</option>
            <option value="platinum">Platina</option>
          </select>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Clientes e Fidelidade
          </h3>
        </div>
        <div className="p-6">
          {filteredCustomers.length > 0 ? (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {customer.email || 'Sem email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {customer.loyalty ? (
                      <>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {getTierIcon(customer.loyalty.tier)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(customer.loyalty.tier)}`}>
                              {getTierName(customer.loyalty.tier)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {customer.loyalty.availablePoints} pts disponíveis
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.loyalty.totalPoints.toLocaleString()} pts total
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {customer.loyalty.usedPoints.toLocaleString()} pts usados
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sem programa de fidelidade
                        </p>
                        <button
                          onClick={() => handleAddPoints(customer.id, 100, 'Adesão ao programa')}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Adicionar ao programa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum cliente encontrado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Programas de Fidelidade
          </h3>
        </div>
        <div className="p-6">
          {loyaltyPrograms.length > 0 ? (
            <div className="space-y-4">
              {loyaltyPrograms.map((program) => (
                <div key={program.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {program.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {program.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {program.pointsPerReal} pts/R$
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {program.pointsToDiscount} pts = {program.discountPercentage}% desconto
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        program.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {program.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <button
                        onClick={() => setEditingProgram(program)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum programa de fidelidade criado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 