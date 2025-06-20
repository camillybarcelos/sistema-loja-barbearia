import React, { useState } from 'react';
import { 
  Scissors, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Service } from '../types';

export default function Services() {
  const { services, addService, updateService, deleteService } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddService = (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    addService(serviceData);
    setShowAddModal(false);
  };

  const handleEditService = (serviceData: Partial<Service>) => {
    if (editingService) {
      updateService(editingService.id, serviceData);
      setEditingService(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Serviços
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie os serviços da barbearia
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Scissors className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Serviços</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0} min
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="haircut">Corte</option>
            <option value="beard">Barba</option>
            <option value="combo">Combo</option>
            <option value="other">Outros</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  service.category === 'haircut' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  service.category === 'beard' ? 'bg-green-100 dark:bg-green-900/20' :
                  service.category === 'combo' ? 'bg-purple-100 dark:bg-purple-900/20' :
                  'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Scissors className={`h-6 w-6 ${
                    service.category === 'haircut' ? 'text-blue-600 dark:text-blue-400' :
                    service.category === 'beard' ? 'text-green-600 dark:text-green-400' :
                    service.category === 'combo' ? 'text-purple-600 dark:text-purple-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {service.category === 'haircut' ? 'Corte' :
                     service.category === 'beard' ? 'Barba' :
                     service.category === 'combo' ? 'Combo' : 'Outros'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingService(service)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Preço:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  R$ {service.price.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Duração:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {service.duration} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingService) && (
        <ServiceModal
          service={editingService}
          onSave={editingService ? handleEditService : handleAddService}
          onClose={() => {
            setShowAddModal(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({ 
  service, 
  onSave, 
  onClose 
}: { 
  service?: Service | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    category: service?.category || 'haircut',
    description: service?.description || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setFormData({ ...formData, [name]: isNumber ? parseFloat(value) || 0 : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-0 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Serviço
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="haircut">Corte</option>
                <option value="beard">Barba</option>
                <option value="combo">Combo</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {service ? 'Atualizar Serviço' : 'Salvar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
