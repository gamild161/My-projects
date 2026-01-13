
import React, { useState } from 'react';
import { MonthlyReport, Partner } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Printer, TrendingUp, Edit2, Trash2, ChevronDown, ChevronUp, Save, X, Calculator } from 'lucide-react';
import { printMonthlyReport } from '../utils/printer';

interface MonthlyReportsViewProps {
  monthlyReports: MonthlyReport[];
  onGenerateMonthly: () => void;
  setMonthlyReports: React.Dispatch<React.SetStateAction<MonthlyReport[]>>;
}

const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({ monthlyReports, onGenerateMonthly, setMonthlyReports }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [editingReport, setEditingReport] = useState<{ idx: number, data: MonthlyReport } | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    
    const newReports = [...monthlyReports];
    // إعادة احتساب الربح الصافي تلقائياً عند تعديل المبيعات أو المصاريف
    const updatedData = {
      ...editingReport.data,
      netProfit: editingReport.data.totalSales - editingReport.data.totalExpenses
    };
    
    // إعادة توزيع الحصص بناءً على الربح الجديد
    const share = updatedData.netProfit / 3;
    updatedData.partnerShares = {
      'حمد': share,
      'فهد': share,
      'جميل': share
    };

    newReports[editingReport.idx] = updatedData;
    setMonthlyReports(newReports);
    setEditingReport(null);
  };

  const handleDelete = () => {
    if (confirmDeleteIdx === null) return;
    const newReports = monthlyReports.filter((_, i) => i !== confirmDeleteIdx);
    setMonthlyReports(newReports);
    setConfirmDeleteIdx(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">الأرشيف المالي الشهري</h3>
        <button
          onClick={onGenerateMonthly}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <TrendingUp size={20} />
          إصدار تقرير الشهر الحالي
        </button>
      </div>

      {monthlyReports.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-6">تحليل الأداء الربحي عبر الشهور</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...monthlyReports].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="netProfit" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {monthlyReports.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed text-center text-gray-400">
            لا توجد تقارير شهرية مصدرة حتى الآن.
          </div>
        ) : (
          monthlyReports.map((report, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer hover:bg-gray-50/50 transition-all"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-100 text-center min-w-[120px]">
                    <p className="text-[10px] font-bold opacity-80 uppercase">تقرير شهر</p>
                    <p className="text-xl font-black leading-none mt-1">{report.month}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-800">ملخص مالي شامل</h5>
                    <p className="text-xs text-gray-400">تم الإصدار في نهاية دورة العمل الشهرية</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:px-12">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold mb-1">المبيعات</p>
                    <p className="font-bold">{report.totalSales.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold mb-1">صافي الربح</p>
                    <p className="font-bold text-emerald-600">{report.netProfit.toLocaleString()} ر.س</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-gray-400 text-[10px] font-bold mb-1">حصص الشركاء</p>
                    <p className="font-medium text-blue-600 text-xs">{(report.netProfit / 3).toLocaleString()} ر.س / شريك</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingReport({ idx, data: report }); }}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteIdx(idx); }}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); printMonthlyReport(report); }}
                    className="p-2 text-gray-400 hover:text-emerald-600"
                  >
                    <Printer size={18} />
                  </button>
                  <div className="ml-2">
                    {expandedIdx === idx ? <ChevronUp className="text-gray-300" /> : <ChevronDown className="text-gray-300" />}
                  </div>
                </div>
              </div>

              {expandedIdx === idx && (
                <div className="px-6 pb-8 animate-fade-in">
                  <div className="border-t border-gray-50 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h6 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                        <Calculator size={14} /> توزيع الأرباح النهائي
                      </h6>
                      <div className="space-y-2">
                        {Object.entries(report.partnerShares).map(([name, share]) => (
                          <div key={name} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="font-bold text-gray-700">{name}</span>
                            <span className="font-black text-blue-600">{(share as number).toLocaleString()} ر.س</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                      <h6 className="text-xs font-black text-blue-400 uppercase mb-4">تفاصيل الحساب الشهري</h6>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">إجمالي دخل المبيعات:</span>
                          <span className="font-bold">{report.totalSales.toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">إجمالي المصروفات التشغيلية:</span>
                          <span className="font-bold text-red-500">{report.totalExpenses.toLocaleString()} ر.س</span>
                        </div>
                        <div className="pt-3 border-t border-blue-100 flex justify-between font-black text-emerald-700">
                          <span>الربح النهائي المصدر:</span>
                          <span>{report.netProfit.toLocaleString()} ر.س</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Monthly Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">تعديل بيانات تقرير: {editingReport.data.month}</h3>
              <button onClick={() => setEditingReport(null)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">إجمالي المبيعات</label>
                  <input 
                    type="number" 
                    value={editingReport.data.totalSales} 
                    onChange={e => setEditingReport({...editingReport, data: {...editingReport.data, totalSales: parseFloat(e.target.value) || 0}})}
                    className="w-full px-4 py-3 border rounded-xl font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">إجمالي المصروفات</label>
                  <input 
                    type="number" 
                    value={editingReport.data.totalExpenses} 
                    onChange={e => setEditingReport({...editingReport, data: {...editingReport.data, totalExpenses: parseFloat(e.target.value) || 0}})}
                    className="w-full px-4 py-3 border rounded-xl font-bold text-red-600 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-1">صافي الربح الجديد (محسوب تلقائياً)</p>
                <p className="text-2xl font-black text-gray-800">
                  {(editingReport.data.totalSales - editingReport.data.totalExpenses).toLocaleString()} ر.س
                </p>
              </div>
              <p className="text-xs text-amber-600 font-medium text-center">
                ملاحظة: عند الحفظ سيتم إعادة توزيع الحصص بالتساوي على الشركاء بناءً على الربح الجديد.
              </p>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all">
                <Save size={20} /> حفظ التعديلات في الأرشيف
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteIdx !== null && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-fade-in">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">حذف التقرير الشهري؟</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">أنت على وشك حذف هذا التقرير من الأرشيف التاريخي. لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100">نعم، حذف</button>
              <button onClick={() => setConfirmDeleteIdx(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReportsView;
