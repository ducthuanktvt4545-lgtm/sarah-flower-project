
import React, { useState } from 'react';
import { Order, OrderStatus, Product, RecipeItem } from '../types';
import { Clock, CheckCircle, AlertCircle, X, Image as ImageIcon, ScrollText, ChevronDown, ChevronUp, AlertTriangle, BellRing, Maximize2, MessageSquareQuote } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { STATUS_LABELS } from '../constants';

interface FloristBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  products?: Product[]; 
}

const FloristBoard: React.FC<FloristBoardProps> = ({ orders, onUpdateStatus, products = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [expandedRecipeOrderId, setExpandedRecipeOrderId] = useState<string | null>(null);

  const columns = [
    { id: OrderStatus.ASSIGNED, title: 'Cần làm', color: 'bg-slate-50', icon: AlertCircle },
    { id: OrderStatus.PROCESSING, title: 'Đang cắm', color: 'bg-orange-50/50', icon: Clock },
    { id: OrderStatus.READY, title: 'Đã xong', color: 'bg-green-50/50', icon: CheckCircle },
  ];

  const getOrdersByStatus = (status: OrderStatus) => orders.filter(o => o.status === status);

  const historyOrders = orders.filter(o => 
    o.status === OrderStatus.DELIVERING || 
    o.status === OrderStatus.COMPLETED
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleFinishClick = (orderId: string) => {
    setPendingId(orderId);
    setIsModalOpen(true);
  };

  const confirmFinish = () => {
    if (pendingId) {
      onUpdateStatus(pendingId, OrderStatus.READY);
      setPendingId(null);
    }
    setIsModalOpen(false);
  };

  const toggleRecipe = (orderId: string) => {
      setExpandedRecipeOrderId(expandedRecipeOrderId === orderId ? null : orderId);
  };

  const getPendingOrderSummary = () => {
    if (!pendingId) return '';
    const order = orders.find(o => o.id === pendingId);
    if (!order) return '';
    const itemsList = order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
    return `đơn hàng #${order.id} (${itemsList})`;
  };

  const getOrderMaterials = (order: Order) => {
    const materials: Record<string, {name: string, quantity: number, unit: string}> = {};
    
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.recipe && product.recipe.length > 0) {
            product.recipe.forEach(ing => {
                if (!materials[ing.materialId]) {
                    materials[ing.materialId] = {
                        name: ing.materialName,
                        quantity: 0,
                        unit: ing.unit
                    };
                }
                materials[ing.materialId].quantity += ing.quantity * item.quantity;
            });
        } 
        else {
             if (!materials[item.productId]) {
                materials[item.productId] = {
                    name: item.productName,
                    quantity: 0,
                    unit: product ? product.unit : ''
                };
             }
             materials[item.productId].quantity += item.quantity;
        }
    });

    return Object.values(materials);
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in">
      <ConfirmationModal 
          isOpen={isModalOpen}
          title="Xác nhận hoàn thành sản phẩm"
          message={`Bạn xác nhận đã cắm xong ${getPendingOrderSummary()}? Trạng thái sẽ chuyển sang 'Sẵn sàng giao' để shipper đến lấy hàng.`}
          onConfirm={confirmFinish}
          onCancel={() => setIsModalOpen(false)}
          confirmLabel="Đúng, đã xong"
          cancelLabel="Chưa xong"
          isDanger={false}
      />

      {previewImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-12 right-0 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 shadow-lg transition-all"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Ảnh phóng to" 
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border-4 border-white/10" 
            />
            <p className="mt-4 text-white font-bold text-lg px-6 py-2 bg-primary/20 rounded-full backdrop-blur-sm border border-white/10">Xem chi tiết mẫu cắm</p>
          </div>
        </div>
      )}

      <div className="flex-none h-[calc(100vh-350px)] flex flex-col">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Khu Vực Thiết Kế</h2>
                <p className="text-slate-500 font-medium">Bảng phân việc thợ cắm hoa theo thời gian giao</p>
            </div>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-black text-slate-600 uppercase">Cấp cứu (Trễ giờ)</span>
                </div>
            </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {columns.map(col => (
            <div key={col.id} className={`flex-shrink-0 w-[400px] ${col.color} rounded-[2rem] p-5 flex flex-col h-full border border-slate-200/60 shadow-sm`}>
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100 ${col.id === OrderStatus.PROCESSING ? 'text-orange-500' : col.id === OrderStatus.READY ? 'text-green-500' : 'text-slate-400'}`}>
                    <col.icon size={22} />
                </div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">{col.title}</h3>
                <span className="bg-slate-900 text-white px-3 py-1 rounded-xl text-xs font-black ml-auto shadow-lg">
                  {getOrdersByStatus(col.id as OrderStatus).length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-2 no-scrollbar">
                {getOrdersByStatus(col.id as OrderStatus).map(order => {
                   const materials = getOrderMaterials(order);
                   const isExpanded = expandedRecipeOrderId === order.id;
                   const isOverdue = new Date() > new Date(order.deliveryTime);

                   return (
                  <div 
                    key={order.id} 
                    className={`rounded-[1.5rem] shadow-sm border transition-all duration-300 cursor-default relative group overflow-hidden flex flex-col ${
                      isOverdue 
                      ? 'bg-red-50 border-red-500 border-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                      : 'bg-white border-slate-200 hover:shadow-xl hover:border-primary/20'
                    }`}
                  >
                    {/* SPECIAL NOTE DISPLAY - TOP PRIORITY */}
                    {order.specialNote && (
                        <div className="bg-rose-600 text-white p-3 flex items-center gap-2 animate-pulse">
                            <AlertTriangle size={18} fill="white" className="text-rose-600" />
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Ghi chú khẩn cấp:</p>
                                <p className="text-xs font-black leading-tight uppercase">{order.specialNote}</p>
                            </div>
                        </div>
                    )}

                    {order.referenceImageUrl && (
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden group/img">
                            <img 
                                src={order.referenceImageUrl} 
                                alt="Mẫu tham chiếu" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                            <div className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg border border-white/20">
                                Mẫu khách gửi
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewImage(order.referenceImageUrl!); }}
                                className="absolute bottom-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-primary transition-all border border-white/30 shadow-lg opacity-0 group-hover/img:opacity-100"
                            >
                                <Maximize2 size={20} />
                            </button>

                            <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg border-2 ${
                                isOverdue ? 'bg-red-600 text-white border-white animate-bounce' : 'bg-white text-slate-800 border-slate-100'
                            }`}>
                                <Clock size={14} />
                                {new Date(order.deliveryTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col gap-4">
                        {order.referenceImageNote && (
                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex gap-3 items-start animate-fade-in">
                                <div className="p-1.5 bg-primary text-white rounded-lg mt-0.5 shadow-sm">
                                    <MessageSquareQuote size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Dặn dò của Seller:</p>
                                    <p className="text-sm font-bold text-slate-800 leading-snug">{order.referenceImageNote}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border">#{order.id}</span>
                                <h4 className="font-black text-xl text-slate-800 mt-2 tracking-tight line-clamp-1">{order.occasion || 'Mẫu thiết kế'}</h4>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Sản phẩm yêu cầu</p>
                             <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="text-sm text-slate-700 flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                        <span className="font-bold">{item.productName}</span>
                                        <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black">x{item.quantity}</span>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {col.id !== OrderStatus.READY && materials.length > 0 && (
                            <div>
                                <button 
                                    onClick={() => toggleRecipe(order.id)}
                                    className={`w-full flex justify-between items-center text-[11px] font-black p-3 rounded-xl transition-all border uppercase tracking-widest ${
                                    isOverdue 
                                    ? 'bg-red-100 text-red-800 border-red-200' 
                                    : 'bg-slate-900 text-white border-slate-800 shadow-lg hover:bg-slate-800 active:scale-95'
                                    }`}
                                >
                                    <span className="flex items-center gap-2"><ScrollText size={16}/> Nguyên liệu cần chuẩn bị</span>
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                
                                {isExpanded && (
                                    <div className="mt-3 p-4 rounded-2xl border bg-white shadow-inner animate-fade-in">
                                        <ul className="space-y-3">
                                            {materials.map((mat, idx) => (
                                                <li key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                                    <span className="font-medium text-slate-600">{mat.name}</span>
                                                    <span className="font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border">
                                                      {parseFloat(mat.quantity.toFixed(1))} {mat.unit}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {order.note && (
                            <div className="text-[11px] p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-medium">
                                <strong className="font-black uppercase tracking-tighter">Ghi chú in thiệp:</strong> {order.note}
                            </div>
                        )}

                        <div className="mt-auto pt-4 flex gap-3 border-t border-slate-100">
                            {col.id === OrderStatus.ASSIGNED && (
                                <button 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.PROCESSING)}
                                className={`w-full py-4 text-white text-sm font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest ${
                                    isOverdue ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-primary hover:bg-pink-700 shadow-pink-200'
                                }`}
                                >
                                Bắt đầu ngay
                                </button>
                            )}
                            {col.id === OrderStatus.PROCESSING && (
                                <button 
                                onClick={() => handleFinishClick(order.id)}
                                className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest hover:bg-black"
                                >
                                <CheckCircle size={20} className="text-emerald-400" /> BÁO XONG
                                </button>
                            )}
                            {col.id === OrderStatus.READY && (
                                <div className="w-full py-3 bg-emerald-50 text-emerald-700 text-center rounded-xl text-xs font-black uppercase border border-emerald-100 flex items-center justify-center gap-2">
                                    <CheckCircle size={14} /> Chờ Shipper
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                )}})}
                
                {getOrdersByStatus(col.id as OrderStatus).length === 0 && (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-300 py-10 text-xs font-black uppercase tracking-widest border-4 border-dashed border-slate-100 rounded-[2rem]">
                     <p>Trống</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 flex-1 min-h-[300px]">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <CheckCircle size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sản phẩm đã bàn giao</h3>
            </div>
            <button className="text-sm font-black text-primary hover:underline uppercase tracking-widest">Xem toàn bộ lịch sử</button>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-5 rounded-l-2xl">Mã Đơn</th>
                <th className="px-6 py-5">Nội dung sản phẩm</th>
                <th className="px-6 py-5 text-center">Ảnh thành phẩm</th>
                <th className="px-6 py-5">Giờ giao thực tế</th>
                <th className="px-6 py-5 rounded-r-2xl text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {historyOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5 font-black text-slate-900">#{order.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                        {order.items.map((item, idx) => (
                        <div key={idx} className="text-slate-600 font-medium">
                            {item.productName} <span className="font-black text-slate-400 ml-1 text-xs">x{item.quantity}</span>
                        </div>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {order.completedImageUrl ? (
                      <button 
                        onClick={() => setPreviewImage(order.completedImageUrl || null)}
                        className="inline-flex items-center gap-2 text-primary font-black bg-pink-50 px-3 py-1.5 rounded-xl text-[10px] border border-pink-100 uppercase tracking-tighter hover:bg-pink-100 transition-all"
                      >
                        <ImageIcon size={14} /> Kiểm tra
                      </button>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Chưa chụp</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-bold">
                    {new Date(order.deliveryTime).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border 
                      ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {historyOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-black uppercase tracking-widest opacity-20">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FloristBoard;
