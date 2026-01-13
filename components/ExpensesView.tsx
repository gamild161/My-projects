
import React, { useState, useEffect } from 'react';
import { Expense } from '../types.ts';
import { Plus, Trash2, Edit2, Save, X, Calendar } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, setExpenses }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    amount: '',
    expenseType: '',
    date: today
  });

  useEffect(() => {
    if (confirmDeleteId) {
      const timer = setTimeout(() => setConfirmDeleteId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.expenseType) return;

    if (editingId) {
      setExpenses(prev => prev.map(exp => exp.id === editingId ? {
        ...exp,
        amount: parseFloat(formData.amount),
        expenseType: formData.expenseType,
        date: formData.date
      } : exp));
      setEditingId(null);
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: parseFloat(formData.amount),
        expenseType: formData.expenseType,
        date: formData.date,
      };
      setExpenses(prev => [newExpense, ...prev]);
    }

    setFormData({ amount: '', expenseType: '', date: today });
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      amount: expense.amount.toString(),
      expenseType: expense.expenseType,
      date: expense.date.split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          {editingId ? <Edit2 size={20} className="text-blue-500" /> : <Calendar size={20} className="text-red-500" />}
          {editingId ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="w-full md:w-48 space-y-1">
            <label className="text-sm font-medium text-gray-700">التاريخ</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              required
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-sm font-medium text-gray-700">المبلغ (ر.س)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex-[2] min-w-[250px] space-y-1">
            <label className="text-sm font-medium text-gray-700">البيان (نوع الصرف)</label>
            <input
              type="text"
              value={formData.expenseType}
              onChange={(e) => setFormData({...formData, expenseType: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="مثال: فاتورة كهرباء، إيجار، أدوات مكتبية"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors h-[42px]`}
            >
              {editingId ? <Save size={20} /> : <Plus size={20} />}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {setEditingId(null); setFormData({amount: '', expenseType: '', date: today})}}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-lg transition-colors h-[42px]"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">سجل المصروفات الحالية</h3>
          <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
            إجمالي: {expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()} ر.س
          </span>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">التاريخ</th>
              <th className="px-6 py-4 font-semibold">نوع الصرف</th>
              <th className="px-6 py-4 font-semibold">المبلغ</th>
              <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">لا توجد مصروفات مسجلة حالياً</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{expense.date}</td>
                  <td className="px-6 py-4 font-medium">{expense.expenseType}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{expense.amount.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <button 
                        onClick={() => startEdit(expense)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                          confirmDeleteId === expense.id 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : 'text-gray-400 hover:text-red-600'
                        }`}
                      >
                        {confirmDeleteId === expense.id ? 'حذف؟' : <Trash2 size={16} />}
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
  );
};

export default ExpensesView;
