
import React, { useState, useMemo } from 'react';
import { Customer, Order } from '../types';
import { MOCK_CUSTOMERS } from '../constants';
import { 
  Search, User, Star, Briefcase, MapPin, Calendar, Heart, 
  AlertTriangle, Phone, Clock, ArrowLeft, PackageOpen, 
  ImageIcon, History, Layers, Maximize2, RefreshCcw
} from 'lucide-react';

interface CustomerListProps {
  orders: Order[];
}

const CustomerList: React.FC<CustomerListProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'designs'>('info');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getTierColor = (type: string) => {
    switch (type) {
      case 'VIP': return 'bg-gradient-to-r from-yellow-400 to-amber-600 text-white';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SILVER': return 'bg-gray-200 text-gray-700';
      case 'CORPORATE': return 'bg-slate-800 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Get and sort orders for selected customer
  const customerOrders = selectedCustomer 
    ? orders
        .filter(o => o.customerPhone === selectedCustomer.phone)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Extract all unique designs/images ordered by this customer
  // Fix: Added missing useMemo import from 'react'
  const pastDesigns = useMemo(() => {
    if (!selectedCustomer) return [];
    const designs: { url: string, date: string, occasion: string, id: string, items: string }[] = [];
    
    customerOrders.forEach(order => {
      const imageUrl = order.completedImageUrl || order.referenceImageUrl;
      if (imageUrl) {
        designs.push({
          url: imageUrl,
          date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
          occasion: order.occasion || 'Không rõ',
          id: order.id,
          items: order.items.map(i => i.productName).join(', ')
        });
      }
    });
    return designs;
  }, [customerOrders, selectedCustomer]);

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col md:flex-row gap-6 relative">
      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-zoom-in" alt="Preview" />
        </div>
      )}

      {/* LEFT: LIST VIEW */}
      <div className={`${selectedCustomer ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 bg-white border-r border-gray-100 h-[calc(100vh-100px)] rounded-xl shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-gray-100">
             <h2 className="text-xl font-bold text-gray-800 mb-4">Danh Sách Khách</h2>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm khách hàng VIP..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
              {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id}
                    onClick={() => { setSelectedCustomer(customer); setActiveTab('info'); }}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 flex items-center gap-3 ${selectedCustomer?.id === customer.id ? 'bg-pink-50/50 border-l-4 border-l-primary' : ''}`}
                  >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${customer.type === 'VIP' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {customer.type === 'VIP' ? <Star size={16} fill="white"/> : customer.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 truncate">{customer.name}</h3>
                            {customer.type !== 'REGULAR' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getTierColor(customer.type)}`}>
                                    {customer.type}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                     </div>
                  </div>
              ))}
          </div>
      </div>

      {/* RIGHT: DETAIL PROFILE */}
      <div className={`flex-1 bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-100px)] overflow-hidden flex flex-col ${!selectedCustomer ? 'hidden md:flex items-center justify-center' : ''}`}>
          {selectedCustomer ? (
              <>
                 {/* Header Profile */}
                 <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-start">
                    <div className="flex gap-4">
                        <button onClick={() => setSelectedCustomer(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                          <ArrowLeft size={24} />
                        </button>
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg ${getTierColor(selectedCustomer.type)}`}>
                            {selectedCustomer.type === 'VIP' ? <Star size={32} fill="white"/> : <User size={32}/>}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                                {selectedCustomer.name}
                                {selectedCustomer.companyName && <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded flex items-center gap-1"><Briefcase size={12}/> {selectedCustomer.companyName}</span>}
                            </h2>
                            <div className="flex flex-col gap-1 mt-1 text-gray-600">
                                <span className="flex items-center gap-2 text-sm"><Phone size={14}/> {selectedCustomer.phone}</span>
                                <span className="flex items-center gap-2 text-sm"><MapPin size={14}/> {selectedCustomer.address}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tổng chi tiêu</p>
                        <p className="text-2xl font-black text-primary">{formatCurrency(selectedCustomer.totalSpent)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Giao dịch cuối: {selectedCustomer.lastOrderDate}</p>
                    </div>
                 </div>

                 {/* TABS */}
                 <div className="px-6 border-b border-gray-100 flex gap-6">
                    <button onClick={() => setActiveTab('info')} className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>Thông tin chung</button>
                    <button onClick={() => setActiveTab('history')} className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>Lịch sử đơn ({customerOrders.length})</button>
                    <button onClick={() => setActiveTab('designs')} className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'designs' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>
                      <ImageIcon size={14}/> Thư viện thiết kế riêng
                      {pastDesigns.length > 0 && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">{pastDesigns.length}</span>}
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                    {activeTab === 'info' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Heart className="text-primary" size={18} /> Gu Thẩm Mỹ & Sở Thích</h3>
                            {selectedCustomer.preferences ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Phong cách ưa chuộng</p>
                                        <p className="font-medium text-gray-800">{selectedCustomer.preferences.style}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Màu sắc yêu thích</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {selectedCustomer.preferences.likedColors.map(c => (
                                                <span key={c} className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-[10px] font-bold border border-pink-100">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedCustomer.preferences.allergies && (
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2 items-start">
                                            <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-bold text-red-700 uppercase">Lưu ý đặc biệt</p>
                                                <p className="text-sm text-red-600">{selectedCustomer.preferences.allergies}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : <p className="text-sm text-gray-500 italic">Chưa có dữ liệu sở thích.</p>}
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="text-blue-500" size={18} /> Sự Kiện Quan Trọng</h3>
                            {selectedCustomer.importantDates && selectedCustomer.importantDates.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedCustomer.importantDates.map((date, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded text-blue-600 font-bold text-xs shadow-sm border border-blue-100">{date.date}</div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{date.name}</p>
                                                    <p className="text-[10px] text-gray-500">{date.type === 'BIRTHDAY' ? 'Sinh nhật' : 'Kỷ niệm'}</p>
                                                </div>
                                            </div>
                                            <button className="text-[10px] font-bold bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors">Lên lịch hoa</button>
                                        </div>
                                    ))}
                                </div>
                            ) : <div className="text-center py-6 text-gray-400 text-sm">Chưa lưu ngày kỷ niệm</div>}
                        </div>
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-500">
                            <tr><th className="px-4 py-3">Mã đơn</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3">Dịp lễ</th><th className="px-4 py-3 text-right">Tổng thanh toán</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-sm">
                            {customerOrders.map(order => (
                              <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-4 py-3 font-mono text-xs font-bold text-gray-400 group-hover:text-primary">#{order.id}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="px-4 py-3 font-medium text-slate-700">{order.occasion || '—'}</td>
                                <td className="px-4 py-3 text-right font-black text-gray-900">{formatCurrency(order.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'designs' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <div>
                              <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Toàn bộ thiết kế đã thực hiện</h4>
                              <p className="text-[10px] text-slate-400 font-bold mt-1">Dựa trên ảnh thực tế bàn giao và ảnh mẫu khách gửi</p>
                           </div>
                           <span className="text-[10px] font-black text-primary bg-pink-50 px-2 py-1 rounded border border-pink-100 uppercase">VIP Design Archive</span>
                        </div>
                        
                        {pastDesigns.length > 0 ? (
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastDesigns.map((design, idx) => (
                              <div key={idx} className="group bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                                  <img src={design.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Design" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <button 
                                    onClick={() => setPreviewImage(design.url)}
                                    className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-primary shadow-lg"
                                  >
                                    <Maximize2 size={16}/>
                                  </button>
                                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button className="w-full py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-700 shadow-xl shadow-pink-200">
                                       <RefreshCcw size={14}/> Đặt lại mẫu này
                                    </button>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-black text-primary uppercase bg-pink-50 px-1.5 py-0.5 rounded">{design.occasion}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{design.date}</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{design.items}</p>
                                  <p className="text-[8px] font-mono text-slate-400 mt-1 uppercase">Mã đơn: #{design.id}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                             <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
                             <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Khách hàng chưa có mẫu thiết kế riêng</p>
                          </div>
                        )}
                      </div>
                    )}
                 </div>
                 
                 <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                     <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">Chỉnh sửa hồ sơ</button>
                     <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-pink-700 transition-all shadow-md">Tạo Dự Án Mới</button>
                 </div>
              </>
          ) : (
              <div className="text-center p-10 text-gray-400">
                  <User size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Chọn một khách hàng để xem hồ sơ chi tiết (VIP CRM)</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CustomerList;
