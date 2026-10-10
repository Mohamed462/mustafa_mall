import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { formatDateTime } from '../../utils/formatters';
import { AuditLog } from '../../types';
import { 
  History, 
  Search, 
  ShieldCheck, 
  Filter, 
  Activity, 
  RefreshCw,
  PlusCircle,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => dbStore.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');

  const reloadData = () => {
    setLogs(dbStore.getAuditLogs());
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details_json?.message && log.details_json.message.includes(searchQuery));

    if (!matchesSearch) return false;

    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
            <PlusCircle className="w-3 h-3" />
            <span>إضافة جديدة</span>
          </span>
        );
      case 'update':
      case 'save':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            <Edit className="w-3 h-3" />
            <span>تعديل</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
            <Trash2 className="w-3 h-3" />
            <span>حذف</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
            <Activity className="w-3 h-3" />
            <span>{action}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <History className="w-7 h-7 text-mall-900" />
            <span>سجل الأنشطة وتدقيق النظام (Audit & Security Logs)</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            تسجيل وتوثيق غير قابل للتعديل لجميع العمليات الإدارية وتعديلات المخزون والأسعار والطلبات
          </p>
        </div>

        <button
          type="button"
          onClick={reloadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالمسؤول أو الكيان أو البيان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-bold text-gray-500 shrink-0">نوع الإجراء:</span>
          
          {(['all', 'create', 'update', 'delete'] as const).map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                actionFilter === act
                  ? 'bg-mall-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {act === 'all' && 'الكل'}
              {act === 'create' && 'إضافة'}
              {act === 'update' && 'تعديل'}
              {act === 'delete' && 'حذف'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">التاريخ والوقت</th>
                <th className="p-3">المسؤول (Actor)</th>
                <th className="p-3 text-center">نوع الإجراء</th>
                <th className="p-3">الكيان / الجدول</th>
                <th className="p-3">البيان والتفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    لا توجد أنشطة مطابقة للبحث حالياً
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 text-gray-500 whitespace-nowrap font-mono">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-mall-900 shrink-0" />
                        <span>{log.actor_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-3 font-mono text-gray-600 font-semibold">
                      {log.entity_name}
                    </td>
                    <td className="p-3 text-gray-800 font-medium">
                      {log.details_json?.message || JSON.stringify(log.details_json)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
