
import React, { useState, useMemo } from 'react';
import { Expense, DailyLog, Partner } from '../types.ts';
import { Search, Printer, Edit2, Trash2, Calendar, Wallet, Download, X, Save } from 'lucide-react';
import { printExpenseReport } from '../utils/printer.ts';

interface MonthlyExpensesDetailViewProps {
  currentExpenses: Expense[];
  dailyLogs: DailyLog[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setDailyLogs: React.Dispatch<React.SetStateAction<DailyLog[]>>;
}

const MonthlyExpensesDetailView: React.FC<MonthlyExpensesDetailViewProps> = ({ 
  currentExpenses, 
  dailyLogs, 
  setExpenses, 
  setDailyLogs 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [editingItem, setEditingItem] = useState<{ id: string, source: 'current' | number, data: Expense } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, source: 'current' | number } | null>(null);

  const allExpenses = useMemo(() => {
    const list: Array<Expense & { source: 'current' | number }> = [];
    currentExpenses.forEach(exp => { list.push({ ...exp, source: 'current' }); });
    dailyLogs.forEach((log, logIdx) => {
      log.expenses.forEach(exp => { list.push({ ...exp, source: logIdx }); });
    });
    return list
      .filter(exp => exp.date.startsWith(selectedMonth))
      .filter(exp => 
        exp.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.amount.toString().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentExpenses, dailyLogs, selectedMonth, searchTerm]);

  const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const { source, data } = editingItem;
    if (source === 'current') {
      setExpenses(prev => prev.map(exp => exp.id === data.id ? data : exp));
    } else {
      const newLogs = [...dailyLogs];
      const logIdx = source as number;
      const log = { ...newLogs[logIdx] };
      log.expenses = log.expenses.map(exp => exp.id === data.id ? data : exp);
      const totalSales = log.sales.reduce((a, b) => a + b.amount, 0);
      const totalExpenses = log.expenses.reduce((a, b) => a + b.amount, 0);
      const netProfit = totalSales - totalExpenses;
      const share = netProfit / 3;
      log.totalExpenses = totalExpenses;
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
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } else {
      const newLogs = [...dailyLogs];
      const logIdx = source as number;
      const log = { ...newLogs[logIdx] };
      log.expenses = log.expenses.filter(exp => exp.id !== id);
      const totalSales = log.sales.reduce((a, b) => a + b.amount, 0);
      const totalExpenses = log.expenses.reduce((a, b) => a + b.amount, 0);
      const netProfit = totalSales - totalExpenses;
      const share = netProfit / 3;
      log.totalExpenses = totalExpenses;
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-red-50 p-3 rounded-xl text-red-600"><Wallet size={24} /></div>
          <div><h3 className="text-xl font-bold text-gray-800">جرد المصاريف التفصيلي</h3><p className="text-xs text-gray-400">تحليل وتدقيق كافة بنود الصرف الشهري</p></div>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <input type="text" placeholder="ابحث عن مبلغ أو بيان..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <Calendar size={16} className="text-gray-400" /><input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer" />
          </div>
          <button onClick={() => printExpenseReport(allExpenses, selectedMonth, totalAmount)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg"><Printer size={16} /> طباعة الكشف</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">إجمالي المصاريف للفترة</p>
          <p className="text-3xl font-black text-red-600">{totalAmount.toLocaleString()} <span className="text-sm">ر.س</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">عدد البنود</p>
          <p className="text-3xl font-black text-gray-800">{allExpenses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">الحالة</p>
          <p className="text-3xl font-black text-emerald-600">جاهز</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr><th className="px-6 py-4 font-black">التاريخ</th><th className="px-6 py-4 font-black">المصدر</th><th className="px-6 py-4 font-black">البيان</th><th className="px-6 py-4 font-black">المبلغ</th><th className="px-6 py-4 font-black text-center">الإجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{exp.date}</td>
                  <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${exp.source === 'current' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{exp.source === 'current' ? 'حالية' : 'مؤرشفة'}</span></td>
                  <td className="px-6 py-4 text-sm font-medium">{exp.expenseType}</td>
                  <td className="px-6 py-4 font-black text-red-600">{exp.amount.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4 text-center"><div className="flex justify-center gap-2">
                    <button onClick={() => setEditingItem({ id: exp.id, source: exp.source, data: { ...exp } })} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => setConfirmDelete({ id: exp.id, source: exp.source })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-red-600 p-6 text-white flex justify-between items-center"><h3 className="font-bold text-lg">تعديل بند مصروف</h3><button onClick={() => setEditingItem(null)}><X size={24} /></button></div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase">التاريخ</label><input type="date" value={editingItem.data.date} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, date: e.target.value}})} className="w-full px-4 py-3 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase">البيان</label><input type="text" value={editingItem.data.expenseType} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, expenseType: e.target.value}})} className="w-full px-4 py-3 border border-gray-100 rounded-xl font-medium outline-none focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase">المبلغ</label><input type="number" value={editingItem.data.amount} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, amount: parseFloat(e.target.value)}})} className="w-full px-4 py-3 border border-gray-100 rounded-xl font-black text-red-600 text-xl outline-none focus:ring-2 focus:ring-red-500" /></div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Save size={20} /> حفظ التعديلات</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpensesDetailView;
