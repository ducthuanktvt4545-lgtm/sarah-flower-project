
import React, { useState } from 'react';
import { FlowerSample } from '../types';
import { Search, Heart, Plus, Upload, X, Image as ImageIcon, Flame, Copy, Check, Tag, Share2, Star, PartyPopper, HeartPulse, Store, Ghost, Infinity, Gift, Maximize2 } from 'lucide-react';

interface FlowerCatalogProps {
  samples: FlowerSample[];
  onAddSample?: (sample: FlowerSample) => void;
}

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả giá', min: 0, max: Infinity },
  { id: 'under_500', label: '< 500k', min: 0, max: 500000 },
  { id: '500_1000', label: '500k-1tr', min: 500000, max: 1000000 },
  { id: '1000_1500', label: '1tr-1.5tr', min: 1000000, max: 1500000 },
  { id: '1500_2500', label: '1.5tr-2.5tr', min: 1500000, max: 2500000 },
  { id: 'over_2500', label: '> 2.5tr', min: 2500000, max: Infinity },
];

const OCCASION_FILTERS = [
  { id: 'all', label: 'Tất cả', icon: Star, color: 'bg-slate-100 text-slate-600' },
  { id: 'Sinh nhật', label: 'Sinh nhật', icon: PartyPopper, color: 'bg-pink-100 text-pink-700' },
  { id: 'Tình yêu', label: 'Tình yêu', icon: HeartPulse, color: 'bg-red-100 text-red-700' },
  { id: 'Khai trương', label: 'Khai trương', icon: Store, color: 'bg-amber-100 text-amber-700' },
  { id: 'Chia buồn', label: 'Chia buồn', icon: Ghost, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Kỷ niệm', label: 'Kỷ niệm', icon: Infinity, color: 'bg-purple-100 text-purple-700' },
  { id: 'Quà tặng kèm', label: 'Quà tặng', icon: Gift, color: 'bg-emerald-100 text-emerald-700' },
];

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

const FlowerCatalog: React.FC<FlowerCatalogProps> = ({ samples, onAddSample }) => {
  const [activeRange, setActiveRange] = useState('all');
  const [activeOccasion, setActiveOccasion] = useState('all');
  const [showBestSellersOnly, setShowBestSellersOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListCopied, setIsListCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [newSample, setNewSample] = useState<Partial<FlowerSample>>({
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    isBestSeller: false,
    occasion: 'Sinh nhật'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const filteredSamples = samples.filter(sample => {
    const term = removeAccents(searchTerm);
    const normalizedName = removeAccents(sample.name);
    const normalizedDesc = removeAccents(sample.description || '');
    const normalizedOccasion = removeAccents(sample.occasion || '');

    const matchesSearch = 
      normalizedName.includes(term) || 
      normalizedDesc.includes(term) ||
      normalizedOccasion.includes(term);
    
    if (showBestSellersOnly && !sample.isBestSeller) return false;
    if (activeOccasion !== 'all' && sample.occasion !== activeOccasion) return false;

    const range = PRICE_RANGES.find(r => r.id === activeRange);
    if (!range) return matchesSearch;
    
    const matchesPrice = sample.price >= range.min && sample.price < range.max;
    return matchesPrice && matchesSearch;
  });

  const handleShareList = () => {
    if (filteredSamples.length === 0) return;
    let text = showBestSellersOnly ? "🔥 TOP CÁC MẪU HOA BÁN CHẠY NHẤT 🔥\n--------------------------------\n" : "🌸 DANH SÁCH MẪU HOA THAM KHẢO 🌸\n--------------------------------\n";
    filteredSamples.forEach((sample, index) => {
        text += `${index + 1}. ${sample.name}\n`;
        text += `   💰 Giá: ${formatCurrency(sample.price)}\n`;
        if (sample.description) text += `   📝 ${sample.description}\n`;
        text += "\n";
    });
    text += "--------------------------------\n";
    text += "👉 Anh/Chị ưng mẫu nào nhắn em để được tư vấn kỹ hơn ạ!";
    navigator.clipboard.writeText(text).then(() => {
        setIsListCopied(true);
        setTimeout(() => setIsListCopied(false), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setNewSample({ ...newSample, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddSample && newSample.name && newSample.price) {
      const sampleToAdd: FlowerSample = {
        id: `S-${Date.now()}`,
        name: newSample.name,
        price: newSample.price,
        description: newSample.description || '',
        imageUrl: newSample.imageUrl || 'https://images.unsplash.com/photo-1490750967868-bcdf92dd218a?auto=format&fit=crop&w=400&q=80',
        isBestSeller: newSample.isBestSeller,
        occasion: newSample.occasion
      };
      onAddSample(sampleToAdd);
      setIsModalOpen(false);
      setNewSample({ name: '', price: 0, description: '', imageUrl: '', isBestSeller: false, occasion: 'Sinh nhật' });
      setPreviewImage(null);
    }
  };

  const handleCopyInfo = (sample: FlowerSample) => {
    const text = `🌸 ${sample.name}\n💰 Giá: ${formatCurrency(sample.price)}\n✨ Dịp: ${sample.occasion || 'Khác'}\n📝 ${sample.description || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(sample.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-20">
      {/* Full Image Preview Modal */}
      {previewImage && !isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
           <img src={previewImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-zoom-in" alt="Preview" />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-slate-800 text-xl">Thêm Mẫu Hoa Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hình ảnh mẫu</label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-3xl hover:border-primary/50 hover:bg-pink-50/20 transition-all cursor-pointer relative group overflow-hidden">
                   <div className="space-y-1 text-center">
                     {previewImage ? (
                        <div className="relative">
                            <img src={previewImage} alt="Preview" className="mx-auto h-48 object-cover rounded-2xl" />
                            <button type="button" onClick={(e) => { e.preventDefault(); setPreviewImage(null); setNewSample({...newSample, imageUrl: ''}); }} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:text-red-700 shadow-sm"><X size={16} /></button>
                        </div>
                     ) : (
                        <>
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 group-hover:text-primary transition-colors" />
                            <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-primary hover:text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                <span>Tải ảnh lên</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1 font-medium">hoặc kéo thả</p>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">PNG, JPG, GIF lên đến 5MB</p>
                        </>
                     )}
                   </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên mẫu hoa</label>
                <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-800" value={newSample.name} onChange={e => setNewSample({...newSample, name: e.target.value})} placeholder="Ví dụ: Bó Hồng Tình Yêu" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Giá dự kiến (VNĐ)</label>
                    <input required type="number" min="0" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-black text-primary" value={newSample.price || ''} onChange={e => setNewSample({...newSample, price: Number(e.target.value)})} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Chủ đề / Dịp</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 appearance-none" value={newSample.occasion} onChange={e => setNewSample({...newSample, occasion: e.target.value})}>
                        {OCCASION_FILTERS.filter(o => o.id !== 'all').map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        <option value="Khác">Khác</option>
                    </select>
                  </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mô tả ngắn</label>
                <textarea className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-600" rows={3} value={newSample.description} onChange={e => setNewSample({...newSample, description: e.target.value})} placeholder="Mô tả về phong cách, loại hoa..." />
              </div>
              <div className="flex items-center gap-3 ml-1">
                 <input type="checkbox" id="isBestSeller" checked={newSample.isBestSeller} onChange={(e) => setNewSample({...newSample, isBestSeller: e.target.checked})} className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                 <label htmlFor="isBestSeller" className="text-sm text-slate-600 font-bold cursor-pointer">Đánh dấu là bán chạy (Best Seller)</label>
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Hủy</button>
                 <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-700 shadow-xl shadow-pink-200 transition-all">Lưu Mẫu Mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Thư Viện Mẫu Thiết Kế</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Catalog tham khảo nhanh dành cho Account & Seller</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Tìm tên, dịp, mô tả (vd: hoa ly...)" className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-medium shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {onAddSample && (
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl hover:bg-pink-700 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-200 whitespace-nowrap active:scale-95">
                    <Plus size={20} />
                    <span>Thêm mẫu</span>
                </button>
            )}
        </div>
      </div>

      {/* OCCASION FILTERS UI */}
      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Lọc theo chủ đề / dịp</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {OCCASION_FILTERS.map(occ => (
                <button
                    key={occ.id}
                    onClick={() => setActiveOccasion(occ.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl transition-all border-2 relative overflow-hidden group ${
                        activeOccasion === occ.id 
                        ? 'border-primary bg-pink-50/20 shadow-xl shadow-pink-100 -translate-y-1' 
                        : 'border-transparent bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                    }`}
                >
                    <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${occ.color} ${activeOccasion === occ.id ? 'scale-110 shadow-md' : ''}`}>
                        <occ.icon size={22} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeOccasion === occ.id ? 'text-primary' : 'text-slate-500'}`}>
                        {occ.label}
                    </span>
                    {activeOccasion === occ.id && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary text-white flex items-center justify-center rounded-bl-2xl">
                            <Check size={12} />
                        </div>
                    )}
                </button>
            ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-100">
         <div className="flex items-center gap-4">
             <button onClick={() => setShowBestSellersOnly(!showBestSellersOnly)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${showBestSellersOnly ? 'bg-slate-900 border-slate-900 text-white shadow-slate-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <Flame size={16} fill={showBestSellersOnly ? "currentColor" : "none"} />
                TOP Bán Chạy
             </button>
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-md sm:max-w-none">
                {PRICE_RANGES.map(range => (
                <button key={range.id} onClick={() => setActiveRange(range.id)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap border ${activeRange === range.id ? 'bg-primary text-white border-primary shadow-md shadow-pink-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                    {range.label}
                </button>
                ))}
            </div>
         </div>
         <button onClick={handleShareList} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95">
            {isListCopied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            <span>{isListCopied ? 'Đã copy' : 'Copy link gửi khách'}</span>
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredSamples.map(sample => (
          <div key={sample.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
              {sample.isBestSeller && (
                  <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 uppercase tracking-widest">
                     <Flame size={12} className="text-orange-400" fill="currentColor" /> Best Seller
                  </div>
              )}
              {sample.occasion && (
                  <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md text-slate-800 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 uppercase tracking-widest border border-white/50">
                     <Tag size={12} className="text-primary" /> {sample.occasion}
                  </div>
              )}
              <img src={sample.imageUrl} alt={sample.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 flex flex-col gap-2">
                <button className="p-3 bg-white text-primary hover:bg-primary hover:text-white rounded-2xl shadow-xl transition-all active:scale-90" title="Yêu thích"><Heart size={20} /></button>
                <button onClick={(e) => { e.stopPropagation(); setPreviewImage(sample.imageUrl); }} className="p-3 bg-white text-slate-700 hover:bg-slate-900 hover:text-white rounded-2xl shadow-xl transition-all active:scale-90" title="Xem ảnh to"><Maximize2 size={20}/></button>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-black text-slate-800 text-lg line-clamp-1 mb-1 tracking-tight">{sample.name}</h3>
              <p className="text-primary font-black text-2xl mb-3 tracking-tighter">{formatCurrency(sample.price)}</p>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed flex-1 italic">"{sample.description}"</p>
              <button onClick={() => handleCopyInfo(sample)} className="w-full py-4 bg-slate-50 border border-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-inner">
                {copiedId === sample.id ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedId === sample.id ? 'Đã sao chép' : 'Gửi mẫu này'}</span>
              </button>
            </div>
          </div>
        ))}
        {onAddSample && activeRange === 'all' && activeOccasion === 'all' && !showBestSellersOnly && !searchTerm && (
             <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-slate-400 hover:text-primary hover:border-primary hover:bg-pink-50/10 transition-all min-h-[350px] group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors shadow-inner"><Plus size={32} /></div>
                <span className="font-black text-xs uppercase tracking-widest">Tải lên mẫu mới</span>
            </button>
        )}
      </div>

      {filteredSamples.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
           <ImageIcon size={64} className="mx-auto text-slate-200 mb-4 opacity-50" />
           <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Không tìm thấy mẫu nào phù hợp</p>
           <button onClick={() => {setActiveOccasion('all'); setActiveRange('all'); setSearchTerm(''); setShowBestSellersOnly(false);}} className="mt-4 text-primary text-xs font-bold underline">Xóa toàn bộ bộ lọc</button>
        </div>
      )}
    </div>
  );
};

export default FlowerCatalog;
