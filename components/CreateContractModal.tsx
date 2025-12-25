
import React, { useState, useEffect } from 'react';
import { Contract, PaymentMilestone, Customer } from '../types';
import { X, Plus, Trash2, FileText, Calendar, DollarSign, Users, Info, Send, Save, CheckCircle2 } from 'lucide-react';
import { MOCK_CUSTOMERS } from '../constants';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contract: Contract) => void;
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    contractNumber: `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: '',
    customerName: '',
    totalValue: 0,
    depositAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    signedDate: new Date().toISOString().split('T')[0],
    branchId: 'BR001'
  });

  const [milestones, setMilestones] = useState<Partial<PaymentMilestone>[]>([
    { id: 'm1', name: 'Đặt cọc giữ chỗ', percentage: 30, amount: 0, dueDate: '', status: 'PENDING' },
    { id: 'm2', name: 'Quyết toán hoàn tất', percentage: 70, amount: 0, dueDate: '', status: 'PENDING' }
  ]);

  // Sync milestone amounts when totalValue changes
  useEffect(() => {
    setMilestones(prev => prev.map(m => ({
      ...m,
      amount: Math.round((formData.totalValue * (m.percentage || 0)) / 100)
    })));
  }, [formData.totalValue]);

  const handleCustomerChange = (customerId: string) => {
    const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
    if (customer) {
      setFormData({ ...formData, customerId, customerName: customer.name });
    }
  };

  const handleAddMilestone = () => {
    const newId = `m${milestones.length + 1}`;
    setMilestones([...milestones, { id: newId, name: '', percentage: 0, amount: 0, dueDate: '', status: 'PENDING' }]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleMilestoneChange = (id: string, field: keyof PaymentMilestone, value: any) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };
        if (field === 'percentage') {
          updated.amount = Math.round((formData.totalValue * Number(value)) / 100);
        }
        return updated;
      }
      return m;
    }));
  };

  const totalPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPercentage !== 100) {
      alert('Tổng tỷ lệ các giai đoạn thanh toán phải bằng 100%');
      return;
    }

    const newContract: Contract = {
      ...formData,
      id: `CT-${Date.now()}`,
      status: 'DRAFT',
      milestones: milestones as PaymentMilestone[]
    } as Contract;

    onSubmit(newContract);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-luxury text-white rounded-2xl shadow-xl">
                <FileText size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800">Soạn Thảo Hợp Đồng Mới</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Dành cho khách hàng VIP & Sự kiện</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-all"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> Thông tin pháp lý
                   </h4>
                   <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Số hợp đồng</label>
                      <input readOnly type="text" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono font-bold text-primary" value={formData.contractNumber} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tên dự án / Hợp đồng</label>
                      <input required type="text" placeholder="Ví dụ: Trang trí tiệc cưới Villa A..." className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Chọn khách hàng (CRM)</label>
                      <select required className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold" value={formData.customerId} onChange={e => handleCustomerChange(e.target.value)}>
                         <option value="">-- Chọn khách hàng từ hệ thống --</option>
                         {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                      </select>
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Thời hạn thực hiện
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Ngày bắt đầu</label>
                        <input required type="date" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Ngày kết thúc</label>
                        <input required type="date" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                      </div>
                   </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-4">
                   <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <DollarSign size={14} /> Giá trị tài chính
                   </h4>
                   <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tổng giá trị hợp đồng (VNĐ)</label>
                      <input required type="number" min="0" className="w-full bg-white border border-primary/20 rounded-xl p-4 text-xl font-black text-primary shadow-inner" value={formData.totalValue || ''} onChange={e => setFormData({...formData, totalValue: Number(e.target.value)})} placeholder="0" />
                   </div>
                </div>
              </div>

              {/* Right Column: Milestones */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lộ trình thanh toán (Milestones)</h4>
                    <button type="button" onClick={handleAddMilestone} className="text-[10px] font-black text-primary flex items-center gap-1 hover:underline">
                       <Plus size={14}/> Thêm giai đoạn
                    </button>
                 </div>

                 <div className="space-y-4">
                    {milestones.map((ms, idx) => (
                       <div key={ms.id} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] shadow-sm relative group">
                          <button type="button" onClick={() => handleRemoveMilestone(ms.id!)} className="absolute -top-2 -right-2 bg-white text-rose-500 p-1.5 rounded-full shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50"><Trash2 size={14}/></button>
                          
                          <div className="grid grid-cols-12 gap-3 items-center">
                             <div className="col-span-6">
                                <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Tên đợt thanh toán</label>
                                <input required type="text" className="w-full border-b border-slate-100 text-sm font-bold text-slate-800 outline-none focus:border-primary" placeholder="Giai đoạn..." value={ms.name} onChange={e => handleMilestoneChange(ms.id!, 'name', e.target.value)} />
                             </div>
                             <div className="col-span-2">
                                <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">%</label>
                                <input required type="number" min="0" max="100" className="w-full border-b border-slate-100 text-sm font-black text-indigo-600 outline-none focus:border-primary" value={ms.percentage} onChange={e => handleMilestoneChange(ms.id!, 'percentage', e.target.value)} />
                             </div>
                             <div className="col-span-4 text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Thành tiền</p>
                                <p className="text-sm font-black text-slate-900">{formatCurrency(ms.amount || 0)}</p>
                             </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                             <Calendar size={12} className="text-slate-300" />
                             <input required type="date" className="text-[10px] font-bold text-slate-500 outline-none" value={ms.dueDate} onChange={e => handleMilestoneChange(ms.id!, 'dueDate', e.target.value)} />
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className={`p-4 rounded-2xl flex justify-between items-center font-black text-xs uppercase tracking-widest ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    <span>Tổng tỷ lệ: {totalPercentage}%</span>
                    {totalPercentage === 100 ? <CheckCircle2 size={16}/> : <span>Thiếu {100 - totalPercentage}%</span>}
                 </div>
              </div>
           </div>

           <div className="mt-12 p-8 border-t border-slate-100 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Lưu nháp</button>
              <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-pink-700 shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-3">
                 <Send size={18} /> Chốt hợp đồng & Gửi đối tác
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContractModal;
