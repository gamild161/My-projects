
import React, { useState, useEffect } from 'react';
import { DailyLog, Sale, Expense, Deduction, Partner } from '../types';
import { Archive, FileText, ChevronDown, ChevronUp, History, ShoppingCart, Wallet, UserMinus, Edit2, Trash2, X, Save, Calendar } from 'lucide-react';
import { printDailyReport } from '../utils/printer';

interface DailyLogsViewProps {
  dailyLogs: DailyLog[];
  onArchiveDay: (customDate?: string) => void;
  setDailyLogs: React.Dispatch<React.SetStateAction<DailyLog[]>>;
}

const DailyLogsView: React.FC<DailyLogsViewProps> = ({ dailyLogs, onArchiveDay, setDailyLogs }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{ logIndex: number, type: 'sale' | 'expense' | 'deduction', data: any } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ logIndex: number, type: 'sale' | 'expense' | 'deduction', id: string } | null>(null);
  const [archiveDate, setArchiveDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // وظيفة إعادة احتساب اليوم بالكامل بعد أي تعديل
  const recalculateLog = (log: DailyLog): DailyLog => {
    const totalSales = log.sales.reduce((a, b) => a + b.amount, 0);
    const totalExpenses = log.expenses.reduce((a, b) => a + b.amount, 0);
    const netProfit = totalSales - totalExpenses;
    const share = netProfit / 3;

    const partnerShares: Record<Partner, number> = {
      'حمد': share - log.deductions.filter(d => d.partner === 'حمد').reduce((a, b) => a + b.amount, 0),
      'فهد': share - log.deductions.filter(d => d.partner === 'فهد').reduce((a, b) => a + b.amount, 0),
      'جميل': share - log.deductions.filter(d => d.partner === 'جميل').reduce((a, b) => a + b.amount, 0),
    };

    return { ...log, totalSales, totalExpenses, netProfit, partnerShares };
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { logIndex, type, data } = editingItem;
    const newLogs = [...dailyLogs];
    const log = { ...newLogs[logIndex] };

    if (type === 'sale') {
      log.sales = log.sales.map(s => s.id === data.id ? data : s);
    } else if (type === 'expense') {
      log.expenses = log.expenses.map(ex => ex.id === data.id ? data : ex);
    } else if (type === 'deduction') {
      log.deductions = log.deductions.map(d => d.id === data.id ? data : d);
    }

    newLogs[logIndex] = recalculateLog(log);
    setDailyLogs(newLogs);
    setEditingItem(null);
  };

  const handleDeleteItem = () => {
    if (!confirmDelete) return;

    const { logIndex, type, id } = confirmDelete;
    const newLogs = [...dailyLogs];
    const log = { ...newLogs[logIndex] };

    if (type === 'sale') {
      log.sales = log.sales.filter(s => s.id !== id);
    } else if (type === 'expense') {
      log.expenses = log.expenses.filter(ex => ex.id !== id);
    } else if (type === 'deduction') {
      log.deductions = log.deductions.filter(d => d.id !== id);
    }

    newLogs[logIndex] = recalculateLog(log);
    setDailyLogs(newLogs);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 rounded-2xl shadow-lg text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">ترحيل الحسابات اليومية</h3>
          <p className="opacity-90 max-w-md">يمكنك اختيار تاريخ اليومية المراد ترحيلها قبل التأكيد.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-emerald-200" />
            <input 
              type="date" 
              value={archiveDate}
              onChange={(e) => setArchiveDate(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => onArchiveDay(archiveDate)}
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-xl transition-all hover:scale-105"
          >
            <Archive size={24} />
            ترحيل بالتقرير المختار
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {dailyLogs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا يوجد سجلات مرحلة بعد.</p>
          </div>
        ) : (
          dailyLogs.map((log, lIdx) => (
            <div key={lIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
              <div 
                onClick={() => toggleExpand(lIdx)}
                className="p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
              >
                <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600 text-center min-w-[100px]">
                  <p className="text-xs font-bold">بتاريخ</p>
                  <p className="text-xl font-black">{new Date(log.date).getDate()}</p>
                  <p className="text-xs">{new Date(log.date).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}</p>
                </div>
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">المبيعات</p>
                    <p className="font-bold text-gray-800">{log.totalSales.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">المصروفات</p>
                    <p className="font-bold text-red-500">{log.totalExpenses.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">صافي الربح</p>
                    <p className="font-bold text-emerald-600">{log.netProfit.toLocaleString()} ر.س</p>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    <p className="mb-1">نصيب الفرد:</p>
                    <p className="font-bold">{(log.netProfit / 3).toLocaleString(undefined, {maximumFractionDigits: 0})} ر.س</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); printDailyReport(log); }}
                    className="p-2 text-gray-400 hover:text-emerald-600"
                    title="طباعة"
                  >
                    <FileText size={20} />
                  </button>
                  {expandedIndex === lIdx ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
              </div>

              {expandedIndex === lIdx && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-8 animate-fade-in">
                  {/* Sales Table */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-emerald-700 flex items-center gap-2 text-sm">
                      <ShoppingCart size={16} /> تفاصيل المبيعات ({log.sales.length})
                    </h4>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-4 py-3">تاريخ القيد</th>
                            <th className="px-4 py-3">العميل</th>
                            <th className="px-4 py-3">الخدمة</th>
                            <th className="px-4 py-3">المبلغ</th>
                            <th className="px-4 py-3 text-center">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {log.sales.map(sale => (
                            <tr key={sale.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-400">{sale.date}</td>
                              <td className="px-4 py-2 font-medium">{sale.customerName}</td>
                              <td className="px-4 py-2">{sale.serviceType}</td>
                              <td className="px-4 py-2 font-bold text-emerald-600">{sale.amount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => setEditingItem({ logIndex: lIdx, type: 'sale', data: sale })} className="text-blue-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                  <button onClick={() => setConfirmDelete({ logIndex: lIdx, type: 'sale', id: sale.id })} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Expenses Table */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-red-700 flex items-center gap-2 text-sm">
                      <Wallet size={16} /> تفاصيل المصروفات ({log.expenses.length})
                    </h4>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-4 py-3">تاريخ القيد</th>
                            <th className="px-4 py-3">البيان</th>
                            <th className="px-4 py-3">المبلغ</th>
                            <th className="px-4 py-3 text-center">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {log.expenses.map(ex => (
                            <tr key={ex.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-400">{ex.date}</td>
                              <td className="px-4 py-2">{ex.expenseType}</td>
                              <td className="px-4 py-2 font-bold text-red-600">{ex.amount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => setEditingItem({ logIndex: lIdx, type: 'expense', data: ex })} className="text-blue-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                  <button onClick={() => setConfirmDelete({ logIndex: lIdx, type: 'expense', id: ex.id })} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Deductions Table */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-amber-700 flex items-center gap-2 text-sm">
                      <UserMinus size={16} /> تفاصيل الخصميات ({log.deductions.length})
                    </h4>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-4 py-3">تاريخ القيد</th>
                            <th className="px-4 py-3">الشريك</th>
                            <th className="px-4 py-3">البيان</th>
                            <th className="px-4 py-3">المبلغ</th>
                            <th className="px-4 py-3 text-center">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {log.deductions.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-400">{d.date}</td>
                              <td className="px-4 py-2 font-bold">{d.partner}</td>
                              <td className="px-4 py-2">{d.deductionType}</td>
                              <td className="px-4 py-2 font-bold text-amber-600">{d.amount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => setEditingItem({ logIndex: lIdx, type: 'deduction', data: d })} className="text-blue-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                  <button onClick={() => setConfirmDelete({ logIndex: lIdx, type: 'deduction', id: d.id })} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">تعديل بند في الأرشيف</h3>
              <button onClick={() => setEditingItem(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateItem} className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-gray-500">التاريخ</label><input type="date" value={editingItem.data.date} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, date: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
              {editingItem.type === 'sale' && (
                <>
                  <div><label className="text-xs font-bold text-gray-500">اسم العميل</label><input type="text" value={editingItem.data.customerName} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, customerName: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div><label className="text-xs font-bold text-gray-500">الخدمة</label><input type="text" value={editingItem.data.serviceType} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, serviceType: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
                </>
              )}
              {editingItem.type === 'expense' && (
                <div><label className="text-xs font-bold text-gray-500">نوع المصرف</label><input type="text" value={editingItem.data.expenseType} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, expenseType: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
              )}
              {editingItem.type === 'deduction' && (
                <div><label className="text-xs font-bold text-gray-500">بيان الخصم</label><input type="text" value={editingItem.data.deductionType} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, deductionType: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
              )}
              <div><label className="text-xs font-bold text-gray-500">المبلغ</label><input type="number" value={editingItem.data.amount} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, amount: parseFloat(e.target.value)}})} className="w-full px-4 py-2 border rounded-lg text-lg font-bold" /></div>
              
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Save size={20} /> حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-fade-in">
            <Trash2 size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد الحذف من الأرشيف</h3>
            <p className="text-gray-500 text-sm mb-6">هل أنت متأكد من حذف هذا البند بشكل نهائي؟ سيتم إعادة احتساب أرباح اليوم تلقائياً.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteItem} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">نعم، حذف</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogsView;
