import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Filter,
  Download,
  Upload,
  Barcode,
  Printer,
  RefreshCw,
  X,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import BarcodeComponent from '../components/Barcode';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [showLabelsManager, setShowLabelsManager] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelFilter, setLabelFilter] = useState('');
  const [labelCategory, setLabelCategory] = useState<string>('all');
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    paperType: 'thermal',
    printerType: 'thermal',
    labelSize: 'small',
    labelWidth: 200,
    labelHeight: 80,
    fontSize: 10,
    barcodeHeight: 15,
    margin: 5
  });

  // Generate unique barcode
  const generateBarcode = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `789${timestamp.slice(-8)}${random}`;
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    addProduct(productData);
    setShowAddModal(false);
  };

  const handleEditProduct = (productData: Partial<Product>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    }
  };

  const handleGenerateBarcode = (product: Product) => {
    setSelectedProductForBarcode(product);
    setShowBarcodeModal(true);
  };

  const printBarcode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedProductForBarcode) {
      const { labelWidth, labelHeight, barcodeHeight } = printSettings;
      const labels = Array(labelQuantity).fill(0).map(() => `
        <div class="label">
          <div class="product-name">${selectedProductForBarcode.name}</div>
          <div class="product-info">${selectedProductForBarcode.brand} - ${selectedProductForBarcode.color || ''} ${selectedProductForBarcode.size || ''}</div>
          <div class="price">R$ ${selectedProductForBarcode.price.toFixed(2)}</div>
          <div class="barcode-container">
            <svg class="barcode-svg" width="${labelWidth - 20}" height="${barcodeHeight + 20}">
              <text x="${(labelWidth - 20) / 2}" y="15" text-anchor="middle" font-family="Arial" font-size="8" font-weight="bold">${selectedProductForBarcode.barcode}</text>
              <rect x="10" y="20" width="${labelWidth - 40}" height="${barcodeHeight}" fill="none" stroke="#000" stroke-width="0.5"/>
              <text x="${(labelWidth - 20) / 2}" y="${barcodeHeight + 35}" text-anchor="middle" font-family="Arial" font-size="6">${selectedProductForBarcode.barcode}</text>
            </svg>
          </div>
        </div>
      `).join('');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiquetas - ${selectedProductForBarcode.name}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${labels}
          <script>
            // Gerar códigos de barras reais após o carregamento
            window.onload = function() {
              const svgs = document.querySelectorAll('.barcode-svg');
              svgs.forEach(svg => {
                const barcodeText = svg.querySelector('text').textContent;
                JsBarcode(svg, barcodeText, {
                  format: 'CODE128',
                  width: 1.5,
                  height: ${barcodeHeight},
                  fontSize: 8,
                  margin: 5,
                  displayValue: false,
                  background: '#ffffff',
                  lineColor: '#000000',
                });
              });
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Labels management functions
  const filteredLabels = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(labelFilter.toLowerCase()) ||
                         product.barcode.includes(labelFilter) ||
                         product.brand.toLowerCase().includes(labelFilter.toLowerCase());
    const matchesCategory = labelCategory === 'all' || product.category === labelCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAllLabels = () => {
    if (selectedLabels.length === filteredLabels.length) {
      setSelectedLabels([]);
    } else {
      setSelectedLabels(filteredLabels.map(p => p.id));
    }
  };

  const handleSelectLabel = (productId: string) => {
    setSelectedLabels(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const printSelectedLabels = () => {
    if (selectedLabels.length === 0) return;

    const selectedProducts = products.filter(p => selectedLabels.includes(p.id));
    const printWindow = window.open('', '_blank');
    const { labelWidth, labelHeight, barcodeHeight } = printSettings;
    
    if (printWindow) {
      const labels = selectedProducts.map(product => `
        <div class="label">
          <div class="product-name">${product.name}</div>
          <div class="product-info">${product.brand} - ${product.color || ''} ${product.size || ''}</div>
          <div class="price">R$ ${product.price.toFixed(2)}</div>
          <div class="barcode-container">
            <svg class="barcode-svg" width="${labelWidth - 20}" height="${barcodeHeight + 20}" data-barcode="${product.barcode}">
              <text x="${(labelWidth - 20) / 2}" y="15" text-anchor="middle" font-family="Arial" font-size="8" font-weight="bold">${product.barcode}</text>
              <rect x="10" y="20" width="${labelWidth - 40}" height="${barcodeHeight}" fill="none" stroke="#000" stroke-width="0.5"/>
              <text x="${(labelWidth - 20) / 2}" y="${barcodeHeight + 35}" text-anchor="middle" font-family="Arial" font-size="6">${product.barcode}</text>
            </svg>
          </div>
        </div>
      `).join('');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiquetas - ${selectedLabels.length} Produtos</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${labels}
          <script>
            // Gerar códigos de barras reais após o carregamento
            window.onload = function() {
              const svgs = document.querySelectorAll('.barcode-svg');
              svgs.forEach(svg => {
                const barcodeText = svg.getAttribute('data-barcode');
                JsBarcode(svg, barcodeText, {
                  format: 'CODE128',
                  width: 1.5,
                  height: ${barcodeHeight},
                  fontSize: 8,
                  margin: 5,
                  displayValue: false,
                  background: '#ffffff',
                  lineColor: '#000000',
                });
              });
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Print settings management
  const updatePrintSettings = (newSettings: Partial<typeof printSettings>) => {
    setPrintSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Auto-adjust dimensions based on label size
      switch (updated.labelSize) {
        case 'small':
          updated.labelWidth = 200;
          updated.labelHeight = 80;
          updated.fontSize = 10;
          updated.barcodeHeight = 15;
          break;
        case 'medium':
          updated.labelWidth = 300;
          updated.labelHeight = 120;
          updated.fontSize = 12;
          updated.barcodeHeight = 20;
          break;
        case 'large':
          updated.labelWidth = 400;
          updated.labelHeight = 160;
          updated.fontSize = 14;
          updated.barcodeHeight = 25;
          break;
        case 'custom':
          // Keep custom values
          break;
      }
      
      return updated;
    });
  };

  const getPrintStyles = () => {
    const { labelWidth, labelHeight, fontSize, barcodeHeight, margin, paperType } = printSettings;
    
    return `
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: ${margin}px; 
        font-size: ${fontSize}px;
        ${paperType === 'thermal' ? 'background: white;' : 'background: #f5f5f5;'}
      }
      .label {
        width: ${labelWidth}px;
        height: ${labelHeight}px;
        border: ${paperType === 'thermal' ? 'none' : '1px solid #000'};
        padding: ${margin}px;
        margin: ${margin}px;
        display: inline-block;
        text-align: center;
        page-break-inside: avoid;
        background: white;
        box-sizing: border-box;
      }
      .product-name {
        font-weight: bold;
        font-size: ${fontSize}px;
        margin-bottom: 2px;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .product-info {
        font-size: ${fontSize - 2}px;
        margin-bottom: 2px;
        color: #666;
      }
      .price {
        font-weight: bold;
        font-size: ${fontSize + 2}px;
        color: #2563eb;
        margin-bottom: 2px;
      }
      .barcode-container {
        margin-top: 2px;
      }
      .barcode-svg {
        max-width: 100%;
        height: auto;
      }
      @media print {
        body { margin: 0; }
        .label { 
          page-break-inside: avoid; 
          break-inside: avoid;
        }
      }
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Produtos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie o estoque da sua loja
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button 
            onClick={() => setShowLabelsManager(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Barcode className="h-4 w-4 mr-2" />
            Gerenciar Etiquetas
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor do Estoque</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {products.reduce((total, p) => total + (p.cost * p.stock), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
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
                placeholder="Buscar produtos, código de barras, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="clothing">Roupas</option>
              <option value="accessory">Acessórios</option>
            </select>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Produto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Código de Barras</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Preço</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estoque</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {product.barcode}
                      </span>
                      <div className="w-24">
                        <BarcodeComponent 
                          value={product.barcode}
                          width={1}
                          height={20}
                          fontSize={6}
                          margin={2}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.category === 'clothing' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {product.category === 'clothing' ? 'Roupas' : 'Acessórios'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      R$ {product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Custo: R$ {product.cost.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900 dark:text-white">{product.stock}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Mín: {product.minStock}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock > product.minStock
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : product.stock === 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {product.stock > product.minStock ? 'Em Estoque' : product.stock === 0 ? 'Sem Estoque' : 'Estoque Baixo'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleGenerateBarcode(product)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Imprimir etiqueta"
                      >
                        <Barcode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Editar produto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir produto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onSave={editingProduct ? handleEditProduct : handleAddProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Barcode Modal */}
      {showBarcodeModal && selectedProductForBarcode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Imprimir Etiqueta
              </h3>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedProductForBarcode.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Marca:</strong> {selectedProductForBarcode.brand}</p>
                  <p><strong>Preço:</strong> R$ {selectedProductForBarcode.price.toFixed(2)}</p>
                  <p><strong>Código:</strong> {selectedProductForBarcode.barcode}</p>
                  {selectedProductForBarcode.color && (
                    <p><strong>Cor:</strong> {selectedProductForBarcode.color}</p>
                  )}
                  {selectedProductForBarcode.size && (
                    <p><strong>Tamanho:</strong> {selectedProductForBarcode.size}</p>
                  )}
                </div>
                
                {/* Preview do código de barras */}
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                    Prévia do código de barras:
                  </p>
                  <BarcodeComponent 
                    value={selectedProductForBarcode.barcode}
                    width={1.5}
                    height={30}
                    fontSize={10}
                    margin={5}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade de Etiquetas
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setLabelQuantity(Math.max(1, labelQuantity - 1))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-medium text-gray-900 dark:text-white">
                    {labelQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLabelQuantity(labelQuantity + 1)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Barcode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Etiqueta com código de barras legível por scanners
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={printBarcode}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir {labelQuantity} Etiqueta{labelQuantity > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Labels Manager Modal */}
      {showLabelsManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] mx-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gerenciador de Etiquetas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Selecione os produtos para imprimir etiquetas em lote
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPrintSettings(true)}
                  className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Configurações de impressão"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </button>
                <button
                  onClick={() => {
                    setShowLabelsManager(false);
                    setSelectedLabels([]);
                    setLabelFilter('');
                    setLabelCategory('all');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={labelFilter}
                      onChange={(e) => setLabelFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={labelCategory}
                    onChange={(e) => setLabelCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as Categorias</option>
                    <option value="clothing">Roupas</option>
                    <option value="accessory">Acessórios</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAllLabels}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {selectedLabels.length === filteredLabels.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLabels.length} de {filteredLabels.length} selecionados
                  </span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              {filteredLabels.length === 0 ? (
                <div className="text-center py-12">
                  <Barcode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tente ajustar os filtros ou adicione produtos primeiro.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLabels.map((product) => (
                    <div
                      key={product.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedLabels.includes(product.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleSelectLabel(product.id)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedLabels.includes(product.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedLabels.includes(product.id) && (
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {product.brand}
                        </p>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <p><strong>Preço:</strong> R$ {product.price.toFixed(2)}</p>
                          <p><strong>Código:</strong> {product.barcode}</p>
                          {product.color && (
                            <p><strong>Cor:</strong> {product.color}</p>
                          )}
                          {product.size && (
                            <p><strong>Tamanho:</strong> {product.size}</p>
                          )}
                          <p><strong>Estoque:</strong> {product.stock} un</p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductForBarcode(product);
                            setShowBarcodeModal(true);
                            setShowLabelsManager(false);
                          }}
                          className="w-full px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Imprimir Individual
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{selectedLabels.length}</span> produtos selecionados para impressão
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowLabelsManager(false);
                      setSelectedLabels([]);
                      setLabelFilter('');
                      setLabelCategory('all');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={printSelectedLabels}
                    disabled={selectedLabels.length === 0}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir {selectedLabels.length} Etiqueta{selectedLabels.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Settings Modal */}
      {showPrintSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configurações de Impressão
              </h3>
              <button
                onClick={() => setShowPrintSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Tipo de Papel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de Papel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => updatePrintSettings({ paperType: 'thermal' })}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      printSettings.paperType === 'thermal'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Térmico</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Ideal para impressoras térmicas, sem bordas
                    </div>
                  </button>
                  <button
                    onClick={() => updatePrintSettings({ paperType: 'normal' })}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      printSettings.paperType === 'normal'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Normal</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Papel comum com bordas para corte manual
                    </div>
                  </button>
                </div>
              </div>

              {/* Tipo de Impressora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de Impressora
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => updatePrintSettings({ printerType: 'thermal' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.printerType === 'thermal'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Térmica</div>
                  </button>
                  <button
                    onClick={() => updatePrintSettings({ printerType: 'laser' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.printerType === 'laser'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Laser</div>
                  </button>
                  <button
                    onClick={() => updatePrintSettings({ printerType: 'inkjet' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.printerType === 'inkjet'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Jato de Tinta</div>
                  </button>
                </div>
              </div>

              {/* Tamanho da Etiqueta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tamanho da Etiqueta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => updatePrintSettings({ labelSize: 'small' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.labelSize === 'small'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Pequena</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">200x80px</div>
                  </button>
                  <button
                    onClick={() => updatePrintSettings({ labelSize: 'medium' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.labelSize === 'medium'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Média</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">300x120px</div>
                  </button>
                  <button
                    onClick={() => updatePrintSettings({ labelSize: 'large' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.labelSize === 'large'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Grande</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">400x160px</div>
                  </button>
                  <button
                    onClick={() => updatePrintSettings({ labelSize: 'custom' })}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      printSettings.labelSize === 'custom'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Personalizado</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Definir manualmente</div>
                  </button>
                </div>
              </div>

              {/* Configurações Personalizadas */}
              {printSettings.labelSize === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Largura (px)
                    </label>
                    <input
                      type="number"
                      value={printSettings.labelWidth}
                      onChange={(e) => updatePrintSettings({ labelWidth: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Altura (px)
                    </label>
                    <input
                      type="number"
                      value={printSettings.labelHeight}
                      onChange={(e) => updatePrintSettings({ labelHeight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tamanho da Fonte
                    </label>
                    <input
                      type="number"
                      value={printSettings.fontSize}
                      onChange={(e) => updatePrintSettings({ fontSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Altura do Código de Barras
                    </label>
                    <input
                      type="number"
                      value={printSettings.barcodeHeight}
                      onChange={(e) => updatePrintSettings({ barcodeHeight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Margem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Margem (px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={printSettings.margin}
                  onChange={(e) => updatePrintSettings({ margin: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>0px</span>
                  <span>{printSettings.margin}px</span>
                  <span>20px</span>
                </div>
              </div>

              {/* Prévia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Prévia da Etiqueta
                </label>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div 
                    className="bg-white border border-gray-300 mx-auto text-center"
                    style={{
                      width: `${printSettings.labelWidth}px`,
                      height: `${printSettings.labelHeight}px`,
                      padding: `${printSettings.margin}px`,
                      fontSize: `${printSettings.fontSize}px`
                    }}
                  >
                    <div className="font-bold mb-1">Nome do Produto</div>
                    <div className="text-sm text-gray-600 mb-1">Marca - Cor Tamanho</div>
                    <div className="font-bold text-blue-600 mb-1">R$ 99,99</div>
                    <div className="text-xs text-gray-500">Código de Barras</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPrintSettings(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowPrintSettings(false);
                  setShowLabelsManager(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Aplicar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Product Modal Component
function ProductModal({ 
  product, 
  onSave, 
  onClose 
}: { 
  product?: Product | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    category: product?.category || 'clothing',
    price: product?.price || 0,
    cost: product?.cost || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 5,
    brand: product?.brand || '',
    size: product?.size || '',
    color: product?.color || '',
    description: product?.description || ''
  });

  // Generate unique barcode
  const generateBarcode = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `789${timestamp.slice(-8)}${random}`;
  };

  const handleGenerateBarcode = () => {
    setFormData({...formData, barcode: generateBarcode()});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Produto
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código de Barras
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="7891234567890"
                />
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-1"
                  title="Gerar código de barras automaticamente"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Gerar</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Clique em "Gerar" para criar um código único automaticamente
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as 'clothing' | 'accessory'})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="clothing">Roupas</option>
                <option value="accessory">Acessórios</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marca
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preço de Venda
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preço de Custo
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estoque Atual
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tamanho
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cor
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {product ? 'Atualizar' : 'Criar'} Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}