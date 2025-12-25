
import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Truck, Box, Menu, X, LogOut, Flower2, 
  Image as ImageIcon, Users, Award, CalendarDays, BarChart3, ClipboardList, 
  Briefcase, Wallet, UserRoundCheck, Building2, ShieldCheck, Globe, BrainCircuit,
  ShoppingCart
} from 'lucide-react';
import { UserRole, OrderStatus, Order, Product, FlowerSample, Branch, MonthlyTarget, Contract, PurchaseItem } from './types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_SAMPLES, NAV_ITEMS, ROLE_LABELS, BRANCHES, MOCK_CONTRACTS } from './constants';
import Dashboard from './components/Dashboard';
import OrderList from './components/OrderList';
import FloristBoard from './components/FloristBoard';
import Inventory from './components/Inventory';
import FlowerCatalog from './components/FlowerCatalog';
import CustomerList from './components/CustomerList';
import FloristManager from './components/FloristManager';
import OrderCalendar from './components/OrderCalendar';
import RevenueReport from './components/RevenueReport';
import AccountingManager from './components/AccountingManager';
import EmployeeManager from './components/EmployeeManager';
import ProjectManager from './components/ProjectManager';
import FloristAI from './components/FloristAI';
import PurchasingPlan from './components/PurchasingPlan';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.ADMIN);
  const [currentBranch, setCurrentBranch] = useState<Branch>(BRANCHES[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  
  // State quản lý mục tiêu doanh thu hàng tháng
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([
    { month: '2026-01', targetAmount: 50000000 }, 
    { month: '2026-02', targetAmount: 75000000 }
  ]);

  const handleUpdateStatus = (orderId: string, status: OrderStatus, extraData?: any) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, ...extraData } : o));
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleCreateContract = (newContract: Contract) => {
    setContracts(prev => [newContract, ...prev]);
  };

  const handleRestock = (purchaseItems: PurchaseItem[]) => {
    setProducts(prev => prev.map(p => {
        const item = purchaseItems.find(i => i.productId === p.id);
        if (item) {
            return { ...p, stock: p.stock + item.buyQuantity };
        }
        return p;
    }));
  };

  const handleUpdateTarget = (month: string, amount: number) => {
    setMonthlyTargets(prev => {
      const index = prev.findIndex(t => t.month === month);
      if (index >= 0) {
        const newTargets = [...prev];
        newTargets[index] = { month, targetAmount: amount };
        return newTargets;
      }
      return [...prev, { month, targetAmount: amount }];
    });
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === UserRole.FLORIST) setActiveTab('kanban');
    else if (role === UserRole.SHIPPER) setActiveTab('orders');
    else setActiveTab('dashboard');
    setIsMobileMenuOpen(false);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard size={20} />;
      case 'employees': return <UserRoundCheck size={20} />;
      case 'orders': return <ShoppingBag size={20} />;
      case 'kanban-ai': return <BrainCircuit size={20} />;
      case 'contracts': return <Briefcase size={20} />;
      case 'accounting': return <Wallet size={20} />;
      case 'customers': return <Users size={20} />;
      case 'kanban': return <Flower2 size={20} />;
      case 'inventory': return <Box size={20} />;
      case 'purchasing': return <ShoppingCart size={20} />;
      default: return <Box size={20} />;
    }
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-luxury border-r border-slate-700 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col text-slate-300">
        <div className="h-20 flex items-center px-6 border-b border-slate-700 bg-slate-900">
          <div className="bg-primary p-2 rounded-xl mr-3 shadow-lg shadow-pink-900/20">
            <Flower2 className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            BloomFlow <span className="text-[10px] text-gold uppercase align-top ml-1">Master</span>
          </span>
        </div>

        <div className="p-4 px-6 border-b border-slate-700">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Globe size={10} /> Chi nhánh đang làm việc
           </p>
           <div className="relative group">
              <select 
                value={currentBranch.id}
                onChange={(e) => setCurrentBranch(BRANCHES.find(b => b.id === e.target.value)!)}
                className="w-full bg-slate-800 border border-slate-600 text-white text-xs font-bold py-3 px-4 rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 outline-none"
              >
                {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <Building2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.filter(item => item.roles.includes(currentRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-primary text-white font-bold shadow-xl shadow-pink-900/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}>{getIcon(item.id)}</span>
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/20">
            <p className="text-[9px] font-black text-slate-500 mb-3 uppercase tracking-widest">Quyền truy cập (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
                {Object.values(UserRole).map(role => (
                    <button 
                        key={role}
                        onClick={() => switchRole(role)}
                        className={`text-[9px] py-2 rounded-lg font-black uppercase border ${currentRole === role ? 'bg-primary border-primary text-white' : 'border-slate-600 text-slate-500 hover:bg-slate-700'}`}
                    >
                        {role}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black border-2 border-slate-800 shadow-lg">
              {currentRole[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">Hệ thống Master</p>
              <p className="text-[10px] text-slate-500 truncate font-bold">{ROLE_LABELS[currentRole]}</p>
            </div>
            <button className="text-slate-500 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background font-sans">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:hidden z-30">
          <div className="flex items-center gap-2">
            <Flower2 className="text-primary" size={24} />
            <span className="font-black text-slate-900 tracking-tighter">BloomFlow Master</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-10 no-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                orders={orders} 
                monthlyTargets={monthlyTargets}
                onUpdateTarget={handleUpdateTarget}
              />
            )}
            {activeTab === 'orders' && (
              <OrderList 
                orders={orders.filter(o => o.branchId === currentBranch.id)} 
                onUpdateStatus={handleUpdateStatus} 
                onCreateOrder={handleCreateOrder} 
                products={products} 
              />
            )}
            {activeTab === 'kanban-ai' && <FloristAI />}
            {activeTab === 'contracts' && (
              <ProjectManager 
                contracts={contracts} 
                onCreateContract={handleCreateContract} 
              />
            )}
            {activeTab === 'accounting' && <AccountingManager orders={orders} />}
            {activeTab === 'customers' && <CustomerList orders={orders} />}
            {activeTab === 'kanban' && <FloristBoard orders={orders.filter(o => o.branchId === currentBranch.id)} onUpdateStatus={handleUpdateStatus} products={products} />}
            {activeTab === 'inventory' && <Inventory products={products} />}
            {activeTab === 'purchasing' && <PurchasingPlan products={products} orders={orders} onRestock={handleRestock} />}
            {activeTab === 'employees' && <EmployeeManager />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
