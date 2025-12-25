
import React, { useState } from 'react';
import { UserRole, Florist, Shipper } from '../types';
import { MOCK_FLORISTS, MOCK_SHIPPERS, ROLE_LABELS } from '../constants';
import { 
  UserRoundCheck, Search, Filter, Phone, Mail, 
  MapPin, Calendar, MoreHorizontal, UserPlus, 
  ShieldCheck, Smartphone, CheckCircle2 
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  joinDate: string;
  status: 'ACTIVE' | 'OFFLINE' | 'ON_LEAVE';
}

const EmployeeManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Merging different mock sources into a unified Employee list
  const employees: Employee[] = [
    ...MOCK_FLORISTS.map(f => ({ ...f, role: UserRole.FLORIST, status: 'ACTIVE' as const })),
    ...MOCK_SHIPPERS.map(s => ({ ...s, role: UserRole.SHIPPER, status: 'ACTIVE' as const, joinDate: '2023-11-01', avatar: `https://i.pravatar.cc/150?u=${s.id}` })),
    { id: 'admin1', name: 'Trần Minh Tâm', phone: '0900000001', role: UserRole.ADMIN, status: 'ACTIVE', joinDate: '2022-01-01', avatar: 'https://i.pravatar.cc/150?u=admin1' },
    { id: 'sale1', name: 'Lê Thu Thảo', phone: '0900000002', role: UserRole.SELLER, status: 'ACTIVE', joinDate: '2023-03-15', avatar: 'https://i.pravatar.cc/150?u=sale1' },
  ];

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'ALL' || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'OFFLINE': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'ON_LEAVE': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h2>
          <p className="text-sm text-gray-500">Danh sách toàn bộ đội ngũ BloomFlow</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-pink-700 transition-all font-bold shadow-lg flex items-center gap-2">
          <UserPlus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <select 
            className="pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-gray-700 min-w-[150px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{ROLE_LABELS[role]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                    <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                </div>
                <button className="text-gray-400 hover:text-primary transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{emp.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                   <ShieldCheck size={14} className="text-primary" />
                   <span className="text-xs font-bold text-primary uppercase tracking-wider">{ROLE_LABELS[emp.role]}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-3 text-slate-500">
                  <Smartphone size={16} />
                  <span className="text-sm">{emp.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar size={16} />
                  <span className="text-sm">Gia nhập: {emp.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusBadge(emp.status)}`}>
                  {emp.status === 'ACTIVE' ? 'Đang làm' : emp.status === 'OFFLINE' ? 'Nghỉ' : 'Phép'}
               </span>
               <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Hồ sơ chi tiết
               </button>
            </div>
          </div>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
             <UserRoundCheck size={48} className="mx-auto mb-3 text-gray-200" />
             <p className="text-gray-400 font-medium">Không tìm thấy nhân viên phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManager;
