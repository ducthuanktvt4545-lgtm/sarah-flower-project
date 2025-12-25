
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Product, FlowerSample } from '../types';
import { MOCK_SAMPLES, MOCK_PRODUCTS } from '../constants';
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  Flower2, 
  Layers, 
  ChevronRight,
  BrainCircuit,
  Warehouse,
  ShoppingBag,
  Zap
} from 'lucide-react';

const FloristAI: React.FC = () => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<FlowerSample[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isScanningInventory, setIsScanningInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // --- Logic 1: Manual Recommendation ---
  const handleToggleMaterial = (materialName: string) => {
    setSelectedMaterials(prev => 
      prev.includes(materialName) 
        ? prev.filter(m => m !== materialName) 
        : [...prev, materialName]
    );
  };

  const getAiRecommendation = async (materials: string[], mode: 'manual' | 'inventory') => {
    setIsLoading(true);
    try {
      const prompt = `
        Mày là một chuyên gia cắm hoa nghệ thuật quốc tế cao cấp.
        Tao có danh sách các loại hoa/lá hiện có: [${materials.join(', ')}].
        Hãy phân tích và gợi ý cho tao các phong cách cắm hoa phù hợp.
        Dưới đây là các mẫu hoa trong Catalog của tao: ${JSON.stringify(MOCK_SAMPLES.map(s => ({name: s.name, desc: s.description, ingredients: s.ingredients})))}.
        
        Hãy trả về 1 đoạn phân tích ngắn (khoảng 3-4 câu) bằng tiếng Việt thật chuyên nghiệp, bay bổng.
        NếuMode là 'inventory', hãy ưu tiên những mẫu có đủ nguyên liệu nhất.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiAnalysis(response.text || 'Không có phân tích từ AI.');
      
      // Local filtering for catalog matches
      const matches = MOCK_SAMPLES.filter(sample => 
        sample.ingredients?.some(ing => materials.includes(ing))
      );
      setRecommendations(matches);

    } catch (error) {
      console.error("AI Error:", error);
      setAiAnalysis("Hệ thống AI đang bận, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logic 2: Auto-Scan Inventory ---
  const handleAutoScan = () => {
    setIsScanningInventory(true);
    // Lấy các sản phẩm có tồn kho > 0
    const availableInStock = MOCK_PRODUCTS
      .filter(p => p.stock > 0)
      .map(p => p.name);
    
    setSelectedMaterials(availableInStock);
    getAiRecommendation(availableInStock, 'inventory');
  };

  useEffect(() => {
    if (selectedMaterials.length > 0 && !isScanningInventory) {
       // Debounce or wait for manual trigger
    }
  }, [selectedMaterials]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header with AI Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-200">
                  <BrainCircuit size={28} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Florist Assistant</h2>
            </div>
            <p className="text-slate-500 font-bold ml-1 flex items-center gap-2">
               <Sparkles size={16} className="text-primary animate-pulse" />
               Trợ lý thiết kế & Điều phối nguyên liệu thông minh
            </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={handleAutoScan}
                disabled={isLoading}
                className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50"
            >
                <Warehouse size={18} />
                <span>Quét Kho Hiện Có</span>
            </button>
            <button 
                onClick={() => getAiRecommendation(selectedMaterials, 'manual')}
                disabled={isLoading || selectedMaterials.length === 0}
                className="flex-1 md:flex-none bg-primary text-white px-8 py-4 rounded-2xl hover:bg-pink-700 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-200 active:scale-95 disabled:opacity-50"
            >
                <Zap size={18} fill="white" />
                <span>{isLoading ? 'Đang Phân Tích...' : 'Gợi Ý Mẫu'}</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Material Selection */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                        <Layers size={16} className="text-primary" /> Chọn nguyên liệu
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        {selectedMaterials.length} loại
                    </span>
                </div>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    {MOCK_PRODUCTS.map(product => (
                        <button
                            key={product.id}
                            onClick={() => handleToggleMaterial(product.name)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                selectedMaterials.includes(product.name)
                                ? 'bg-pink-50 border-primary shadow-inner'
                                : 'bg-white border-slate-50 hover:border-slate-200'
                            }`}
                        >
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                            </div>
                            <div className="text-left flex-1">
                                <p className={`text-sm font-bold ${selectedMaterials.includes(product.name) ? 'text-primary' : 'text-slate-700'}`}>{product.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Tồn: {product.stock} {product.unit}</p>
                            </div>
                            {selectedMaterials.includes(product.name) && (
                                <CheckCircle2 size={20} className="text-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <button 
                  onClick={() => {setSelectedMaterials([]); setRecommendations([]); setAiAnalysis(''); setIsScanningInventory(false);}}
                  className="w-full mt-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCcw size={14} /> Làm mới bộ chọn
                </button>
            </div>
        </div>

        {/* RIGHT: AI Insights & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* AI Thought Process */}
            {aiAnalysis && (
                <div className="bg-gradient-to-br from-slate-900 to-luxury rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden animate-zoom-in">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit size={150} /></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={24} className="text-pink-400" />
                            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-pink-400">Phân tích từ Nghệ nhân AI</h3>
                        </div>
                        <p className="text-lg font-medium leading-relaxed italic text-slate-100">
                           "{aiAnalysis}"
                        </p>
                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Đồng bộ hóa Kho thực tế
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Đối soát Catalog {MOCK_SAMPLES.length} mẫu
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommended Samples */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                        {recommendations.length > 0 ? `Đề xuất mẫu hoa phù hợp (${recommendations.length})` : 'Chọn nguyên liệu để xem đề xuất'}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map(sample => {
                        // Tính toán độ khớp nguyên liệu
                        const matchedIngs = sample.ingredients?.filter(ing => selectedMaterials.includes(ing)) || [];
                        const matchPercent = sample.ingredients ? Math.round((matchedIngs.length / sample.ingredients.length) * 100) : 0;

                        return (
                            <div key={sample.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group animate-fade-in">
                                <div className="flex">
                                    <div className="w-1/3 aspect-[4/5] overflow-hidden relative">
                                        <img src={sample.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={sample.name} />
                                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                                            Match {matchPercent}%
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{sample.name}</h4>
                                            <span className="text-[10px] font-black text-primary">{formatCurrency(sample.price)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mb-4">"{sample.description}"</p>
                                        
                                        <div className="space-y-2 mb-4">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Thành phần khớp:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {sample.ingredients?.map(ing => (
                                                    <span key={ing} className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                                                        selectedMaterials.includes(ing) 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}>
                                                        {ing}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 flex gap-2">
                                            <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Chi tiết</button>
                                            <button className="flex-1 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all flex items-center justify-center gap-2">
                                                <ShoppingBag size={12}/> Đặt Ngay
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {recommendations.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-10">
                            <div className="p-6 bg-white rounded-3xl shadow-sm mb-6">
                                <Flower2 size={48} className="text-slate-200" />
                            </div>
                            <h4 className="text-slate-400 font-black text-sm uppercase tracking-widest">Hệ thống chưa tìm thấy mẫu khớp hoàn toàn</h4>
                            <p className="text-slate-400 text-xs mt-2">Hãy thử chọn thêm nguyên liệu hoặc nhấn "Quét Kho Hiện Có" để AI tự động tìm kiếm dựa trên tồn kho thực tế.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">AI is thinking...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FloristAI;
