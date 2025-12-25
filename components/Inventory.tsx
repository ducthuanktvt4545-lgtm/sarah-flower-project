
import React, { useState, useMemo } from 'react';
import { Product, RecipeItem } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckSquare, 
  X, 
  Package, 
  MoreHorizontal,
  Save,
  ScrollText,
  AlertOctagon,
  Download
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (ids: string[]) => void;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  initialData?: Product | null;
  allProducts: Product[]; // Needed for recipe selection
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSubmit, initialData, allProducts }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Product>>(
    initialData || {
      name: '',
      type: 'FLOWER',
      price: 0,
      stock: 0,
      unit: '',
      imageUrl: 'https://images.unsplash.com/photo-1596073419667-9d77d59f033f?auto=format&fit=crop&w=300&q=80',
      recipe: []
    }
  );

  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(initialData?.recipe || []);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || `SP-${Date.now()}`,
      recipe: recipeItems
    } as Product);
    onClose();
  };

  const addIngredient = () => {
    if (!newIngredientId) return;
    const product = allProducts.find(p => p.id === newIngredientId);
    if (product) {
        // Check if exists
        if (recipeItems.some(i => i.materialId === product.id)) {
            alert('Nguyên liệu này đã có trong danh sách');
            return;
        }
        setRecipeItems([...recipeItems, {
            materialId: product.id,
            materialName: product.name,
            quantity: newIngredientQty,
            unit: product.unit
        }]);
        setNewIngredientId('');
        setNewIngredientQty(1);
    }
  };

  const removeIngredient = (id: string) => {
      setRecipeItems(recipeItems.filter(i => i.materialId !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">
            {initialData ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input 
              required
              type="text" 
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ví dụ: Hoa Hồng Đỏ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
              <select 
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as 'FLOWER' | 'ACCESSORY'})}
              >
                <option value="FLOWER">Hoa tươi</option>
                <option value="ACCESSORY">Phụ kiện</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
              <input 
                required
                type="text" 
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                placeholder="cành, bó, mét..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh</label>
            <input 
              type="text" 
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>

          {/* RECIPE SECTION */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <div className="flex items-center gap-2 mb-3 text-blue-800 font-medium">
                <ScrollText size={18} />
                <span>Công thức / Thành phần bó hoa</span>
             </div>
             <p className="text-xs text-gray-500 mb-3">Định nghĩa nguyên liệu để thợ cắm hoa biết cần chuẩn bị gì cho 1 đơn vị sản phẩm này.</p>
             
             <div className="flex gap-2 mb-3">
                <select 
                    className="flex-1 border border-gray-200 rounded-lg px-2 text-sm outline-none"
                    value={newIngredientId}
                    onChange={(e) => setNewIngredientId(e.target.value)}
                >
                    <option value="">-- Chọn nguyên liệu --</option>
                    {allProducts
                        .filter(p => p.id !== initialData?.id) // Prevent self-reference (simple check)
                        .map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                    ))}
                </select>
                <input 
                    type="number" 
                    min="0.1" 
                    step="0.1"
                    className="w-20 border border-gray-200 rounded-lg px-2 text-sm outline-none"
                    value={newIngredientQty}
                    onChange={(e) => setNewIngredientQty(parseFloat(e.target.value))}
                />
                <button 
                    type="button" 
                    onClick={addIngredient}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                </button>
             </div>

             <div className="space-y-2 max-h-40 overflow-y-auto">
                {recipeItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm">
                        <span>{item.materialName}</span>
                        <div className="flex items-center gap-3">
                            <span className="font-bold">{item.quantity} {item.unit}</span>
                            <button 
                                type="button" 
                                onClick={() => removeIngredient(item.materialId)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {recipeItems.length === 0 && (
                    <div className="text-center text-gray-400 italic text-sm">Chưa có thành phần nào</div>
                )}
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
             >
               Hủy bỏ
             </button>
             <button 
               type="submit" 
               className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-pink-600 shadow-sm"
             >
               {initialData ? 'Lưu thay đổi' : 'Thêm mới'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FLOWER' | 'ACCESSORY' | 'LOW_STOCK'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Identify Critical Stock Items (< 10)
  const criticalStockItems = useMemo(() => products.filter(p => p.stock < 10), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesFilter = true;
      if (filterType === 'FLOWER') matchesFilter = p.type === 'FLOWER';
      if (filterType === 'ACCESSORY') matchesFilter = p.type === 'ACCESSORY';
      if (filterType === 'LOW_STOCK') matchesFilter = p.stock <= 20;
      
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filterType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.size} sản phẩm đã chọn?`)) {
      onDeleteProduct && onDeleteProduct(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      onUpdateProduct && onUpdateProduct(product);
    } else {
      onAddProduct && onAddProduct(product);
    }
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = ["Tên sản phẩm", "Số lượng tồn", "Đơn vị tính"];
    
    // CSV Content Rows
    const rows = products.map(p => [
      `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
      p.stock,
      `"${p.unit.replace(/"/g, '""')}"`
    ]);

    // Combine everything
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Add BOM for Excel UTF-8 support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ton_kho_bloomflow_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        allProducts={products}
      />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Kho hàng</h2>
          <p className="text-sm text-gray-500">Tổng {products.length} mặt hàng trong kho</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <Download size={18} />
            <span>Xuất CSV</span>
          </button>
          <button 
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus size={18} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Tìm kiếm sản phẩm..." 
             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
           {(['ALL', 'FLOWER', 'ACCESSORY', 'LOW_STOCK'] as const).map(type => (
             <button
               key={type}
               onClick={() => setFilterType(type)}
               className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                 filterType === type 
                   ? 'bg-gray-800 text-white border-gray-800' 
                   : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
               }`}
             >
               {type === 'ALL' ? 'Tất cả' : type === 'FLOWER' ? 'Hoa tươi' : type === 'ACCESSORY' ? 'Phụ kiện' : 'Sắp hết'}
             </button>
           ))}
        </div>
      </div>

      {/* NEW SECTION: Low Stock Alert Banner */}
      {criticalStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-fade-in">
           <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
              <AlertOctagon size={24} />
           </div>
           <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg">Cảnh Báo Tồn Kho Thấp</h3>
              <p className="text-red-600 text-sm mb-2">
                 Có <span className="font-bold">{criticalStockItems.length}</span> sản phẩm dưới mức an toàn (dưới 10). Cần nhập hàng bổ sung ngay.
              </p>
              <div className="flex flex-wrap gap-2">
                 {criticalStockItems.slice(0, 8).map(item => (
                    <div key={item.id} className="bg-white border border-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-sm">
                        <span>{item.name}</span>
                        <span className="bg-red-100 px-1.5 rounded-full text-[10px] font-bold">{item.stock}</span>
                    </div>
                 ))}
                 {criticalStockItems.length > 8 && (
                    <span className="text-xs text-red-500 self-center underline cursor-pointer hover:text-red-700" onClick={() => setFilterType('LOW_STOCK')}>+ {criticalStockItems.length - 8} sản phẩm khác</span>
                 )}
              </div>
           </div>
           <button 
             onClick={() => setFilterType('LOW_STOCK')}
             className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm whitespace-nowrap"
           >
             Xem danh sách
           </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-2 text-blue-800 font-medium px-2">
            <CheckSquare size={18} />
            <span>Đã chọn {selectedIds.size} sản phẩm</span>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
             >
               <Trash2 size={16} /> Xóa đã chọn
             </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    onChange={handleSelectAll}
                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                  />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phân loại</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Đơn giá</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Tồn kho</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(product.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedIds.has(product.id)}
                      onChange={() => handleSelectOne(product.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        {product.recipe && product.recipe.length > 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ScrollText size={16} className="text-white" />
                            </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                            {product.name}
                            {product.recipe && product.recipe.length > 0 && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-1 rounded border border-blue-200" title="Có công thức">Combo</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">Mã: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      product.type === 'FLOWER' 
                        ? 'bg-pink-50 text-pink-700 border border-pink-100' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {product.type === 'FLOWER' ? 'Hoa tươi' : 'Phụ kiện'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(product.price)}
                    <span className="text-gray-400 text-xs font-normal">/{product.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : product.stock <= 20 ? 'text-orange-500' : 'text-gray-800'}`}>
                          {product.stock}
                        </span>
                        {product.stock < 10 && (
                          <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 animate-pulse whitespace-nowrap text-[10px] font-bold shadow-sm">
                             <AlertTriangle size={12} fill="currentColor" /> 
                             <span>Alert</span>
                          </div>
                        )}
                      </div>
                      
                      {product.stock >= 10 && product.stock <= 20 && (
                        <div className="flex items-center gap-0.5 text-[10px] text-orange-500 font-medium mt-1">
                           <AlertTriangle size={10} /> Sắp hết
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct && onDeleteProduct([product.id])}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>Không tìm thấy sản phẩm nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
