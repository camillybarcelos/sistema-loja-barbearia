import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  Star,
  UserCheck,
  UserX
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Barber } from '../types';

export default function Barbers() {
  const { barbers, addBarber, updateBarber, deleteBarber } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);

  // Filter barbers
  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBarbers = barbers.filter(b => b.isActive).length;
  const avgCommission = barbers.length > 0 ? 
    barbers.reduce((sum, b) => sum + b.commissionRate, 0) / barbers.length : 0;

  const handleAddBarber = (barberData: Omit<Barber, 'id' | 'createdAt'>) => {
    addBarber(barberData);
    setShowAddModal(false);
  };

  const handleEditBarber = (barberData: Partial<Barber>) => {
    if (editingBarber) {
      updateBarber(editingBarber.id, barberData);
      setEditingBarber(null);
    }
  };

  const toggleBarberStatus = (barberId: string, currentStatus: boolean) => {
    updateBarber(barberId, { isActive: !currentStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Barbeiros
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie a equipe de barbeiros
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Barbeiro
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Barbeiros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{barbers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeBarbers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{barbers.length - activeBarbers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comissão Média</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgCommission.toFixed(0)}%</p>
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
            placeholder="Buscar barbeiros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBarbers.map((barber) => (
          <div key={barber.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-medium text-lg">
                    {barber.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {barber.name}
                  </h3>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      barber.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {barber.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingBarber(barber)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleBarberStatus(barber.id, barber.isActive)}
                  className={`${barber.isActive ? 'text-red-600 hover:text-red-900 dark:text-red-400' : 'text-green-600 hover:text-green-900 dark:text-green-400'}`}
                >
                  {barber.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => deleteBarber(barber.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {barber.email}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                {barber.phone}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Comissão:</span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {barber.commissionRate}%
                </span>
              </div>
              
              {barber.specialties && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                      <span
                        className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full"
                      >
                        {barber.specialties}
                      </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Barber Modal */}
      {(showAddModal || editingBarber) && (
        <BarberModal
          barber={editingBarber}
          onSave={editingBarber ? handleEditBarber : handleAddBarber}
          onClose={() => {
            setShowAddModal(false);
            setEditingBarber(null);
          }}
        />
      )}
    </div>
  );
}

// Barber Modal Component
function BarberModal({ 
  barber, 
  onSave, 
  onClose 
}: { 
  barber?: Barber | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: barber?.name || '',
    email: barber?.email || '',
    phone: barber?.phone || '',
    commissionRate: barber?.commissionRate || 40,
    specialties: barber?.specialties || '',
    isActive: barber?.isActive ?? true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      commissionRate: Number(formData.commissionRate),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {barber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              name="name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comissão (%)
              </label>
              <input
                type="number"
                id="commissionRate"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
                min="0"
                max="100"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Especialidades (separadas por vírgula)
              </label>
              <input
                type="text"
                id="specialties"
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Barbeiro Ativo
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {barber ? 'Atualizar' : 'Criar'} Barbeiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}