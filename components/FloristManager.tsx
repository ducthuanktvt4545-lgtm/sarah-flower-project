
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { MOCK_FLORISTS } from '../constants';
import { User, Award, CheckCircle, Clock, DollarSign, Calendar, BarChart3 } from 'lucide-react';

interface FloristManagerProps {
  orders: Order[];
}

const FloristManager: React.FC<FloristManagerProps> = ({ orders }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getFloristStats = (floristId: string) => {
    // Filter orders by florist and month (using createdAt for simplicity, in real app use completedAt)
    const floristOrders = orders.filter(o => {
      const isFlorist = o.assignedFloristId === floristId;
      const isCompleted = o.status === OrderStatus.READY || o.status === OrderStatus.DELIVERING || o.status === OrderStatus.COMPLETED;
      const isMonth = o.createdAt.startsWith(selectedMonth);
      return isFlorist && isCompleted && isMonth;
    });

    const completedCount = floristOrders.length;
    const totalRevenue = floristOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Mock "On Time" calculation: Randomly between 90% - 100% seeded by ID length for consistency
    const onTimeRate = completedCount > 0 ? Math.min(100, 90 + (floristId.length % 10)) : 100;

    return { completedCount, totalRevenue, onTimeRate };
  };

  const getRank = (count: number, onTime: number) => {
    if (count >= 10 && onTime >= 98) return { label: 'Xuất Sắc', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (count >= 5 && onTime >= 95) return { label: 'Tốt', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { label: 'Khá', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  // Pre-calculate stats for rendering
  const floristStats = MOCK_FLORISTS.map(florist => {
    const stats = getFloristStats(florist.id);
    const rank = getRank(stats.completedCount, stats.onTimeRate);
    return { ...florist, stats, rank };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Đánh Giá Hiệu Suất Thợ Hoa</h2>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar size={18} className="text-gray-500" />
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="outline-none text-gray-700 bg-transparent text-sm"
          />
        </div>
      </div>

      {/* KPI Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary"/>
                Bảng Tổng Hợp KPI Tháng {selectedMonth.split('-')[1]}
             </h3>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-500">
                   <tr>
                      <th className="px-6 py-3">Thợ hoa</th>
                      <th className="px-6 py-3 text-center">Đơn hoàn thành</th>
                      <th className="px-6 py-3 text-center">Tỷ lệ đúng hạn</th>
                      <th className="px-6 py-3 text-right">Doanh thu đóng góp</th>
                      <th className="px-6 py-3 text-center">Xếp loại</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                   {floristStats.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                         <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                         </td>
                         <td className="px-6 py-3 text-center font-bold text-gray-700">{item.stats.completedCount}</td>
                         <td className="px-6 py-3 text-center">
                            <span className={`font-bold ${item.stats.onTimeRate >= 95 ? 'text-green-600' : 'text-orange-500'}`}>
                               {item.stats.onTimeRate}%
                            </span>
                         </td>
                         <td className="px-6 py-3 text-right text-gray-600">{formatCurrency(item.stats.totalRevenue)}</td>
                         <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${item.rank.color}`}>
                               {item.rank.label}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
         </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floristStats.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                       <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                       <p className="text-xs text-gray-500">Tham gia: {new Date(item.joinDate).toLocaleDateString('vi-VN')}</p>
                     </div>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.rank.color} flex items-center gap-1`}>
                      <Award size={14} /> {item.rank.label}
                   </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle size={18} className="text-secondary" />
                      <span className="text-sm font-medium">Đơn hoàn thành</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{item.stats.completedCount}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={18} className="text-blue-500" />
                      <span className="text-sm font-medium">Đúng hạn</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{item.stats.onTimeRate}%</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={18} className="text-orange-500" />
                      <span className="text-sm font-medium">Doanh thu tạo ra</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(item.stats.totalRevenue)}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors">
                      Xem chi tiết lịch sử
                  </button>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default FloristManager;
