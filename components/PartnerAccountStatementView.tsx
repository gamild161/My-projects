
import React, { useState, useMemo } from 'react';
import { Deduction, DailyLog, Partner } from '../types';
import { Search, Printer, Edit2, Trash2, Calendar, User, FileText, X, Save, Filter } from 'lucide-react';
import { printPartnerStatementReport } from '../utils/printer';

interface PartnerAccountStatementViewProps {
  currentDeductions: Deduction[];
  dailyLogs: DailyLog[];
  setDeductions: React.Dispatch<React.SetStateAction<Deduction[]>>;
  setDailyLogs: React.Dispatch<React.SetStateAction<DailyLog[]>>;
}

const PartnerAccountStatementView: React.FC<PartnerAccountStatementViewProps> = ({ 
  currentDeductions, 
  dailyLogs, 
  setDeductions, 
  setDailyLogs 
}) => {
  const [selectedPartner, setSelectedPartner] = useState<Partner>('حمد');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [editingItem, setEditingItem] = useState<{ id: string, source: 'current' | number, data: Deduction } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, source: 'current' | number } | null>(null);

  // تجميع كافة الخصميات من المصدرين وفلترتها
  const partnerDeductions = useMemo(() => {
    const list: Array<Deduction & { source: 'current' | number }> = [];
    
    // 1. الخصميات الحالية (غير مؤرشفة)
    currentDeductions.forEach(d => {
      if (d.partner === selectedPartner) {
        list.push({ ...d, source: 'current' });
      }
    });
    
    // 2. الخصميات المؤرشفة في اليوميات
    dailyLogs.forEach((log, logIdx) => {
      log.deductions.forEach(d => {
        if (d.partner === selectedPartner) {
          list.push({ ...d, source: logIdx });
        }
      });
    });

    return list
      .filter(d => d.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentDeductions, dailyLogs, selectedPartner, selectedMonth]);

  const totalDeductions = partnerDeductions.reduce((sum, d) => sum + d.amount, 0);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { source, data } = editingItem;

    if (source === 'current') {
      setDeductions(prev => prev.map(d => d.id === data.id ? data : d));
    } else {
      const newLogs = [...dailyLogs];
      const logIdx = source as number;
      const log = { ...newLogs[logIdx] };
      
      log.deductions = log.deductions.map(d => d.id === data.id ? data : d);
      
      // إعادة احتساب الربح الصافي وتوزيع الحصص لليومية المؤرشفة
      const totalSales = log.sales.reduce((a, b) => a + b.amount, 0);
      const totalExpenses = log.expenses.reduce((a, b) => a + b.amount, 0);
      const netProfit = totalSales - totalExpenses;
      const share = netProfit / 3;

      log.netProfit = netProfit;
      log.partnerShares = {
        'حمد': share - log.deductions.filter(d => d.partner === 'حمد').reduce((a, b) => a + b.amount, 0),
        'فهد': share - log.deductions.filter(d => d.partner === 'فهد').reduce((a, b) => a + b.amount, 0),
        'جميل': share - log.deductions.filter(d => d.partner === 'جميل').reduce((a, b) => a + b.amount, 0),
      };

      newLogs[logIdx] = log;
      setDailyLogs(newLogs);
    }
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    const { source, id } = confirmDelete;

    if (source === 'current') {
      setDeductions(prev => prev.filter(d => d.id !== id));
    } else {
      const newLogs = [...dailyLogs];
      const logIdx = source as number;
      const log = { ...newLogs[logIdx] };
      
      log.deductions = log.deductions.filter(d => d.id !== id);
      
      // إعادة الاحتساب
      const totalSales = log.sales.reduce((a, b) => a + b.amount, 0);
      const totalExpenses = log.expenses.reduce((a, b) => a + b.amount, 0);
      const netProfit = totalSales - totalExpenses;
      const share = netProfit / 3;

      log.netProfit = netProfit;
      log.partnerShares = {
        'حمد': share - log.deductions.filter(d => d.partner === 'حمد').reduce((a, b) => a + b.amount, 0),
        'فهد': share - log.deductions.filter(d => d.partner === 'فهد').reduce((a, b) => a + b.amount, 0),
        'جميل': share - log.deductions.filter(d => d.partner === 'جميل').reduce((a, b) => a + b.amount, 0),
      };

      newLogs[logIdx] = log;
      setDailyLogs(newLogs);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة مع الفلاتر */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">كشف حساب الشريك</h3>
              <p className="text-xs text-gray-400">تدقيق الخصميات والسلف الشخصية</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <User size={16} className="text-gray-400" />
              <select 
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value as Partner)}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              >
                <option value="حمد">حمد</option>
                <option value="فهد">فهد</option>
                <option value="جميل">جميل</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <Calendar size={16} className="text-gray-400" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              />
            </div>

            <button 
              onClick={() => printPartnerStatementReport(selectedPartner, partnerDeductions, selectedMonth, totalDeductions)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Printer size={18} />
              طباعة الكشف
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 text-center">
            <p className="text-amber-600 text-xs font-bold mb-1 uppercase">إجمالي المسحوبات للفترة</p>
            <p className="text-3xl font-black text-amber-700">{totalDeductions.toLocaleString()} <span className="text-sm">ر.س</span></p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
            <p className="text-gray-400 text-xs font-bold mb-1 uppercase">عدد القيود</p>
            <p className="text-3xl font-black text-gray-700">{partnerDeductions.length}</p>
          </div>
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-6 py-4 font-black">التاريخ</th>
                <th className="px-6 py-4 font-black">البيان (نوع الخصم)</th>
                <th className="px-6 py-4 font-black">المصدر</th>
                <th className="px-6 py-4 font-black">المبلغ (ر.س)</th>
                <th className="px-6 py-4 font-black text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partnerDeductions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">لا توجد خصميات مسجلة لهذا الشريك في الفترة المختارة</td>
                </tr>
              ) : (
                partnerDeductions.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700">{d.date}</td>
                    <td className="px-6 py-4 text-sm font-medium">{d.deductionType}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${d.source === 'current' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {d.source === 'current' ? 'يومية حالية' : 'يومية مؤرشفة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-amber-600">
                      {d.amount.toLocaleString()} ر.س
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setEditingItem({ id: d.id, source: d.source, data: { ...d } })}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({ id: d.id, source: d.source })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال التعديل */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-amber-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">تعديل قيد الخصمية</h3>
              <button onClick={() => setEditingItem(null)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400">التاريخ</label>
                  <input 
                    type="date" 
                    value={editingItem.data.date} 
                    onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, date: e.target.value}})}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">البيان</label>
                  <input 
                    type="text" 
                    value={editingItem.data.deductionType} 
                    onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, deductionType: e.target.value}})}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">المبلغ</label>
                  <input 
                    type="number" 
                    value={editingItem.data.amount} 
                    onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, amount: parseFloat(e.target.value)}})}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl font-black text-amber-600 text-xl outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-100 flex items-center justify-center gap-2">
                <Save size={20} /> حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
      )}

      {/* مودال الحذف */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-fade-in">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">حذف قيد الخصمية</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">سيتم حذف هذا القيد من سجلات الشريك وإعادة احتساب أرصدة الأرباح تلقائياً. هل أنت متأكد؟</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700">نعم، حذف</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerAccountStatementView;
