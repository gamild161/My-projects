
import React, { useState, useEffect } from 'react';
import { Sale } from '../types.ts';
import { Plus, Trash2, Edit2, X, Save, Calendar } from 'lucide-react';

interface SalesViewProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
}

const SalesView: React.FC<SalesViewProps> = ({ sales, setSales }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    serviceType: '',
    orderNumber: '',
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
    if (!formData.customerName || !formData.amount) return;

    if (editingId) {
      setSales(prev => prev.map(s => s.id === editingId ? {
        ...s,
        customerName: formData.customerName,
        amount: parseFloat(formData.amount),
        serviceType: formData.serviceType,
        orderNumber: formData.orderNumber,
        date: formData.date
      } : s));
      setEditingId(null);
    } else {
      const newSale: Sale = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        amount: parseFloat(formData.amount),
        serviceType: formData.serviceType,
        orderNumber: formData.orderNumber,
        date: formData.date,
      };
      setSales(prev => [newSale, ...prev]);
    }

    setFormData({ customerName: '', amount: '', serviceType: '', orderNumber: '', date: today });
  };

  const startEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setFormData({
      customerName: sale.customerName,
      amount: sale.amount.toString(),
      serviceType: sale.serviceType || '',
      orderNumber: sale.orderNumber || '',
      date: sale.date.split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      setSales(prev => prev.filter(s => s.id !== id));
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          {editingId ? <Edit2 size={20} className="text-blue-500" /> : <Plus size={20} className="text-emerald-500" />}
          {editingId ? 'تعديل بيانات العملية' : 'إضافة عملية بيع جديدة'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">التاريخ</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                required
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">اسم العميل</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="مثال: أحمد محمد"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">المبلغ (ر.س)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">نوع الخدمة</label>
            <input
              type="text"
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="مثال: تجديد إقامة"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">رقم الطلب / الإجراء</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="1001"
              />
              <div className="flex gap-2 shrink-0">
                <button
                  type="submit"
                  className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors`}
                >
                  {editingId ? <Save size={20} /> : <Plus size={20} />}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {setEditingId(null); setFormData({customerName: '', amount: '', serviceType: '', orderNumber: '', date: today})}}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">العمليات المدخلة حالياً</h3>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
            {sales.length} عملية
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">التاريخ</th>
                <th className="px-6 py-4 font-semibold">رقم الطلب</th>
                <th className="px-6 py-4 font-semibold">العميل</th>
                <th className="px-6 py-4 font-semibold">الخدمة</th>
                <th className="px-6 py-4 font-semibold">المبلغ</th>
                <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">لا توجد مبيعات مسجلة حالياً</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{sale.date}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{sale.orderNumber || '-'}</td>
                    <td className="px-6 py-4 font-medium">{sale.customerName}</td>
                    <td className="px-6 py-4">{sale.serviceType || '-'}</td>
                    <td className="px-6 py-4 font-bold">{sale.amount.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => startEdit(sale)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(sale.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all font-bold text-xs ${
                            confirmDeleteId === sale.id 
                            ? 'bg-red-600 text-white animate-pulse shadow-lg' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {confirmDeleteId === sale.id ? 'تأكيد الحذف؟' : <Trash2 size={16} />}
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
    </div>
  );
};

export default SalesView;
