
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, Product, CustomerTier } from '../types';
import { 
  Search, Clock, User, Phone, ChevronDown, Package, Plus, X, ChevronLeft, ChevronRight, Maximize2, 
  Calendar as CalendarIcon, Zap, LayoutList, Columns4, ExternalLink,
  ShoppingBag, MoveRight, Layers, Sun, Sunrise, Sunset, Image as ImageIcon,
  CheckCircle2, AlertTriangle, BarChart3
} from 'lucide-react';
import { STATUS_LABELS, MOCK_CUSTOMERS } from '../constants';

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus, extraData?: any) => void;
  isShipperView?: boolean;
  onCreateOrder?: (order: Order) => void;
  products?: Product[];
}

type TimeSlotFilter = 'ALL' | 'OVERDUE' | 'URGENT' | 'MORNING' | 'AFTERNOON' | 'EVENING';
type ViewType = 'LIST' | 'WEEKLY';

const OrderList: React.FC<OrderListProps> = ({ orders, onUpdateStatus, isShipperView = false, onCreateOrder, products = [] }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [timeSlotFilter, setTimeSlotFilter] = useState<TimeSlotFilter>('ALL');
  const [viewType, setViewType] = useState<ViewType>('WEEKLY'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('DELIVERY_ASC'); 
  const [distributionDate, setDistributionDate] = useState(new Date('2026-01-05')); // Default to mock data week
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | null>(null);

  // Pagination State (for List view)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Interaction states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [movingOrderId, setMovingOrderId] = useState<string | null>(null);

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, timeSlotFilter, sortBy, selectedDayFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getRelativeTimeInfo = (timeStr: string, status: OrderStatus) => {
    const now = new Date('2026-01-05T08:00:00Z'); // Fixed now for mock consistency
    const delivery = new Date(timeStr);
    const diffMs = delivery.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const isOverdue = diffMs < 0 && ![OrderStatus.COMPLETED, OrderStatus.CANCELED].includes(status);
    
    return {
        diffMins,
        isOverdue,
        isUrgent: diffMins > 0 && diffMins <= 120,
        label: isOverdue 
            ? `Trễ ${Math.abs(Math.floor(diffMins/60))}h ${Math.abs(diffMins%60)}p` 
            : diffMins > 0 && diffMins < 1440 
                ? `Còn ${Math.floor(diffMins/60)}h ${diffMins%60}p` 
                : delivery.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    };
  };

  const MAX_CAPACITY_PER_DAY = 15; 

  const weekData = useMemo(() => {
    const startOfWeek = new Date(distributionDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return days.map(d => {
      const dayOrders = orders.filter(o => {
        const delDate = new Date(o.deliveryTime);
        return delDate.getDate() === d.getDate() && 
               delDate.getMonth() === d.getMonth() && 
               delDate.getFullYear() === d.getFullYear() &&
               o.status !== OrderStatus.CANCELED;
      });

      const capacityPercent = Math.min(100, (dayOrders.length / MAX_CAPACITY_PER_DAY) * 100);

      // Grouping orders by slots
      const morning = dayOrders.filter(o => new Date(o.deliveryTime).getHours() < 12);
      const afternoon = dayOrders.filter(o => {
          const h = new Date(o.deliveryTime).getHours();
          return h >= 12 && h < 18;
      });
      const evening = dayOrders.filter(o => new Date(o.deliveryTime).getHours() >= 18);

      return {
        date: d,
        count: dayOrders.length,
        capacityPercent,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        label: d.getDay() === 0 ? 'Chủ Nhật' : `Thứ ${d.getDay() + 1}`,
        shortLabel: d.getDay() === 0 ? 'CN' : `T${d.getDay() + 1}`,
        isToday: d.toDateString() === new Date('2026-01-05').toDateString(), 
        orders: dayOrders.sort((a, b) => new Date(a.deliveryTime).getTime() - new Date(b.deliveryTime).getTime()),
        slots: { morning, afternoon, evening }
      };
    });
  }, [orders, distributionDate]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              order.customerPhone.includes(searchTerm);
        
        if (isShipperView) {
            const allowedStatuses = [OrderStatus.READY, OrderStatus.DELIVERING, OrderStatus.COMPLETED];
            return matchesSearch && allowedStatuses.includes(order.status);
        }

        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        
        let matchesDay = true;
        if (selectedDayFilter !== null) {
            const delDate = new Date(order.deliveryTime);
            matchesDay = delDate.toDateString() === weekData[selectedDayFilter].date.toDateString();
        }

        let matchesTimeSlot = true;
        if (timeSlotFilter !== 'ALL') {
            const del = new Date(order.deliveryTime);
            const hour = del.getHours();
            const { isOverdue, isUrgent } = getRelativeTimeInfo(order.deliveryTime, order.status);
            
            if (timeSlotFilter === 'OVERDUE') matchesTimeSlot = isOverdue;
            else if (timeSlotFilter === 'URGENT') matchesTimeSlot = isUrgent;
            else if (timeSlotFilter === 'MORNING') matchesTimeSlot = hour >= 6 && hour < 12;
            else if (timeSlotFilter === 'AFTERNOON') matchesTimeSlot = hour >= 12 && hour < 18;
            else if (timeSlotFilter === 'EVENING') matchesTimeSlot = hour >= 18 || hour < 6;
        }

        return matchesSearch && matchesStatus && matchesDay && matchesTimeSlot;
      })
      .sort((a, b) => {
        const dateA = new Date(a.deliveryTime).getTime();
        const dateB = new Date(b.deliveryTime).getTime();
        const createdA = new Date(a.createdAt).getTime();
        const createdB = new Date(b.createdAt).getTime();
        if (sortBy === 'DELIVERY_ASC') return (dateA - dateB) || (createdB - createdA);
        if (sortBy === 'DELIVERY_DESC') return (dateB - dateA) || (createdB - createdA);
        if (sortBy === 'AMOUNT_DESC') return (b.totalAmount - a.totalAmount) || (createdB - createdA);
        return createdB - createdA;
      });
  }, [orders, searchTerm, filterStatus, sortBy, isShipperView, selectedDayFilter, weekData, timeSlotFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PRE_ORDER: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case OrderStatus.NEW: return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.READY: return 'bg-teal-50 text-teal-700 border-teal-200';
      case OrderStatus.DELIVERING: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case OrderStatus.COMPLETED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case OrderStatus.CANCELED: return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const handleReschedule = (orderId: string, newDate: Date) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const currentDelivery = new Date(order.deliveryTime);
        const updatedDelivery = new Date(newDate);
        updatedDelivery.setHours(currentDelivery.getHours());
        updatedDelivery.setMinutes(currentDelivery.getMinutes());
        
        onUpdateStatus(orderId, order.status, { deliveryTime: updatedDelivery.toISOString() });
        setMovingOrderId(null);
    }
  };

  const changeWeek = (direction: 'next' | 'prev') => {
      const newDate = new Date(distributionDate);
      newDate.setDate(distributionDate.getDate() + (direction === 'next' ? 7 : -7));
      setDistributionDate(newDate);
      setSelectedDayFilter(null);
  };

  const goToToday = () => {
    setDistributionDate(new Date('2026-01-05')); // Reset to mock "today"
    setSelectedDayFilter(null);
  };

  const OrderCard: React.FC<{ order: Order, dayLabel: string }> = ({ order, dayLabel }) => {
      const { isOverdue, label } = getRelativeTimeInfo(order.deliveryTime, order.status);
      const isMoving = movingOrderId === order.id;

      return (
        <div 
            className={`p-4 rounded-2xl border shadow-sm group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-slate-100 ${isOverdue ? 'ring-2 ring-rose-500' : ''} ${isMoving ? 'opacity-40 grayscale scale-95' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                    <Clock size={10} /> {label}
                </div>
                <div className="relative">
                    <button 
                    onClick={(e) => { e.stopPropagation(); setMovingOrderId(movingOrderId === order.id ? null : order.id); }}
                    className={`p-1.5 rounded-lg transition-all ${isMoving ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    title="Chuyển ngày"
                    >
                    <MoveRight size={12} />
                    </button>
                    {isMoving && (
                        <div className="absolute right-0 top-full mt-2 bg-slate-900 text-white rounded-2xl shadow-2xl p-3 z-[100] w-48 animate-fade-in border border-white/10">
                            <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest text-center">Dời lịch sang ngày:</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {weekData.map((d, i) => (
                                    <button 
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); handleReschedule(order.id, d.date); }}
                                        className={`py-1.5 rounded-xl text-[9px] font-black transition-all ${d.shortLabel === dayLabel ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/20 hover:bg-primary text-white'}`}
                                        disabled={d.shortLabel === dayLabel}
                                    >
                                        {d.shortLabel} ({d.date.getDate()})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-800 leading-tight group-hover:text-primary transition-colors truncate">{order.customerName}</h4>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{order.customerPhone}</p>
                </div>
                {order.completedImageUrl && (
                    <div 
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(order.completedImageUrl!); }}
                        className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 relative group/thumb"
                    >
                        <img src={order.completedImageUrl} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" alt="Thumb" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                            <ImageIcon size={12} className="text-white" />
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-dashed border-slate-50 flex justify-between items-center">
                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                    {STATUS_LABELS[order.status].split(' ')[0]}
                </span>
                <span className="text-[11px] font-black text-slate-900">{formatCurrency(order.totalAmount).replace('₫','')}</span>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col pb-10">
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-14 right-0 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <img src={previewImage} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border-4 border-white/10" alt="Full" />
            <p className="mt-4 text-white/60 text-xs font-black uppercase tracking-widest">Chi tiết thành phẩm</p>
          </div>
        </div>
      )}

      {/* HEADER & VIEW TOGGLE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-1">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                  <Layers size={24} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Kế Hoạch Điều Phối</h2>
            </div>
            <p className="text-slate-500 font-bold ml-1 flex items-center gap-2">
               <CalendarIcon size={16} className="text-primary" />
               Quản lý đơn hàng tập trung & Theo dõi tải trọng thợ hoa
            </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="bg-slate-200/50 p-1.5 rounded-2xl flex shadow-inner">
                <button onClick={() => setViewType('LIST')} className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'LIST' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:bg-white/40'}`}><LayoutList size={16} /> Danh sách</button>
                <button onClick={() => setViewType('WEEKLY')} className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'WEEKLY' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:bg-white/40'}`}><Columns4 size={16} /> Lịch Tuần</button>
            </div>
            {onCreateOrder && (
              <button 
                onClick={() => onCreateOrder({ id: '', items: [] } as any)} 
                className="bg-primary text-white px-6 py-3 rounded-2xl hover:bg-pink-700 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-100"
              >
                <Plus size={20} /> Tạo Đơn
              </button>
            )}
        </div>
      </div>

      {/* WEEKLY CAPACITY OVERVIEW */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5"><BarChart3 size={300} /></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex gap-4 items-center">
                  <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-md">
                      <Zap size={32} className="text-amber-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-black tracking-tight">Dự báo tải trọng tuần</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Giới hạn vận hành: {MAX_CAPACITY_PER_DAY} đơn/ngày</p>
                  </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
                  <button onClick={() => changeWeek('prev')} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={20}/></button>
                  <div className="px-6 text-center cursor-pointer" onClick={goToToday}>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Kỳ điều phối</p>
                      <p className="font-bold text-sm">
                        {weekData[0].date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})} - {weekData[6].date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'})}
                      </p>
                  </div>
                  <button onClick={() => changeWeek('next')} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={20}/></button>
              </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mt-8 relative z-10">
              {weekData.map((day, idx) => (
                  <div key={idx} className={`space-y-3 cursor-pointer group/day`} onClick={() => setSelectedDayFilter(selectedDayFilter === idx ? null : idx)}>
                      <div className="flex justify-between items-end px-1">
                          <span className={`text-[10px] font-black uppercase ${day.isToday ? 'text-primary' : 'text-slate-400'}`}>{day.shortLabel}</span>
                          <span className={`text-xs font-black ${day.capacityPercent > 80 ? 'text-rose-400' : 'text-slate-200'}`}>{day.count} đơn</span>
                      </div>
                      <div className={`h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 transition-all ${selectedDayFilter === idx ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-900' : ''}`}>
                          <div 
                              className={`h-full transition-all duration-1000 ${day.capacityPercent > 80 ? 'bg-rose-500' : day.capacityPercent > 50 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                              style={{ width: `${day.capacityPercent}%` }}
                          ></div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm mã đơn, tên khách hoặc SĐT..." 
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-3 overflow-x-auto no-scrollbar">
                <select className="bg-slate-50 border-none rounded-3xl px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">Tất cả trạng thái</option>
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{STATUS_LABELS[s].toUpperCase()}</option>)}
                </select>
                <select className="bg-slate-50 border-none rounded-3xl px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer" value={timeSlotFilter} onChange={(e) => setTimeSlotFilter(e.target.value as any)}>
                    <option value="ALL">Toàn bộ buổi</option>
                    <option value="OVERDUE">Đã trễ hạn</option>
                    <option value="URGENT">Cần giao gấp (2h)</option>
                    <option value="MORNING">Sáng (Trước 12h)</option>
                    <option value="AFTERNOON">Chiều (12h - 18h)</option>
                    <option value="EVENING">Tối (Sau 18h)</option>
                </select>
                <button 
                  onClick={() => {setSearchTerm(''); setFilterStatus('ALL'); setTimeSlotFilter('ALL'); setSelectedDayFilter(null);}} 
                  className="px-6 py-4 bg-slate-100 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                >
                  Xóa Lọc
                </button>
             </div>
          </div>
      </div>

      {/* WEEKLY CALENDAR VIEW */}
      {viewType === 'WEEKLY' && (
          <div className="flex-1 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
              <div className="flex gap-6 min-w-[1800px] h-full">
                  {weekData.map((day, idx) => (
                      <div key={idx} className={`flex-1 min-w-[280px] rounded-[2.5rem] border flex flex-col transition-all duration-500 ${day.isToday ? 'bg-primary/[0.01] border-primary/20 shadow-xl scale-[1.01] z-10' : 'bg-white border-slate-100 shadow-sm'} ${selectedDayFilter !== null && selectedDayFilter !== idx ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                          {/* Day Header */}
                          <div className={`p-6 text-center border-b border-slate-50 ${day.isToday ? 'bg-primary/5 rounded-t-[2.5rem]' : 'bg-slate-50/50 rounded-t-[2.5rem]'}`}>
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${day.isToday ? 'text-primary' : 'text-slate-400'}`}>{day.label}</span>
                              <div className={`text-3xl font-black mt-1 ${day.isToday ? 'text-primary' : 'text-slate-800'}`}>{day.date.getDate()}</div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                                {day.count} đơn • {formatCurrency(day.revenue).replace('₫','')}
                              </p>
                          </div>
                          
                          {/* Slots Container */}
                          <div className="p-4 flex-1 overflow-y-auto space-y-8 no-scrollbar bg-white/50">
                              {/* BUỔI SÁNG */}
                              {(timeSlotFilter === 'ALL' || timeSlotFilter === 'MORNING' || timeSlotFilter === 'OVERDUE' || timeSlotFilter === 'URGENT') && day.slots.morning.length > 0 && (
                                  <div className="space-y-3">
                                      <h5 className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest pl-2">
                                          <Sunrise size={14} /> Buổi Sáng
                                      </h5>
                                      {day.slots.morning.map(order => <OrderCard key={order.id} order={order} dayLabel={day.shortLabel} />)}
                                  </div>
                              )}

                              {/* BUỔI CHIỀU */}
                              {(timeSlotFilter === 'ALL' || timeSlotFilter === 'AFTERNOON' || timeSlotFilter === 'OVERDUE' || timeSlotFilter === 'URGENT') && day.slots.afternoon.length > 0 && (
                                  <div className="space-y-3">
                                      <h5 className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest pl-2">
                                          <Sun size={14} /> Buổi Chiều
                                      </h5>
                                      {day.slots.afternoon.map(order => <OrderCard key={order.id} order={order} dayLabel={day.shortLabel} />)}
                                  </div>
                              )}

                              {/* BUỔI TỐI */}
                              {(timeSlotFilter === 'ALL' || timeSlotFilter === 'EVENING' || timeSlotFilter === 'OVERDUE' || timeSlotFilter === 'URGENT') && day.slots.evening.length > 0 && (
                                  <div className="space-y-3">
                                      <h5 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest pl-2">
                                          <Sunset size={14} /> Buổi Tối
                                      </h5>
                                      {day.slots.evening.map(order => <OrderCard key={order.id} order={order} dayLabel={day.shortLabel} />)}
                                  </div>
                              )}

                              {day.count === 0 && (
                                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                                      <Package size={40} className="text-slate-300" />
                                      <span className="text-[10px] font-black uppercase tracking-widest mt-3">Trống lịch giao</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* LIST VIEW (EXISTING) */}
      {viewType === 'LIST' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedOrders.map(order => {
                const { label, isOverdue } = getRelativeTimeInfo(order.deliveryTime, order.status);
                return (
                  <div key={order.id} className="bg-white border rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-5 group flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>{STATUS_LABELS[order.status]}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-300">#{order.id}</span>
                      </div>
                      
                      <div className="flex gap-4 mb-4 flex-1">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-800 text-base mb-1 truncate">{order.customerName}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                <Clock size={12} className={isOverdue ? 'text-rose-500 animate-pulse' : ''} /> {label}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium line-clamp-1"><Phone size={10} className="inline mr-1"/>{order.customerPhone}</p>
                        </div>
                        {order.completedImageUrl && (
                            <div 
                                onClick={() => setPreviewImage(order.completedImageUrl!)}
                                className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 cursor-zoom-in relative group/list-thumb shadow-sm"
                            >
                                <img src={order.completedImageUrl} className="w-full h-full object-cover transition-transform group-hover/list-thumb:scale-110" alt="Result" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/list-thumb:opacity-100 transition-opacity">
                                    <Maximize2 size={16} className="text-white" />
                                </div>
                            </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-sm font-black text-slate-900">{formatCurrency(order.totalAmount)}</span>
                          <button className="text-primary hover:underline text-[10px] font-black uppercase tracking-widest flex items-center gap-1">Chi tiết <ExternalLink size={12}/></button>
                      </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 bg-white px-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredOrders.length)} của {filteredOrders.length} đơn hàng
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border transition-all ${currentPage === 1 ? 'text-slate-200 border-slate-50 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border transition-all ${currentPage === totalPages ? 'text-slate-200 border-slate-50 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
      )}
    </div>
  );
};

export default OrderList;
