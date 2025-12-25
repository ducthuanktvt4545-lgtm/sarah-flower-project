
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, Product, OrderItem, OrderType } from '../types';
import { X, Plus, Trash2, Sparkles, Tag, Gift, Image as ImageIcon, Camera, Upload, AlertCircle, AlertTriangle } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Order) => void;
  products: Product[];
  existingOrders: Order[]; 
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSubmit, products, existingOrders = [] }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryTime: '',
    note: '',
    specialNote: '',
    occasion: 'Sinh nhật',
    referenceImageNote: ''
  });
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vipInfo, setVipInfo] = useState<{isVip: boolean, count: number} | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);

  const [orderItems, setOrderItems] = useState<{productId: string, quantity: number}[]>([]);

  useEffect(() => {
    if (formData.customerPhone.length >= 10) {
        const history = existingOrders.filter(o => 
            o.customerPhone === formData.customerPhone && 
            o.status !== OrderStatus.CANCELED
        );
        
        if (history.length >= 5) {
            setVipInfo({ isVip: true, count: history.length });
            if (!formData.customerName && history[0].customerName) {
                setFormData(prev => ({...prev, customerName: history[0].customerName}));
            }
        } else {
            setVipInfo(null);
        }
    } else {
        setVipInfo(null);
    }
  }, [formData.customerPhone, existingOrders]);

  const handleAddItem = () => {
    if (products.length > 0) {
      setOrderItems([...orderItems, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...orderItems];
    if (field === 'productId') {
        newItems[index].productId = value as string;
    } else {
        newItems[index].quantity = Number(value);
    }
    setOrderItems(newItems);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setRefImagePreview(base64String);
        setReferenceImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const subTotal = useMemo(() => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [orderItems, products]);

  const finalTotal = Math.max(0, subTotal - discountAmount);

  const applyVipDiscount = () => {
      const discount = Math.round(subTotal * 0.05);
      setDiscountAmount(discount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalItems: OrderItem[] = orderItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            productId: item.productId,
            productName: product?.name || 'Unknown',
            quantity: item.quantity,
            price: product?.price || 0
        };
    });

    const newOrder: Order = {
        id: `DH-${Math.floor(1000 + Math.random() * 9000)}`,
        type: OrderType.RETAIL,
        branchId: 'BR001',
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryTime: formData.deliveryTime || new Date().toISOString(),
        status: isPreOrder ? OrderStatus.PRE_ORDER : OrderStatus.NEW,
        paymentStatus: 'UNPAID',
        items: finalItems,
        subTotal: subTotal,
        discount: discountAmount,
        totalAmount: finalTotal,
        note: formData.note,
        specialNote: formData.specialNote,
        createdAt: new Date().toISOString(),
        occasion: formData.occasion,
        referenceImageUrl: referenceImageUrl,
        referenceImageNote: formData.referenceImageNote
    };

    onSubmit(newOrder);
    setFormData({
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      deliveryTime: '',
      note: '',
      specialNote: '',
      occasion: 'Sinh nhật',
      referenceImageNote: ''
    });
    setOrderItems([]);
    setIsPreOrder(false);
    setDiscountAmount(0);
    setVipInfo(null);
    setReferenceImageUrl('');
    setRefImagePreview(null);
    onClose();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
       <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
             <h2 className="text-xl font-bold text-gray-800">Tạo Đơn Hàng Mới</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
             <form id="create-order-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input 
                            required 
                            type="tel" 
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none" 
                            value={formData.customerPhone} 
                            onChange={e => setFormData({...formData, customerPhone: e.target.value})} 
                            placeholder="Nhập SĐT để kiểm tra lịch sử"
                        />
                        {vipInfo && (
                            <div className="mt-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 p-3 rounded-lg border border-yellow-200 flex flex-col gap-2">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <Sparkles size={16} className="text-yellow-600"/> 
                                    <span>Khách hàng VIP ({vipInfo.count} đơn)</span>
                                </div>
                                {subTotal > 0 ? (
                                    <button 
                                        type="button" 
                                        onClick={applyVipDiscount}
                                        className="flex items-center justify-center gap-2 bg-white border border-yellow-300 rounded px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 transition-colors shadow-sm"
                                    >
                                        <Gift size={14} />
                                        Áp dụng giảm giá 5% ngay
                                    </button>
                                ) : (
                                    <p className="text-xs text-yellow-600 italic">Thêm sản phẩm để áp dụng giảm giá</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                        <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                    <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none" value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian giao</label>
                        <input required type="datetime-local" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none" value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})} />
                        
                        <div className="flex items-center gap-2 mt-2">
                           <input 
                              type="checkbox" 
                              id="isPreOrder"
                              checked={isPreOrder} 
                              onChange={e => setIsPreOrder(e.target.checked)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                           />
                           <label htmlFor="isPreOrder" className="text-sm text-gray-700 font-medium cursor-pointer">Đây là đơn đặt trước (Pre-order)</label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dịp / Sự kiện</label>
                        <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none bg-white" value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})}>
                            <option value="Sinh nhật">Sinh nhật</option>
                            <option value="Khai trương">Khai trương</option>
                            <option value="Kỷ niệm">Kỷ niệm</option>
                            <option value="Chia buồn">Chia buồn</option>
                            <option value="Tình yêu">Tình yêu</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                </div>

                {/* SPECIAL NOTE - HIGH PRIORITY SECTION */}
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 animate-fade-in">
                    <label className="block text-sm font-black text-rose-700 mb-2 flex items-center gap-2 uppercase tracking-tight">
                        <AlertTriangle size={18} /> Ghi chú đặc biệt (Cần lưu ý gấp)
                    </label>
                    <textarea 
                        className="w-full border border-rose-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none bg-white font-bold text-rose-800 placeholder:text-rose-300" 
                        rows={2} 
                        placeholder="Ví dụ: Khách dị ứng phấn hoa, giao gấp trước 8h, không ghi giá vào thiệp..."
                        value={formData.specialNote}
                        onChange={e => setFormData({...formData, specialNote: e.target.value})}
                    ></textarea>
                </div>

                <div className="bg-pink-50/30 p-5 rounded-xl border-2 border-dashed border-pink-200">
                    <label className="block text-sm font-black text-primary mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <ImageIcon size={18} /> Ảnh mẫu khách gửi (Tham chiếu cho thợ)
                    </label>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Bước 1: Tải ảnh mẫu</p>
                                <div className="flex gap-2">
                                    <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-pink-200 rounded-lg p-3 cursor-pointer hover:bg-white hover:border-primary transition-all group shadow-sm">
                                        <Upload size={18} className="text-pink-400 group-hover:text-primary" />
                                        <span className="text-sm font-bold text-pink-500 group-hover:text-primary">Chọn ảnh</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            placeholder="Dán link ảnh mẫu..." 
                                            className="w-full h-full border border-pink-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
                                            value={referenceImageUrl.startsWith('data:') ? '' : referenceImageUrl}
                                            onChange={e => {
                                                setReferenceImageUrl(e.target.value);
                                                setRefImagePreview(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {refImagePreview && (
                                <div className="w-24 h-24 rounded-lg border-2 border-white shadow-md overflow-hidden relative flex-shrink-0 animate-zoom-in">
                                    <img src={refImagePreview} alt="Mẫu" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setRefImagePreview(null); setReferenceImageUrl(''); }}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {refImagePreview && (
                            <div className="animate-fade-in">
                                <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Bước 2: Dặn dò thợ (Cắm giống 90%, đổi màu hoa...)</p>
                                <div className="relative">
                                    <AlertCircle className="absolute left-3 top-3 text-primary/40" size={16} />
                                    <textarea 
                                        className="w-full border border-pink-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-inner font-medium placeholder:text-slate-400 italic" 
                                        rows={2} 
                                        placeholder="Ví dụ: Cắm giống 90%, đổi hoa hồng đỏ sang hồng dâu giúp em..."
                                        value={formData.referenceImageNote}
                                        onChange={e => setFormData({...formData, referenceImageNote: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Sản phẩm</label>
                        <button type="button" onClick={handleAddItem} className="text-sm text-primary flex items-center gap-1 font-medium hover:text-pink-600">
                            <Plus size={16} /> Thêm món
                        </button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {orderItems.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select 
                                    className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                    value={item.productId}
                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                                    ))}
                                </select>
                                <input 
                                    type="number" 
                                    min="1" 
                                    className="w-20 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                />
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {orderItems.length === 0 && <p className="text-sm text-gray-500 italic text-center py-2">Chưa có sản phẩm nào được chọn.</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú chung (In thiệp, lời nhắn...)</label>
                    <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none" rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Lời nhắn trên thiệp..."></textarea>
                </div>
             </form>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
             <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <span className="flex items-center gap-1 text-gray-600"><Tag size={14}/> Giảm giá:</span>
                    <input 
                        type="number" 
                        min="0"
                        className="w-32 border rounded p-1 text-right text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    />
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                </div>
             </div>

             <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium">Hủy</button>
                <button type="submit" form="create-order-form" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-pink-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={orderItems.length === 0}>Tạo Đơn</button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CreateOrderModal;
