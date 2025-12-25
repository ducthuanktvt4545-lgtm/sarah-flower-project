
import React from 'react';
import { Order, OrderStatus } from '../types';
import { 
  TrendingUp, TrendingDown, ShoppingBag, CheckCircle, 
  XCircle, Star, Calendar, ArrowRight, BarChart2 
} from 'lucide-react';

interface WeeklyAnalyticsProps {
  orders: Order[];
  currentDate: Date;
}

const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({ orders, currentDate }) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  // Process data for each day
  const dailyStats = weekDays.map((day, index) => {
    const dayOrders = orders.filter(o => isSameDay(new Date(o.createdAt), day));
    const dayName = index === 6 ? 'Chủ Nhật' : `Thứ ${index + 2}`;
    const totalRevenue = dayOrders
      .filter(o => o.status !== OrderStatus.CANCELED)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const completed = dayOrders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const canceled = dayOrders.filter(o => o.status === OrderStatus.CANCELED).length;

    return {
      dayName,
      date: day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      totalOrders: dayOrders.length,
      revenue: totalRevenue,
      completed,
      canceled,
      successRate: dayOrders.length > 0 ? (completed / dayOrders.length) * 100 : 0
    };
  });

  const totalWeekRevenue = dailyStats.reduce((sum, d) => sum + d.revenue, 0);
  const peakDay = [...dailyStats].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl text-white shadow-lg">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Doanh thu tuần này</p>
           <div className="text-2xl font-black text-pink-400">{formatCurrency(totalWeekRevenue)}</div>
           <div className="flex items-center gap-1 text-[10px] mt-2 text-slate-400">
              <Calendar size={12} /> {weekDays[0].toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Star size={24} fill="currentColor" />
           </div>
           <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ngày cao điểm</p>
              <div className="text-xl font-black text-gray-800">{peakDay.dayName}</div>
              <p className="text-xs text-yellow-600 font-bold">{formatCurrency(peakDay.revenue)}</p>
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tỷ lệ hoàn thành TB</p>
              <div className="text-xl font-black text-gray-800">
                 {(dailyStats.reduce((sum, d) => sum + d.successRate, 0) / 7).toFixed(1)}%
              </div>
              <p className="text-xs text-emerald-600 font-bold">Hiệu suất vận hành ổn định</p>
           </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 size={18} className="text-primary" />
                Thống kê chi tiết theo từng Thứ
            </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-black uppercase text-slate-400 border-b">
              <tr>
                <th className="px-6 py-4">Thứ / Ngày</th>
                <th className="px-6 py-4 text-center">Số đơn</th>
                <th className="px-6 py-4 text-right">Doanh thu ngày</th>
                <th className="px-6 py-4 text-center">Hoàn thành</th>
                <th className="px-6 py-4 text-center">Hủy</th>
                <th className="px-6 py-4">Tiến độ doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyStats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800">{stat.dayName}</div>
                    <div className="text-[10px] text-slate-400">{stat.date}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-black">
                        <ShoppingBag size={12} /> {stat.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-800">{formatCurrency(stat.revenue)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex flex-col items-center">
                        <span className="text-emerald-600 font-bold">{stat.completed}</span>
                        <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                           <div 
                             className="h-full bg-emerald-500" 
                             style={{ width: `${stat.successRate}%` }}
                           ></div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${stat.canceled > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                        {stat.canceled}
                    </span>
                  </td>
                  <td className="px-6 py-4 min-w-[150px]">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-primary" 
                             style={{ width: `${totalWeekRevenue > 0 ? (stat.revenue / totalWeekRevenue) * 100 : 0}%` }}
                           ></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 w-8">
                            {totalWeekRevenue > 0 ? ((stat.revenue / totalWeekRevenue) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Comparison */}
      <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg text-primary shadow-sm">
                <TrendingUp size={20} />
             </div>
             <div>
                <p className="text-xs font-bold text-pink-700">Chiến lược đề xuất</p>
                <p className="text-[11px] text-pink-600">Dựa vào dữ liệu, <span className="font-bold">{peakDay.dayName}</span> là ngày bận rộn nhất. Hãy tăng cường nhân sự thợ cắm vào ngày này.</p>
             </div>
          </div>
          <ArrowRight className="text-pink-300" />
      </div>
    </div>
  );
};

export default WeeklyAnalytics;
