
import React, { useState, useMemo } from 'react';
import { Deduction, DailyLog, Partner } from '../types.ts';
import { Search, Printer, Edit2, Trash2, Calendar, User, FileText, X, Save, Filter } from 'lucide-react';
import { printPartnerStatementReport } from '../utils/printer.ts';

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

  const partnerDeductions = useMemo(() => {
    const list: Array<Deduction & { source: 'current' | number }> = [];
    currentDeductions.forEach(d => { if (d.partner === selectedPartner) list.push({ ...d, source: 'current' }); });
    dailyLogs.forEach((log, logIdx) => {
      log.deductions.forEach(d => { if (d.partner === selectedPartner) list.push({ ...d, source: logIdx }); });
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><FileText size={24} /></div>
            <div><h3 className="text-xl font-bold text-gray-800">كشف حساب الشريك</h3><p className="text-xs text-gray-400">تدقيق الخصميات والسلف الشخصية</p></div>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <User size={16} className="text-gray-400" /><select value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value as Partner)} className="bg-transparent text-sm font-bold outline-none cursor-pointer"><option value="حمد">حمد</option><option value="فهد">فهد</option><option value="جميل">جميل</option></select>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"><Calendar size={16} className="text-gray-400" /><input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer" /></div>
            <button onClick={() => printPartnerStatementReport(selectedPartner, partnerDeductions, selectedMonth, totalDeductions)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"><Printer size={18} /> طباعة الكشف</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr><th className="px-6 py-4 font-black">التاريخ</th><th className="px-6 py-4 font-black">البيان</th><th className="px-6 py-4 font-black">المصدر</th><th className="px-6 py-4 font-black">المبلغ</th><th className="px-6 py-4 font-black text-center">الإجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partnerDeductions.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{d.date}</td>
                  <td className="px-6 py-4 text-sm font-medium">{d.deductionType}</td>
                  <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${d.source === 'current' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{d.source === 'current' ? 'حالية' : 'مؤرشفة'}</span></td>
                  <td className="px-6 py-4 font-black text-amber-600">{d.amount.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4 text-center"><div className="flex justify-center gap-2">
                    <button onClick={() => setEditingItem({ id: d.id, source: d.source, data: { ...d } })} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => setConfirmDelete({ id: d.id, source: d.source })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerAccountStatementView;
