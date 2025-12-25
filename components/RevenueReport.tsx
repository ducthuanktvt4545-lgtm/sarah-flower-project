
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Calendar, TrendingUp, ShoppingCart, ListChecks, BarChart3 } from 'lucide-react';
import WeeklyAnalytics from './WeeklyAnalytics';

interface RevenueReportProps {
  orders: Order[];
}

type TimeRange = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

const RevenueReport: React.FC<RevenueReportProps> = ({ orders }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('WEEK');
  const [dateCursor, setDateCursor] = useState(new Date());
  const [activeSubTab, setActiveSubTab] = useState<'chart' | 'weekly_stats'>('chart');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStartEndDate = () => {
    const start = new Date(dateCursor);
    const end = new Date(dateCursor);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    switch (timeRange) {
      case 'DAY':
        break;
      case 'WEEK':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        end.setDate(diff + 6);
        break;
      case 'MONTH':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'QUARTER':
        const currentMonth = start.getMonth();
        const startMonth = Math.floor(currentMonth / 3) * 3;
        start.setMonth(startMonth, 1);
        end.setMonth(startMonth + 3, 0);
        break;
      case 'YEAR':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }
    return { start, end };
  };

  const { start, end } = getStartEndDate();

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end && o.status !== OrderStatus.CANCELED;
    });
  }, [orders, start, end]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, avgOrderValue };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const data: { name: string, revenue: number, count: number }[] = [];
    
    if (timeRange === 'DAY') {
       // Hourly
       for(let i=7; i<=21; i++) {
           data.push({ name: `${i}h`, revenue: 0, count: 0 });
       }
       filteredOrders.forEach(o => {
           const h = new Date(o.createdAt).getHours();
           const item = data.find(d => parseInt(d.name) === h);
           if (item) {
               item.revenue += o.totalAmount;
               item.count += 1;
           }
       });
    } else if (timeRange === 'WEEK') {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        days.forEach(d => data.push({ name: d, revenue: 0, count: 0 }));
        filteredOrders.forEach(o => {
            let dayIndex = new Date(o.createdAt).getDay() - 1; // Mon=1 -> 0
            if (dayIndex === -1) dayIndex = 6; // Sun=0 -> 6
            data[dayIndex].revenue += o.totalAmount;
            data[dayIndex].count += 1;
        });
    } else if (timeRange === 'MONTH') {
        const lastDay = end.getDate();
        for (let i = 1; i <= lastDay; i++) {
            data.push({ name: `${i}`, revenue: 0, count: 0 });
        }
        filteredOrders.forEach(o => {
            const d = new Date(o.createdAt).getDate();
            data[d-1].revenue += o.totalAmount;
            data[d-1].count += 1;
        });
    } else if (timeRange === 'QUARTER' || timeRange === 'YEAR') {
        const startMonth = start.getMonth();
        const endMonth = end.getMonth();
        for (let i = startMonth; i <= endMonth; i++) {
            data.push({ name: `Thg ${i + 1}`, revenue: 0, count: 0 });
        }
        filteredOrders.forEach(o => {
             const m = new Date(o.createdAt).getMonth();
             const index = m - startMonth;
             if (data[index]) {
                 data[index].revenue += o.totalAmount;
                 data[index].count += 1;
             }
        });
    }

    return data;
  }, [filteredOrders, timeRange, start, end]);

  const getRangeLabel = () => {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
      if (timeRange === 'DAY') return start.toLocaleDateString('vi-VN', options);
      return `${start.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', options)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Báo Cáo Doanh Thu</h2>
        
        <div className="bg-white p-1 rounded-lg border border-gray-200 flex flex-wrap gap-1 shadow-sm">
            {(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as TimeRange[]).map(r => (
                <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        timeRange === r 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {r === 'DAY' ? 'Ngày' : r === 'WEEK' ? 'Tuần' : r === 'MONTH' ? 'Tháng' : r === 'QUARTER' ? 'Quý' : 'Năm'}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800">
             <Calendar size={20} />
             <span className="font-semibold">{getRangeLabel()}</span>
          </div>
          <div className="text-xs text-blue-600 italic">
              *Dữ liệu hiển thị theo thời gian tạo đơn
          </div>
      </div>

      {/* Statistics Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveSubTab('chart')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeSubTab === 'chart' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <BarChart3 size={16} /> Biểu đồ tổng quan
          </button>
          <button 
            onClick={() => {
                setActiveSubTab('weekly_stats');
                setTimeRange('WEEK'); // Ensure we are in week mode for statistics
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeSubTab === 'weekly_stats' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <ListChecks size={16} /> Thống kê theo Thứ
          </button>
      </div>

      {activeSubTab === 'chart' ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-pink-100 text-pink-600 rounded-full"><DollarSign size={24}/></div>
                        <h3 className="text-gray-500 font-medium">Tổng Doanh Thu</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart size={24}/></div>
                        <h3 className="text-gray-500 font-medium">Tổng Đơn Hàng</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalOrders} đơn</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full"><TrendingUp size={24}/></div>
                        <h3 className="text-gray-500 font-medium">Trung Bình / Đơn</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.avgOrderValue)}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ Doanh thu</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                        <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12}} 
                        tickFormatter={(value) => `${value/1000000}tr`} 
                        />
                        <Tooltip 
                        cursor={{fill: '#fdf2f8'}} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                        />
                        <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#ec4899' : '#f3f4f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
      ) : (
          <WeeklyAnalytics orders={orders} currentDate={dateCursor} />
      )}

      {/* Detailed List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Danh sách đơn hàng phát sinh</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-3">Mã đơn</th>
                        <th className="px-6 py-3">Ngày tạo</th>
                        <th className="px-6 py-3">Khách hàng</th>
                        <th className="px-6 py-3 text-right">Giá trị</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-900">{order.id}</td>
                            <td className="px-6 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</td>
                            <td className="px-6 py-3 text-gray-600">{order.customerName}</td>
                            <td className="px-6 py-3 text-right font-bold text-gray-800">{formatCurrency(order.totalAmount)}</td>
                        </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">Không phát sinh doanh thu trong giai đoạn này</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
