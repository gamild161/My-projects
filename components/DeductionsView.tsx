
import React, { useState, useEffect } from 'react';
import { Deduction, Partner } from '../types';
import { Plus, Trash2, Edit2, Save, X, Calendar } from 'lucide-react';

interface DeductionsViewProps {
  deductions: Deduction[];
  setDeductions: React.Dispatch<React.SetStateAction<Deduction[]>>;
}

const DeductionsView: React.FC<DeductionsViewProps> = ({ deductions, setDeductions }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    partner: 'حمد' as Partner,
    amount: '',
    deductionType: '',
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
    if (!formData.amount || !formData.deductionType) return;

    if (editingId) {
      setDeductions(prev => prev.map(d => d.id === editingId ? {
        ...d,
        partner: formData.partner,
        amount: parseFloat(formData.amount),
        deductionType: formData.deductionType,
        date: formData.date
      } : d));
      setEditingId(null);
    } else {
      const newDeduction: Deduction = {
        id: Date.now().toString(),
        partner: formData.partner,
        amount: parseFloat(formData.amount),
        deductionType: formData.deductionType,
        date: formData.date,
      };
      setDeductions(prev => [newDeduction, ...prev]);
    }

    setFormData({ ...formData, amount: '', deductionType: '', date: today });
  };

  const startEdit = (deduction: Deduction) => {
    setEditingId(deduction.id);
    setFormData({
      partner: deduction.partner,
      amount: deduction.amount.toString(),
      deductionType: deduction.deductionType,
      date: deduction.date.split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      setDeductions(prev => prev.filter(d => d.id !== id));
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          {editingId ? <Edit2 size={20} className="text-blue-500" /> : <Calendar size={20} className="text-amber-500" />}
          {editingId ? 'تعديل خصمية الشريك' : 'تسجيل خصمية شريك'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">التاريخ</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">الشريك</label>
            <select
              value={formData.partner}
              onChange={(e) => setFormData({...formData, partner: e.target.value as Partner})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold"
            >
              <option value="حمد">حمد</option>
              <option value="فهد">فهد</option>
              <option value="جميل">جميل</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">المبلغ (ر.س)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">نوع الخصم / السلفة</label>
            <input
              type="text"
              value={formData.deductionType}
              onChange={(e) => setFormData({...formData, deductionType: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="مثال: سلفة شخصية"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'} text-white px-8 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors h-[42px]`}
            >
              {editingId ? <Save size={20} /> : <Plus size={20} />}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-lg transition-colors h-[42px]"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['حمد', 'فهد', 'جميل'].map((name) => {
          const partnerItems = deductions.filter(d => d.partner === name);
          const partnerTotal = partnerItems.reduce((a, b) => a + b.amount, 0);
          return (
            <div key={name} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h4 className="font-bold text-gray-800">خصميات {name}</h4>
                <span className="text-amber-600 font-bold">{partnerTotal.toLocaleString()} ر.س</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {partnerItems.length === 0 ? (
                  <p className="p-4 text-center text-gray-400 text-sm">لا توجد خصميات حالياً</p>
                ) : (
                  partnerItems.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center group hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">{item.date}</span>
                          <p className="text-sm font-medium text-gray-700">{item.deductionType}</p>
                        </div>
                        <p className="text-xs text-gray-400">{item.amount.toLocaleString()} ر.س</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEdit(item)}
                          className="text-gray-400 hover:text-blue-600 p-1.5"
                          title="تعديل"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className={`px-2 py-1 rounded font-bold text-[10px] transition-all ${
                            confirmDeleteId === item.id 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          {confirmDeleteId === item.id ? 'حذف؟' : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeductionsView;
