
import React, { useState } from 'react';
import { Order, OrderStatus, Product, OrderReminder } from '../types';
import { 
  ChevronLeft, ChevronRight, Clock, MapPin, Plus, X, User, 
  Truck, CheckCircle, CheckSquare, Square, Trash2, ListTodo, 
  Calendar as CalendarIcon, LayoutGrid, List, TrendingUp, ShoppingBag, Bell,
  Image as ImageIcon, Maximize2, MessageSquareQuote, Package, RotateCcw, Flame, AlertTriangle
} from 'lucide-react';
import { STATUS_LABELS } from '../constants';
import CreateOrderModal from './CreateOrderModal';
import ConfirmationModal from './ConfirmationModal';

interface OrderCalendarProps {
  orders: Order[];
  reminders?: OrderReminder[];
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  onCreateOrder?: (order: Order) => void;
  products?: Product[];
}

interface CalendarTask {
  id: string;
  date: string; 
  content: string;
  isCompleted: boolean;
}

const OrderCalendar: React.FC<OrderCalendarProps> = ({ orders, reminders = [], onUpdateStatus, onCreateOrder, products = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<CalendarTask[]>([
    { id: 't1', date: new Date().toISOString().slice(0, 10), content: 'Kiểm tra lô hoa nhập khẩu', isCompleted: false },
    { id: 't2', date: new Date().toISOString().slice(0, 10), content: 'Mua thêm ruy băng đỏ', isCompleted: true }
  ]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{id: string, status: OrderStatus} | null>(null);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const formatDateKey = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const d = new Date(date.getTime() - (offset*60*1000));
    return d.toISOString().split('T')[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PRE_ORDER: return 'bg-indigo-50/80 text-indigo-700 border-indigo-200';
      case OrderStatus.NEW: return 'bg-blue-50/80 text-blue-700 border-blue-200';
      case OrderStatus.ASSIGNED: return 'bg-slate-50/80 text-slate-700 border-slate-300';
      case OrderStatus.PROCESSING: return 'bg-orange-50/80 text-orange-700 border-orange-300';
      case OrderStatus.READY: return 'bg-teal-50/80 text-teal-700 border-teal-300';
      case OrderStatus.DELIVERING: return 'bg-yellow-50/80 text-yellow-700 border-yellow-300';
      case OrderStatus.COMPLETED: return 'bg-emerald-50/80 text-emerald-700 border-emerald-300';
      case OrderStatus.CANCELED: return 'bg-rose-50/80 text-rose-400 border-rose-200 line-through';
      default: return 'bg-gray-50/80 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PRE_ORDER: return <CalendarIcon size={12} />;
      case OrderStatus.NEW: return <Plus size={12} />;
      case OrderStatus.ASSIGNED: return <User size={12} />;
      case OrderStatus.PROCESSING: return <Clock size={12} />;
      case OrderStatus.READY: return <CheckSquare size={12} />;
      case OrderStatus.DELIVERING: return <Truck size={12} />;
      case OrderStatus.COMPLETED: return <CheckCircle size={12} />;
      case OrderStatus.CANCELED: return <X size={12} />;
      default: return <Package size={12} />;
    }
  };

  const handleAddTask = (dateStr: string) => {
    const content = prompt("Nội dung công việc:");
    if (content) {
      setTasks([...tasks, { id: `task-${Date.now()}`, date: dateStr, content, isCompleted: false }]);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (taskId: string) => {
    if (confirm("Xóa công việc?")) setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleActionClick = (orderId: string, status: OrderStatus) => {
    if (status === OrderStatus.CANCELED || status === OrderStatus.COMPLETED) {
      setPendingAction({ id: orderId, status });
      setIsConfirmOpen(true);
    } else {
      onUpdateStatus?.(orderId, status);
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const confirmAction = () => {
    if (pendingAction && onUpdateStatus) {
      onUpdateStatus(pendingAction.id, pendingAction.status);
      setPendingAction(null);
      setSelectedOrder(prev => prev ? { ...prev, status: pendingAction.status } : null);
    }
    setIsConfirmOpen(false);
  };

  const weekOrders = orders.filter(o => {
    const d = new Date(o.deliveryTime);
    return d >= weekDays[0] && d <= new Date(weekDays[6].getTime() + 86400000);
  });
  const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.status !== OrderStatus.CANCELED ? o.totalAmount : 0), 0);

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col animate-fade-in relative">
      <CreateOrderModal 
        isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={onCreateOrder!} products={products} existingOrders={orders} 
      />

      <ConfirmationModal
        isOpen={isConfirmOpen} title={pendingAction?.status === OrderStatus.CANCELED ? 'Hủy đơn hàng' : 'Hoàn tất đơn hàng'}
        message={pendingAction?.status === OrderStatus.CANCELED ? 'Hủy đơn hàng này?' : 'Xác nhận giao thành công?'}
        onConfirm={confirmAction} onCancel={() => setIsConfirmOpen(false)} isDanger={pendingAction?.status === OrderStatus.CANCELED}
      />

      {previewImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
          <img src={previewImage} alt="Full Size" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-zoom-in" />
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-white/20" onClick={e => e.stopPropagation()}>
            <div className={`flex justify-between items-center p-6 border-b ${getStatusColor(selectedOrder.status).split(' ')[0]}`}>
               <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-white rounded-lg shadow-sm">{getStatusIcon(selectedOrder.status)}</span>
                    <h3 className="font-black text-xl tracking-tighter">{selectedOrder.id}</h3>
                  </div>
                  <span className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-widest mt-2 inline-block ${getStatusColor(selectedOrder.status).split(' ')[1]} ${getStatusColor(selectedOrder.status).split(' ')[2]}`}>
                    {STATUS_LABELS[selectedOrder.status]}
                  </span>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/50 hover:bg-white rounded-full transition-all"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 no-scrollbar">
               {/* SPECIAL NOTE DISPLAY IN CALENDAR MODAL */}
               {selectedOrder.specialNote && (
                 <div className="bg-rose-50 border-2 border-rose-200 p-5 rounded-[2rem] flex gap-4 items-start animate-pulse">
                    <div className="p-2 bg-rose-600 text-white rounded-xl shadow-lg">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Ghi chú đặc biệt khẩn cấp</p>
                        <p className="text-sm font-black text-rose-800 leading-relaxed uppercase">{selectedOrder.specialNote}</p>
                    </div>
                 </div>
               )}

               <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><User size={20} /></div>
                    <div><p className="font-black text-slate-800">{selectedOrder.customerName}</p><p className="text-sm font-bold text-slate-400">{selectedOrder.customerPhone}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><MapPin size={20} /></div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary"><Clock size={20} /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian giao</p>
                        <p className="text-sm font-black text-slate-800">{new Date(selectedOrder.deliveryTime).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
               </div>

               {(selectedOrder.referenceImageUrl || selectedOrder.completedImageUrl) && (
                 <div className="grid grid-cols-2 gap-6">
                    {selectedOrder.referenceImageUrl && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mẫu khách gửi</p>
                        <div 
                          onClick={() => setPreviewImage(selectedOrder.referenceImageUrl!)}
                          className="relative aspect-square rounded-[1.5rem] bg-pink-50 border border-pink-100 overflow-hidden cursor-zoom-in group shadow-md"
                        >
                          <img src={selectedOrder.referenceImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Mẫu" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 size={24} className="text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedOrder.completedImageUrl && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh thực tế</p>
                        <div 
                          onClick={() => setPreviewImage(selectedOrder.completedImageUrl!)}
                          className="relative aspect-square rounded-[1.5rem] bg-emerald-50 border border-emerald-100 overflow-hidden cursor-zoom-in group shadow-md"
                        >
                          <img src={selectedOrder.completedImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Thực tế" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 size={24} className="text-white" />
                          </div>
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">Xong</div>
                        </div>
                      </div>
                    )}
                 </div>
               )}

               {selectedOrder.referenceImageNote && (
                 <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl flex gap-3 items-start text-sm text-pink-700 font-medium">
                    <MessageSquareQuote size={20} className="flex-shrink-0 mt-0.5 opacity-50" />
                    <span>{selectedOrder.referenceImageNote}</span>
                 </div>
               )}

               <div>
                 <h4 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-widest">Nội dung sản phẩm</h4>
                 <ul className="space-y-3 mt-2">
                   {selectedOrder.items.map((item, idx) => (
                     <li key={idx} className="flex justify-between items-center text-sm">
                       <span className="text-slate-600 font-bold">{item.productName} <span className="text-slate-400 font-black ml-1 bg-slate-100 px-2 py-0.5 rounded-lg text-[10px]">x{item.quantity}</span></span>
                       <span className="font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                     </li>
                   ))}
                 </ul>
                 <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xl font-black">
                      <span className="text-slate-400">Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                 </div>
               </div>

               {selectedOrder.note && (
                 <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Ghi chú vận hành</p>
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">{selectedOrder.note}</p>
                 </div>
               )}
            </div>
            {onUpdateStatus && (
              <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                 {selectedOrder.status === OrderStatus.READY && <button onClick={() => handleActionClick(selectedOrder.id, OrderStatus.DELIVERING)} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-200 active:scale-95 transition-all"><Truck size={18} /> Giao hàng</button>}
                 {selectedOrder.status === OrderStatus.DELIVERING && <button onClick={() => handleActionClick(selectedOrder.id, OrderStatus.COMPLETED)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"><CheckCircle size={18} /> Hoàn tất</button>}
                 <button onClick={() => handleActionClick(selectedOrder.id, OrderStatus.CANCELED)} className="px-6 py-3 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">Hủy đơn</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[2.5rem] border shadow-sm">
        <div className="flex items-center gap-5">
            <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-pink-200"><CalendarIcon size={28}/></div>
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Timeline Bán Lẻ</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Tuần {weekDays[0].getDate()}/{weekDays[0].getMonth()+1} — {weekDays[6].getDate()}/{weekDays[6].getMonth()+1}</p>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                <button onClick={() => setViewMode('timeline')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'timeline' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-700'}`}><List size={16}/> Lập bảng</button>
                <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={16}/> Lưới</button>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
            <button onClick={goToToday} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white hover:bg-slate-50 border rounded-2xl shadow-sm transition-all active:scale-95">Hôm nay</button>
            <div className="flex items-center bg-luxury text-white rounded-[1.5rem] p-1 shadow-lg">
              <button onClick={prevWeek} className="p-2.5 hover:bg-slate-700 rounded-xl transition-all"><ChevronLeft size={20} /></button>
              <span className="text-[9px] font-black px-4 uppercase tracking-[0.2em] border-x border-white/10">Tuần kế</span>
              <button onClick={nextWeek} className="p-2.5 hover:bg-slate-700 rounded-xl transition-all"><ChevronRight size={20} /></button>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-white px-8 py-3.5 rounded-2xl hover:bg-pink-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-200 flex items-center gap-2 active:scale-95"><Plus size={20} /><span>Tạo đơn</span></button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><ShoppingBag size={100}/></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start opacity-60 mb-1"><span className="text-[10px] font-black uppercase tracking-widest">Đơn tuần này</span></div>
                <div className="text-3xl font-black">{weekOrders.length} <span className="text-[10px] text-emerald-400 font-bold ml-1">+2</span></div>
              </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-pink-600 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={100}/></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start opacity-60 mb-1"><span className="text-[10px] font-black uppercase tracking-widest">Dự kiến thu</span></div>
                <div className="text-3xl font-black">{formatCurrency(weekRevenue).replace('₫','')} <span className="text-[10px] opacity-60 font-medium">VNĐ</span></div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 group hover:shadow-xl transition-all">
              <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform"><CheckSquare size={24}/></div>
              <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Đơn Sẵn Sàng</p><p className="text-3xl font-black text-slate-800">{weekOrders.filter(o => o.status === OrderStatus.READY).length}</p></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 group hover:shadow-xl transition-all">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform"><Truck size={24}/></div>
              <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Đang trên đường</p><p className="text-3xl font-black text-slate-800">{weekOrders.filter(o => o.status === OrderStatus.DELIVERING).length}</p></div>
          </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 bg-slate-50/50 divide-x divide-slate-100 border-b border-slate-100">
          {weekDays.map((day, index) => {
             const isToday = isSameDay(day, new Date());
             const dayName = index === 6 ? 'Chủ Nhật' : `Thứ ${index + 2}`;
             return (
            <div key={index} className={`py-6 text-center transition-colors ${isToday ? 'bg-primary/[0.03]' : ''}`}>
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-primary' : 'text-slate-400'}`}>{dayName}</div>
              <div className={`text-4xl font-black mt-1 tracking-tighter ${isToday ? 'text-primary' : 'text-slate-800'}`}>{day.getDate()}</div>
            </div>
          )})}
        </div>

        <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 overflow-y-auto no-scrollbar bg-white">
          {weekDays.map((day, index) => {
            const dateStr = formatDateKey(day);
            const isToday = isSameDay(day, new Date());
            const dayOrders = orders
                .filter(o => isSameDay(new Date(o.deliveryTime), day))
                .sort((a, b) => new Date(a.deliveryTime).getTime() - new Date(b.deliveryTime).getTime());
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const dayReminders = reminders.filter(r => isSameDay(new Date(r.remindAt), day));

            return (
              <div key={index} className={`flex flex-col min-h-[600px] transition-colors ${isToday ? 'bg-primary/[0.01]' : ''}`}>
                <div className="p-4 flex-1 space-y-4">
                   {dayOrders.map(order => {
                    const orderStatusColor = getStatusColor(order.status);
                    const isOverdue = !['COMPLETED', 'CANCELED'].includes(order.status) && new Date() > new Date(order.deliveryTime);

                    return (
                    <div 
                      key={order.id} onClick={() => setSelectedOrder(order)}
                      className={`group p-4 rounded-[1.5rem] border-l-[8px] shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden ${orderStatusColor.split(' ')[0]} ${orderStatusColor.split(' ')[2].replace('border-', 'border-l-')} ${isOverdue || order.specialNote ? 'ring-2 ring-rose-500 animate-pulse-subtle' : ''}`}
                    >
                       <div className="flex justify-between items-start mb-2 relative z-10">
                           <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter ${orderStatusColor.split(' ')[1]}`}>
                               {getStatusIcon(order.status)}
                               {new Date(order.deliveryTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                           </div>
                           <span className="text-[8px] font-mono font-bold opacity-30 group-hover:opacity-100 transition-opacity">#{order.id.split('-')[1]}</span>
                       </div>
                       <p className={`text-xs font-black truncate mb-1 tracking-tight ${orderStatusColor.split(' ')[1]}`} title={order.customerName}>{order.customerName}</p>
                       
                       {order.specialNote && (
                         <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-rose-600 animate-pulse">
                            <AlertTriangle size={10} /> ƯU TIÊN GẤP
                         </div>
                       )}

                       {order.referenceImageUrl && (
                         <div className="mt-3 w-full h-14 rounded-xl bg-white/50 overflow-hidden relative border border-black/5 shadow-inner">
                           <img src={order.referenceImageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" alt="Thumb" />
                         </div>
                       )}

                       <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5">
                          <span className={`text-[8px] font-black uppercase tracking-widest opacity-60`}>{STATUS_LABELS[order.status]}</span>
                          <span className={`text-[11px] font-black ${orderStatusColor.split(' ')[1]}`}>{formatCurrency(order.totalAmount).replace('₫','')}</span>
                       </div>

                       {(isOverdue || order.specialNote) && (
                         <div className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-bl-lg shadow-lg">
                           <Flame size={10} fill="currentColor" />
                         </div>
                       )}
                    </div>
                  )})}

                  {dayReminders.map(reminder => (
                    <div 
                      key={reminder.id}
                      className={`p-3 rounded-2xl border-l-4 border-blue-500 bg-blue-50/50 shadow-sm flex flex-col gap-1 relative group hover:bg-blue-100/50 transition-all ${reminder.isRead ? 'opacity-50' : ''}`}
                    >
                       <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                           <Bell size={12} />
                           {new Date(reminder.remindAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                       </div>
                       <p className="text-[10px] font-black text-slate-800 truncate">Hẹn #{reminder.orderId}</p>
                       <p className="text-[9px] text-slate-500 italic line-clamp-1 font-medium">{reminder.note}</p>
                    </div>
                  ))}

                  {dayOrders.length === 0 && dayReminders.length === 0 && <div className="h-32 flex items-center justify-center text-[10px] font-black text-slate-200 border-2 border-dashed border-slate-50 rounded-[2rem] uppercase tracking-widest opacity-50">Lịch Trống</div>}
                </div>

                <div className="p-4 bg-slate-50/30 border-t border-dashed border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><ListTodo size={14} /> To-do</span>
                        <button onClick={() => handleAddTask(dateStr)} className="text-primary hover:bg-white p-1.5 rounded-xl transition-all shadow-sm active:scale-90"><Plus size={16} /></button>
                    </div>
                    <div className="space-y-2">
                        {dayTasks.map(task => (
                            <div key={task.id} className="flex items-start gap-2 group text-[10px] p-3 bg-white border border-slate-100 rounded-[1rem] shadow-sm hover:shadow-md transition-all">
                                <button onClick={() => toggleTask(task.id)} className={`mt-0.5 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-slate-200 hover:text-primary'}`}>
                                    {task.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                                </button>
                                <span className={`flex-1 font-bold leading-tight tracking-tight ${task.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{task.content}</span>
                                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseSubtle {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .animate-zoom-in { animation: zoomIn 0.2s ease-out forwards; }
        .animate-pulse-subtle { animation: pulseSubtle 2s infinite; }
      `}</style>
    </div>
  );
};

export default OrderCalendar;
