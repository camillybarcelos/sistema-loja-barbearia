import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Scissors
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { products, services, barbers, sales } = useApp();

  // Calculate stats
  const todaySales = sales.filter(sale => {
    const today = new Date().toDateString();
    return sale.createdAt.toDateString() === today;
  }).reduce((total, sale) => total + sale.total, 0);

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const activeBarbers = barbers.filter(barber => barber.isActive).length;
  const totalRevenue = sales.reduce((total, sale) => total + sale.total, 0);

  const stats = [
    {
      name: 'Vendas Hoje',
      value: `R$ ${todaySales.toFixed(2)}`,
      icon: DollarSign,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'green'
    },
    {
      name: 'Produtos',
      value: products.length.toString(),
      icon: Package,
      change: `${lowStockProducts.length} baixo estoque`,
      changeType: 'warning' as const,
      color: 'blue'
    },
    {
      name: 'Barbeiros Ativos',
      value: activeBarbers.toString(),
      icon: Users,
      change: `${barbers.length} total`,
      changeType: 'neutral' as const,
      color: 'purple'
    },
    {
      name: 'Receita Total',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      change: '+8%',
      changeType: 'positive' as const,
      color: 'green'
    }
  ];

  const recentSales = sales.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                stat.changeType === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vendas Recentes
            </h3>
          </div>
          <div className="p-6">
            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Venda #{sale.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sale.items.length} item(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        R$ {sale.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sale.paymentMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhuma venda encontrada
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estoque Baixo
            </h3>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600 dark:text-yellow-400">
                        {product.stock} un.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Min: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Todos os produtos com estoque adequado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
            <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Nova Venda</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
            <Package className="h-8 w-8 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Add Produto</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
            <Scissors className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Novo Serviço</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group">
            <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Agendamento</span>
          </button>
        </div>
      </div>
    </div>
  );
}