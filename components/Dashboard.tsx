
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, ShoppingBag, Truck, Clock, Target, Edit3, X, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { Order, OrderStatus, MonthlyTarget, OrderReminder } from '../types';

interface DashboardProps {
  orders: Order[];
  reminders?: OrderReminder[];
  onDeleteReminder?: (id: string) => void;
  onMarkReminderRead?: (id: string) => void;
  monthlyTargets?: MonthlyTarget[];
  onUpdateTarget?: (month: string, amount: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, reminders = [], onDeleteReminder, onMarkReminderRead, monthlyTargets = [], onUpdateTarget }) => {
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetForm, setTargetForm] = useState({ month: new Date().toISOString().slice(0, 7), amount: 0 });

  // --- Calculate Overall Stats ---
  const revenue = orders
    .filter(o => o.status !== OrderStatus.CANCELED)
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  const newOrders = orders.filter(o => o.status === OrderStatus.NEW).length;
  const processingOrders = orders.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.ASSIGNED).length;
  const deliveringOrders = orders.filter(o => o.status === OrderStatus.DELIVERING).length;

  // --- Calculate Monthly Target Progress ---
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthTarget = monthlyTargets.find(t => t.month === currentMonthStr)?.targetAmount || 0;
  
  // Calculate actual revenue for CURRENT MONTH ONLY
  const currentMonthRevenue = orders
    .filter(o => o.status !== OrderStatus.CANCELED && o.createdAt.startsWith(currentMonthStr))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const progressPercent = currentMonthTarget > 0 
    ? Math.min(100, (currentMonthRevenue / currentMonthTarget) * 100) 
    : 0;

  // --- Mock data for the weekly chart ---
  const data = [
    { name: 'T2', revenue: 4000000 },
    { name: 'T3', revenue: 3000000 },
    { name: 'T4', revenue: 5500000 },
    { name: 'T5', revenue: 4500000 },
    { name: 'T6', revenue: 8000000 },
    { name: 'T7', revenue: 12000000 },
    { name: 'CN', revenue: 9500000 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- Handlers ---
  const openTargetModal = () => {
    const existing = monthlyTargets.find(t => t.month === currentMonthStr);
    setTargetForm({
      month: currentMonthStr,
      amount: existing ? existing.targetAmount : 0
    });
    setIsTargetModalOpen(true);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateTarget) {
      onUpdateTarget(targetForm.month, Number(targetForm.amount));
    }
    setIsTargetModalOpen(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const upcomingReminders = reminders
    .filter(r => !r.isRead)
    .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Target Setting Modal */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Thiết lập mục tiêu</h3>
              <button onClick={() => setIsTargetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
                <input 
                  type="month" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={targetForm.month}
                  onChange={e => setTargetForm({...targetForm, month: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu doanh thu (VNĐ)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-primary"
                  value={targetForm.amount}
                  onChange={e => setTargetForm({...targetForm, amount: Number(e.target.value)})}
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsTargetModalOpen(false)} className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium">Hủy</button>
                <button type="submit" className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-pink-600">Lưu mục tiêu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan Kinh doanh</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Target Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={100} className="text-primary" />
          </div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Target className="text-primary" size={20} />
                Mục tiêu Doanh số tháng {new Date(currentMonthStr).getMonth() + 1}
              </h3>
              <p className="text-gray-500 text-sm">Theo dõi tiến độ doanh thu thực tế so với kế hoạch.</p>
            </div>
            <button 
              onClick={openTargetModal}
              className="flex items-center gap-1 text-sm bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary transition-colors"
            >
              <Edit3 size={14} /> Thiết lập
            </button>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-3xl font-bold text-gray-800">{formatCurrency(currentMonthRevenue)}</span>
                <span className="text-gray-400 text-sm ml-2">/ {formatCurrency(currentMonthTarget)}</span>
              </div>
              <div className={`font-bold ${progressPercent >= 100 ? 'text-green-500' : 'text-primary'}`}>
                {progressPercent.toFixed(1)}%
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPercent >= 100 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-primary to-pink-400'}`}
                style={{ width: `${progressPercent}%` }}
              >
                  {progressPercent > 5 && (
                      <div className="w-full h-full animate-pulse bg-white/20"></div>
                  )}
              </div>
            </div>
            {currentMonthTarget === 0 && (
              <p className="text-xs text-red-400 mt-2 italic">Chưa thiết lập mục tiêu cho tháng này.</p>
            )}
          </div>
        </div>

        {/* Reminders / Notifications Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Bell className="text-blue-500" size={20} />
              Nhắc nhở sắp tới
            </h3>
            {reminders.filter(r => !r.isRead).length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {reminders.filter(r => !r.isRead).length} Mới
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[160px] no-scrollbar">
            {upcomingReminders.map(reminder => (
              <div key={reminder.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(reminder.remindAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(reminder.remindAt).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onMarkReminderRead?.(reminder.id)} className="text-blue-500 hover:text-blue-700" title="Đánh dấu xong">
                      <CheckCircle2 size={14} />
                    </button>
                    <button onClick={() => onDeleteReminder?.(reminder.id)} className="text-gray-400 hover:text-red-500" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-800 font-bold mb-1 truncate">#{reminder.orderId} - {reminder.customerName}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1 italic">{reminder.note}</p>
              </div>
            ))}
            {upcomingReminders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Bell size={24} className="opacity-20 mb-2" />
                <p className="text-xs italic">Không có nhắc nhở nào</p>
              </div>
            )}
          </div>
          {reminders.length > 5 && (
            <button className="mt-3 text-xs text-primary font-bold hover:underline self-center">Xem tất cả</button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh thu (Toàn thời gian)" 
          value={formatCurrency(revenue)} 
          icon={DollarSign} 
          color="bg-primary" 
        />
        <StatCard 
          title="Đơn Mới" 
          value={newOrders} 
          icon={ShoppingBag} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Đang Xử lý" 
          value={processingOrders} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Đang Giao" 
          value={deliveringOrders} 
          icon={Truck} 
          color="bg-secondary" 
        />
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu Tuần</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af'}} 
                tickFormatter={(value) => `${value/1000000}tr`} 
              />
              <Tooltip 
                cursor={{fill: '#fdf2f8'}} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 || index === 6 ? '#ec4899' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
