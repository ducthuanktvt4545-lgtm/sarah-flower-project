
import React, { useState, useEffect } from 'react';
import { Order, EInvoice, Customer, BuyerType, TaxRule } from '../types';
import { X, FileCheck, ShieldCheck, Loader2, Download, Printer, ExternalLink, AlertCircle, Building2, User, Landmark, Fingerprint } from 'lucide-react';
import { MOCK_CUSTOMERS, TAX_RULES } from '../constants';

interface InvoiceIssuerProps {
  order: Order;
  onClose: () => void;
  onSuccess: (invoice: EInvoice) => void;
}

const InvoiceIssuer: React.FC<InvoiceIssuerProps> = ({ order, onClose, onSuccess }) => {
  const [step, setStep] = useState<'REVIEW' | 'SENDING' | 'DONE'>('REVIEW');
  const [buyerType, setBuyerType] = useState<BuyerType>('BUSINESS');
  const [taxRate, setTaxRate] = useState(0.1); 
  
  const [customerInfo, setCustomerInfo] = useState({
    name: order.customerName,
    taxId: '',
    personalId: '',
    budgetCode: '',
    address: order.deliveryAddress,
    email: ''
  });

  // Compliance 2026: Auto-select tax rate based on current date and item type
  useEffect(() => {
    const today = new Date();
    const isFlower = order.items.some(i => i.productName.toLowerCase().includes('hoa'));
    
    // Simple logic: If before 2027 and it's goods (flowers), default to 8% if rule exists
    const reductionRule = TAX_RULES.find(r => r.taxCode === 'VAT_8');
    if (reductionRule && today <= new Date('2026-12-31') && isFlower) {
        setTaxRate(0.08);
    } else {
        setTaxRate(0.1);
    }
  }, [order]);

  // Pre-fill from CRM
  useEffect(() => {
    const customer = MOCK_CUSTOMERS.find(c => c.phone === order.customerPhone);
    if (customer) {
      setCustomerInfo({
        name: customer.companyName || customer.name,
        taxId: customer.taxId || '',
        personalId: customer.personalId || '',
        budgetCode: '',
        address: customer.taxAddress || customer.address,
        email: ''
      });
      if (customer.type === 'CORPORATE') setBuyerType('BUSINESS');
      else setBuyerType('INDIVIDUAL');
    }
  }, [order]);

  const subTotal = order.totalAmount;
  const taxAmount = Math.round(subTotal * taxRate);
  const totalWithTax = subTotal + taxAmount;

  const handleIssueInvoice = async () => {
    // Validation 2026
    if (buyerType === 'BUSINESS' && !customerInfo.taxId) {
        alert('Cảnh báo rủi ro: Hóa đơn B2B bắt buộc phải có Mã số thuế hợp lệ.');
        return;
    }
    if (buyerType === 'INDIVIDUAL' && !customerInfo.personalId) {
        if (!confirm('Khách hàng không cung cấp số định danh cá nhân. Hóa đơn sẽ được xuất theo diện khách lẻ không định danh. Tiếp tục?')) return;
    }

    setStep('SENDING');
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Fix: Added missing 'branchId' property to the EInvoice object.
    const newInvoice: EInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `0000${Math.floor(Math.random() * 9999)}`,
      invoiceSymbol: '1C26TBB',
      taxCode: `TCT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      orderId: order.id,
      customerId: order.customerPhone,
      branchId: order.branchId,
      buyerType: buyerType,
      customerTaxName: customerInfo.name,
      customerTaxId: buyerType === 'BUSINESS' ? customerInfo.taxId : undefined,
      customerPersonalId: buyerType === 'INDIVIDUAL' ? customerInfo.personalId : undefined,
      customerBudgetCode: buyerType === 'BUDGET_UNIT' ? customerInfo.budgetCode : undefined,
      customerTaxAddress: customerInfo.address,
      customerEmail: customerInfo.email,
      issueDate: new Date().toISOString(),
      totalBeforeTax: subTotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      totalAfterTax: totalWithTax,
      status: 'ISSUED',
      isVatReduced: taxRate === 0.08,
      history: [{
          action: 'CREATE_AND_ISSUE',
          timestamp: new Date().toISOString(),
          user: 'Admin Manager',
          note: 'Xuất hóa đơn mới từ đơn hàng POS'
      }]
    };

    setStep('DONE');
    onSuccess(newInvoice);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-white/20">
        
        {/* Modern Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                <FileCheck size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800">Phát hành Hóa đơn (Compliance 2026)</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected to Tax Authority API
                </p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24}/></button>
        </div>

        {step === 'REVIEW' && (
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Buyer Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {(['BUSINESS', 'INDIVIDUAL', 'HOUSEHOLD', 'BUDGET_UNIT'] as BuyerType[]).map(type => (
                 <button 
                   key={type}
                   onClick={() => setBuyerType(type)}
                   className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                       buyerType === type ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                   }`}
                 >
                    {type === 'BUSINESS' && <Building2 size={20}/>}
                    {type === 'INDIVIDUAL' && <User size={20}/>}
                    {type === 'HOUSEHOLD' && <Landmark size={20}/>}
                    {type === 'BUDGET_UNIT' && <ShieldCheck size={20}/>}
                    <span className="text-[9px] font-black uppercase tracking-tighter">{type.replace('_', ' ')}</span>
                 </button>
               ))}
            </div>

            <div className="space-y-5">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tên đơn vị / Người mua hóa đơn</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-800 shadow-inner" 
                    value={customerInfo.name} 
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {buyerType === 'BUSINESS' && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Mã số thuế (Bắt buộc B2B)</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-black text-indigo-600 shadow-inner" 
                                placeholder="0311xxxxxx"
                                value={customerInfo.taxId} 
                                onChange={e => setCustomerInfo({...customerInfo, taxId: e.target.value})}
                            />
                        </div>
                      </div>
                  )}

                  {buyerType === 'INDIVIDUAL' && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Số định danh cá nhân (CCCD)</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-black text-slate-700 shadow-inner" 
                                placeholder="12 số trên CCCD"
                                value={customerInfo.personalId} 
                                onChange={e => setCustomerInfo({...customerInfo, personalId: e.target.value})}
                            />
                        </div>
                      </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Thuế suất áp dụng (Engine)</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-black text-slate-700 shadow-inner appearance-none"
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value))}
                    >
                      <option value={0.08}>8% (Nghị định 174/2025)</option>
                      <option value={0.1}>10% (Phổ thông)</option>
                      <option value={0.05}>5% (Ưu đãi nhóm)</option>
                      <option value={0}>0% (Không chịu thuế)</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Địa chỉ đăng ký thuế</label>
                  <textarea 
                    rows={2}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-600 shadow-inner"
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                  />
               </div>
            </div>

            {/* Price Summary */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><Landmark size={120} /></div>
               <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Giá trị hàng hóa</span>
                  <span className="font-bold">{formatCurrency(subTotal)}</span>
               </div>
               <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Tiền thuế VAT ({taxRate*100}%)</span>
                  <span className="font-bold">{formatCurrency(taxAmount)}</span>
               </div>
               <div className="flex justify-between items-end pt-4 border-t border-white/10">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Tổng cộng thanh toán</p>
                      <h4 className="text-3xl font-black">{formatCurrency(totalWithTax)}</h4>
                  </div>
                  {taxRate === 0.08 && (
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-tighter">Đã giảm 2% VAT</span>
                  )}
               </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button onClick={onClose} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl text-sm font-black hover:bg-slate-200 transition-all">Hủy bỏ</button>
               <button onClick={handleIssueInvoice} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl text-sm font-black hover:bg-indigo-500 shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3">
                  <ShieldCheck size={20} /> Ký số & Gửi Cơ quan Thuế
               </button>
            </div>
          </div>
        )}

        {step === 'SENDING' && (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-8 animate-pulse">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Building2 className="absolute inset-0 m-auto text-indigo-200" size={32} />
             </div>
             <div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tighter">Đang xác thực với Cổng Tổng cục Thuế</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Vui lòng giữ kết nối internet. Hệ thống đang ký số bằng HSM và truyền dữ liệu lên hệ thống hóa đơn điện tử quốc gia...</p>
             </div>
          </div>
        )}

        {step === 'DONE' && (
          <div className="p-12 flex flex-col items-center text-center animate-fade-in">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-emerald-100">
                <FileCheck size={48} />
             </div>
             <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Hóa đơn đã được cấp mã!</h4>
             <p className="text-sm text-slate-500 mt-2">Dữ liệu đã được lưu vào <strong>Master Book 2026</strong> và gửi tới email khách hàng.</p>
             
             <div className="w-full mt-10 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Mã tra cứu</p>
                   <p className="font-mono font-black text-indigo-600 text-sm text-left select-all">TCT-A192KB8</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Số hóa đơn</p>
                   <p className="font-black text-slate-800 text-sm text-left">00004512</p>
                </div>
             </div>

             <div className="w-full grid grid-cols-3 gap-3 mt-6">
                <button className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-3xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                   <Download size={20} className="text-indigo-500"/> PDF/XML
                </button>
                <button className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-3xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                   <Printer size={20} className="text-slate-500"/> IN HÓA ĐƠN
                </button>
                <button className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-3xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                   <ExternalLink size={20} className="text-sky-500"/> TRA CỨU
                </button>
             </div>

             <button 
               onClick={onClose}
               className="mt-10 w-full py-5 bg-slate-900 text-white rounded-3xl text-sm font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/40"
             >
                Hoàn tất & Quay lại Dashboard
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvoiceIssuer;
