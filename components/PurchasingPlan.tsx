
import React, { useState, useMemo, useEffect } from 'react';
import { Product, PurchaseItem, Order, OrderStatus } from '../types';
import { 
  ShoppingCart, 
  RefreshCw, 
  Save, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Package, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Zap,
  PartyPopper,
  Download,
  Search,
  ChevronRight,
  Calculator
} from 'lucide-react';

interface PurchasingPlanProps {
  products: Product[];
  orders: Order[];
  onRestock: (items: PurchaseItem[]) => void;
}

type PlanMode = 'DAILY' | 'WEEKLY' | 'HOLIDAY';

const PurchasingPlan: React.FC<PurchasingPlanProps> = ({ products, orders, onRestock }) => {
  const [planItems, setPlanItems] = useState<PurchaseItem[]>([]);
  const [activeMode, setActiveMode] = useState<PlanMode>('DAILY');
  const [isLoading, setIsLoading] = useState(false);
  const [holidayMultiplier, setHolidayMultiplier] = useState(3.5); // Hệ số nhập hàng ngày lễ

  // --- Logic 1: DAILY PLAN (Low stock + Today's Needs) ---
  const generateDailyPlan = () => {
    setIsLoading(true);
    // Lấy nguyên liệu từ các đơn hàng cần giao trong ngày hôm nay
    const todayStr = new Date('2026-01-05').toISOString().slice(0, 10); // Mock today
    const todayOrders = orders.filter(o => o.deliveryTime.startsWith(todayStr) && o.status !== OrderStatus.CANCELED);
    
    const neededFromOrders: Record<string, number> = {};
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product && product.recipe) {
                product.recipe.forEach(ing => {
                    neededFromOrders[ing.materialId] = (neededFromOrders[ing.materialId] || 0) + (ing.quantity * item.quantity);
                });
            } else {
                neededFromOrders[item.productId] = (neededFromOrders[item.productId] || 0) + item.quantity;
            }
        });
    });

    const suggestions: PurchaseItem[] = products
      .filter(p => p.stock <= 20 || neededFromOrders[p.id])
      .map(p => {
        const orderNeed = neededFromOrders[p.id] || 0;
        const buyQty = Math.max(50, Math.ceil(orderNeed * 1.2)); // Buffer 20%
        return {
          productId: p.id,
          productName: p.name,
          type: p.type,
          unit: p.unit,
          currentStock: p.stock,
          buyQuantity: buyQty,
          estimatedCost: p.price * 0.7 * buyQty
        };
      });
    
    setPlanItems(suggestions);
    setIsLoading(false);
  };

  // --- Logic 2: WEEKLY FORECAST (Next 7 days orders) ---
  const generateWeeklyPlan = () => {
    setIsLoading(true);
    const suggestions: PurchaseItem[] = products
      .filter(p => p.type === 'FLOWER')
      .map(p => {
        const avgWeeklyUsage = 150; // Giả lập dữ liệu lịch sử
        const buyQty = Math.max(0, avgWeeklyUsage - p.stock);
        return {
          productId: p.id,
          productName: p.name,
          type: p.type,
          unit: p.unit,
          currentStock: p.stock,
          buyQuantity: buyQty || 200,
          estimatedCost: p.price * 0.65 * (buyQty || 200) // Giá sỉ rẻ hơn
        };
      });
    setPlanItems(suggestions.filter(s => s.buyQuantity > 0));
    setIsLoading(false);
  };

  // --- Logic 3: HOLIDAY PREP (Multiplier based) ---
  const generateHolidayPlan = () => {
    setIsLoading(true);
    const suggestions: PurchaseItem[] = products
      .filter(p => p.type === 'FLOWER')
      .map(p => {
        const baseQty = 100;
        const buyQty = Math.round(baseQty * holidayMultiplier);
        return {
          productId: p.id,
          productName: p.name,
          type: p.type,
          unit: p.unit,
          currentStock: p.stock,
          buyQuantity: buyQty,
          estimatedCost: p.price * 0.75 * buyQty // Ngày lễ giá nhập có thể cao hơn
        };
      });
    setPlanItems(suggestions);
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeMode === 'DAILY') generateDailyPlan();
    if (activeMode === 'WEEKLY') generateWeeklyPlan();
    if (activeMode === 'HOLIDAY') generateHolidayPlan();
  }, [activeMode, holidayMultiplier]);

  const handleConfirmRestock = () => {
    if (planItems.length === 0) return;
    if (confirm('Xác nhận nhập kho theo kế hoạch này?')) {
        onRestock(planItems);
        setPlanItems([]);
        alert('Đã cập nhật tồn kho thành công!');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalCost = planItems.reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header View */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-200">
                  <Calculator size={28} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kế Hoạch Nhập Hàng</h2>
            </div>
            <p className="text-slate-500 font-bold ml-1 flex items-center gap-2">
               <Zap size={16} className="text-primary" />
               Dự báo thông minh dựa trên Đơn hàng & Lịch sử kinh doanh
            </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={() => {}} // Export CSV logic
                className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-sm active:scale-95"
            >
                <Download size={18} />
                <span>Xuất Market List</span>
            </button>
            <button 
                onClick={handleConfirmRestock}
                disabled={planItems.length === 0}
                className="flex-[2] md:flex-none bg-primary text-white px-8 py-4 rounded-2xl hover:bg-pink-700 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-200 active:scale-95 disabled:opacity-50"
            >
                <Save size={18} />
                <span>Chốt & Nhập Kho</span>
            </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setActiveMode('DAILY')}
            className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                activeMode === 'DAILY' ? 'border-primary bg-pink-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
             <div className={`p-4 rounded-2xl transition-all ${activeMode === 'DAILY' ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                <Calendar size={28} />
             </div>
             <div className="text-center">
                <h4 className={`font-black uppercase text-xs tracking-widest ${activeMode === 'DAILY' ? 'text-primary' : 'text-slate-600'}`}>Đi chợ hàng ngày</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Theo đơn POS hôm nay</p>
             </div>
             {activeMode === 'DAILY' && <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full"><CheckSquare size={12}/></div>}
          </button>

          <button 
            onClick={() => setActiveMode('WEEKLY')}
            className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                activeMode === 'WEEKLY' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
             <div className={`p-4 rounded-2xl transition-all ${activeMode === 'WEEKLY' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                <TrendingUp size={28} />
             </div>
             <div className="text-center">
                <h4 className={`font-black uppercase text-xs tracking-widest ${activeMode === 'WEEKLY' ? 'text-indigo-600' : 'text-slate-600'}`}>Dự báo lịch tuần</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Theo tiến độ Event & Retail</p>
             </div>
          </button>

          <button 
            onClick={() => setActiveMode('HOLIDAY')}
            className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                activeMode === 'HOLIDAY' ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
             <div className={`p-4 rounded-2xl transition-all ${activeMode === 'HOLIDAY' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                <PartyPopper size={28} />
             </div>
             <div className="text-center">
                <h4 className={`font-black uppercase text-xs tracking-widest ${activeMode === 'HOLIDAY' ? 'text-amber-600' : 'text-slate-600'}`}>Chuẩn bị mùa lễ</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Valentine, 8/3, 20/10...</p>
             </div>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List Table */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                        <ShoppingCart size={16} className="text-primary" /> Danh sách mua hàng dự kiến
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" placeholder="Tìm nhanh mặt hàng..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Nguyên liệu</th>
                                <th className="px-8 py-5 text-center">Tồn kho</th>
                                <th className="px-8 py-5 text-center w-32">SL Nhập</th>
                                <th className="px-8 py-5 text-right">Dự trù (70%)</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {planItems.map(item => (
                                <tr key={item.productId} className="hover:bg-slate-50/50 group transition-all">
                                    <td className="px-8 py-4">
                                        <div className="font-black text-slate-800 text-sm">{item.productName}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Đơn vị: {item.unit}</div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className={`text-xs font-black ${item.currentStock <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>
                                            {item.currentStock}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-100 border-none rounded-xl px-3 py-2 text-center text-xs font-black text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={item.buyQuantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setPlanItems(prev => prev.map(p => p.productId === item.productId ? {...p, buyQuantity: val, estimatedCost: val * products.find(prod => prod.id === p.productId)!.price * 0.7} : p));
                                            }}
                                        />
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="font-black text-slate-900 text-sm">{formatCurrency(item.estimatedCost)}</div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button onClick={() => setPlanItems(prev => prev.filter(p => p.productId !== item.productId))} className="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {planItems.length === 0 && (
                    <div className="py-20 text-center">
                        <Package size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-300 font-black text-xs uppercase tracking-widest">Không có mặt hàng nào cần nhập</p>
                    </div>
                )}
              </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
              {activeMode === 'HOLIDAY' && (
                  <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 animate-fade-in">
                      <h4 className="font-black text-amber-800 uppercase text-[10px] tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Calculator size={14}/> Cấu hình hệ số Lễ
                      </h4>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-amber-600">Hệ số dự trữ: x{holidayMultiplier}</span>
                              <span className="text-[10px] bg-amber-500 text-white px-2 py-1 rounded font-black">HIGH RISK</span>
                          </div>
                          <input 
                            type="range" min="1" max="10" step="0.5" 
                            className="w-full accent-amber-500"
                            value={holidayMultiplier}
                            onChange={(e) => setHolidayMultiplier(parseFloat(e.target.value))}
                          />
                          <p className="text-[10px] text-amber-500 italic font-medium">Hệ số này sẽ nhân sản lượng tiêu thụ trung bình lên để đảm bảo không đứt gãy nguồn cung ngày Lễ.</p>
                      </div>
                  </div>
              )}

              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Calculator size={100}/></div>
                  <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Tổng dự trù ngân sách</p>
                      <h3 className="text-4xl font-black text-primary tracking-tighter mb-2">{formatCurrency(totalCost)}</h3>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-tighter">
                          <TrendingUp size={16} /> Tiết kiệm 15% (Giá nhập sỉ)
                      </div>
                  </div>

                  <div className="relative z-10 space-y-4 pt-8 border-t border-white/10">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Tổng mặt hàng</span>
                          <span className="font-black">{planItems.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Tổng số lượng</span>
                          <span className="font-black">{planItems.reduce((sum, i) => sum + i.buyQuantity, 0)} {planItems[0]?.unit || 'đv'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Ngày chốt sổ</span>
                          <span className="font-black">Hôm nay</span>
                      </div>
                  </div>

                  <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4 group">
                      <div className="p-3 bg-primary text-white rounded-2xl shadow-lg transition-transform group-hover:scale-110">
                          <Zap size={20} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gợi ý AI</p>
                          <p className="text-[11px] font-bold text-slate-300 leading-snug">Nhập thêm <span className="text-primary">Hoa Ly</span> do cuối tuần có 3 Event cưới lớn.</p>
                      </div>
                  </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
                  <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" /> Lưu ý vận hành
                  </h4>
                  <ul className="space-y-3">
                      <li className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                          <ChevronRight size={12} className="text-primary" /> Kiểm tra hoa tươi ngay khi nhận hàng
                      </li>
                      <li className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                          <ChevronRight size={12} className="text-primary" /> Ưu tiên nhập hoa nụ cho kế hoạch tuần
                      </li>
                      <li className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                          <ChevronRight size={12} className="text-primary" /> Đối soát hóa đơn sỉ với nhà cung cấp
                      </li>
                  </ul>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PurchasingPlan;
