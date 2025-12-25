
import React, { useState, useMemo } from 'react';
import { Order, EInvoice, InvoiceStatus, AuditLogEntry, TaxRule } from '../types';
import { TAX_RULES, MOCK_ORDERS } from '../constants';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, ShieldCheck, 
  Landmark, Building2, Gavel, Settings2, Info, History, 
  FileCheck, Download, FileEdit, ExternalLink, ChevronDown,
  BarChart3, RefreshCw, AlertTriangle, Scale, Lock, Search
} from 'lucide-react';

interface AccountingManagerProps {
  orders: Order[];
}

const AccountingManager: React.FC<AccountingManagerProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EINVOICE' | 'TAX_RULES' | 'AUDIT'>('OVERVIEW');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 7));

  // --- COMPLIANCE 2026 LOGIC ---
  const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const getVatSummary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const vat8 = orders.filter(o => o.totalAmount > 0).reduce((sum, o) => sum + (o.totalAmount * 0.08), 0); // Mock
    const vat10 = orders.filter(o => o.totalAmount > 0).reduce((sum, o) => sum + (o.totalAmount * 0.1), 0); // Mock
    return { totalRevenue, vat8, vat10, totalVat: vat8 + vat10 };
  }, [orders]);

  const OverviewTab = () => (
    <div className="space-y-8 animate-fade-in">
        {/* Compliance Header Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Landmark size={300} /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/50">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">Báo Cáo Thuế Master <span className="text-indigo-400 italic">2026 Compliance</span></h2>
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">Áp dụng Nghị định 174/2025 & Luật Quản lý Thuế sửa đổi</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md transition-all flex items-center gap-3">
                        <Download size={18} /> Kết xuất Master Book
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900 transition-all flex items-center gap-3">
                        <Gavel size={18} /> Chốt sổ kỳ thuế
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-white/10 relative z-10">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tổng doanh thu hợp nhất</p>
                    <h3 className="text-3xl font-black group-hover:text-indigo-400 transition-colors">{formatCurrency(getVatSummary.totalRevenue)}</h3>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-black">
                        <TrendingUp size={14} /> +12.5% so với tháng trước
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Thuế VAT 8% (Ưu đãi 2026)</p>
                    <h3 className="text-3xl font-black group-hover:text-amber-400 transition-colors">{formatCurrency(getVatSummary.vat8)}</h3>
                    <p className="mt-4 text-slate-500 text-[10px] font-bold">Dựa trên 245 hóa đơn đủ điều kiện</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">VAT phổ thông 10%</p>
                    <h3 className="text-3xl font-black group-hover:text-indigo-400 transition-colors">{formatCurrency(getVatSummary.vat10)}</h3>
                    <p className="mt-4 text-slate-500 text-[10px] font-bold">Hàng hóa không thuộc diện giảm thuế</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tax Engine Config */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Settings2 size={24} className="text-indigo-600"/> Tax Rules Engine</h3>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter border border-emerald-100">Live Config</span>
                </div>
                <div className="space-y-4">
                    {TAX_RULES.map(rule => (
                        <div key={rule.taxCode} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-xl text-indigo-600 group-hover:scale-110 transition-transform">
                                    {(rule.rate * 100)}%
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-wide">{rule.taxCode}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold">{rule.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {rule.isEligibleForReduction ? (
                                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 uppercase">Giảm VAT 2026</span>
                                ) : (
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Tiêu chuẩn</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Log / Risk Control */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><History size={24} className="text-rose-600"/> Kiểm soát rủi ro (Audit Log)</h3>
                    <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase">Toàn bộ nhật ký</button>
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar max-h-[400px]">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-snug">Hóa đơn <strong>#INV-2026-004</strong> vừa được Kế toán duyệt phát hành.</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">10:45 AM - 05/01/2026</span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase">Tâm.Trần</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-white text-rose-600 rounded-2xl shadow-sm"><AlertTriangle size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Cảnh báo đồng bộ hóa đơn</p>
                        <p className="text-xs font-bold text-rose-600">Phát hiện 02 hóa đơn có sai lệch dữ liệu với Cổng CQT.</p>
                    </div>
                    <button className="ml-auto bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200">Xử lý ngay</button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-luxury rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Wallet size={24} />
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Trung Tâm Tài Chính</h2>
                </div>
                <p className="text-slate-500 font-bold ml-1 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                   <ShieldCheck size={16} className="text-primary" /> Hệ thống Master chốt sổ hợp nhất toàn chuỗi
                </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {['OVERVIEW', 'EINVOICE', 'TAX_RULES', 'AUDIT'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                            activeTab === tab ? 'bg-luxury text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        {tab === 'OVERVIEW' ? 'Tổng quan' : tab === 'EINVOICE' ? 'Hóa đơn' : tab === 'TAX_RULES' ? 'Cấu hình Thuế' : 'Nhật ký'}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1">
            {activeTab === 'OVERVIEW' && <OverviewTab />}
            {activeTab === 'EINVOICE' && (
                <div className="bg-white p-20 text-center rounded-[3rem] border border-dashed text-slate-300">
                    <FileCheck size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="font-black text-xs uppercase tracking-widest">Hệ thống quản lý hóa đơn điện tử 2026 đang được đồng bộ...</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default AccountingManager;
