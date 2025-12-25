
import React, { useState } from 'react';
import { Contract, PaymentMilestone } from '../types';
import { 
  Briefcase, Calendar, CheckCircle2, Clock, DollarSign, 
  FileText, Layout, MoreHorizontal, Plus, Send, Users,
  ShieldCheck, ArrowRight, Wallet, TrendingUp, Landmark, 
  MessageSquare, FileCheck, Layers, Settings2, ExternalLink
} from 'lucide-react';
import CreateContractModal from './CreateContractModal';

interface ProjectManagerProps {
  contracts: Contract[];
  onCreateContract: (contract: Contract) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ contracts, onCreateContract }) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DRAFT': return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handleSaveContract = (newContract: Contract) => {
    onCreateContract(newContract);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in pb-20">
        <CreateContractModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleSaveContract} 
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Briefcase size={24} />
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Hợp Đồng & Event</h2>
                </div>
                <p className="text-slate-500 font-bold ml-1 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                   Quản lý quyết toán hợp đồng đa giai đoạn & Milestones
                </p>
            </div>
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-luxury text-white px-10 py-5 rounded-[2rem] hover:bg-black transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 transform active:scale-95"
            >
                <Plus size={20} /> Lập hợp đồng mới
            </button>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-primary transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tổng giá trị Event đang chạy</p>
                <h3 className="text-2xl font-black text-slate-900">4.5 Tỷ <span className="text-[10px] text-emerald-500">+12%</span></h3>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Số dư cần thu hồi (Milestones)</p>
                <h3 className="text-2xl font-black text-rose-600">820.0M</h3>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Đặt cọc chưa đối trừ</p>
                <h3 className="text-2xl font-black text-indigo-600">150.0M</h3>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hợp đồng mới trong tuần</p>
                <h3 className="text-2xl font-black text-emerald-600">{contracts.filter(c => c.status === 'DRAFT').length} HD</h3>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* CONTRACT LIST */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto no-scrollbar max-h-[700px]">
                {contracts.map(contract => (
                    <div 
                        key={contract.id}
                        onClick={() => setSelectedContract(contract)}
                        className={`bg-white p-8 rounded-[3rem] border transition-all cursor-pointer group shadow-sm ${
                            selectedContract?.id === contract.id ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100 hover:border-slate-300'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{contract.contractNumber}</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{contract.title}</h3>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(contract.status)}`}>
                                {contract.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Khách hàng VIP</p>
                                <p className="font-bold text-slate-800 flex items-center gap-2"><Users size={14} className="text-slate-300"/> {contract.customerName}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tổng hợp đồng</p>
                                <p className="font-black text-slate-900">{formatCurrency(contract.totalValue)}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Thời gian</p>
                                <p className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-slate-300"/> {contract.startDate}</p>
                             </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Tiến độ thanh toán Milestones</span>
                                <span className="text-primary">65% Đã quyết toán</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-primary to-pink-400 w-[65%]"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DETAILS VIEW */}
            <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden flex flex-col shadow-xl">
                {selectedContract ? (
                    <>
                        <div className="p-8 bg-slate-900 text-white space-y-4">
                            <h3 className="text-xl font-black tracking-tight">{selectedContract.title}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master Billing & Milestones</p>
                            <div className="pt-4 flex justify-between items-end border-t border-white/10">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Giá trị hợp đồng</p>
                                    <p className="text-3xl font-black text-primary">{formatCurrency(selectedContract.totalValue)}</p>
                                </div>
                                <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-white"><Settings2 size={20}/></button>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Giai đoạn quyết toán (Milestones)</h4>
                            {selectedContract.milestones.map((ms, idx) => (
                                <div key={ms.id} className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                                    ms.status === 'PAID' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-300'
                                }`}>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${
                                                ms.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {ms.percentage}%
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-800 text-sm leading-tight">{ms.name}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">Hạn: {ms.dueDate}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">{formatCurrency(ms.amount)}</p>
                                            {ms.status === 'PAID' ? (
                                                <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg uppercase mt-2 inline-block tracking-widest">Đã thu tiền</span>
                                            ) : (
                                                <button className="text-[8px] font-black text-primary hover:underline uppercase mt-2 inline-block tracking-widest">Lập đề nghị chi</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                            <button className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-100 transition-all shadow-sm">In Phụ lục HD</button>
                            <button className="flex-1 py-5 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.1em] hover:bg-pink-700 shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-2">
                               <Send size={14}/> Gửi Email Đối Tác
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-300">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                           <FileText size={64} className="opacity-20" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-widest leading-loose">Vui lòng chọn một hợp đồng<br/>để quản lý tiến độ thanh toán</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ProjectManager;
