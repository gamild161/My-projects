
import React, { useState } from 'react';
import { MonthlyReport, Partner } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Printer, TrendingUp, Edit2, Trash2, ChevronDown, ChevronUp, Save, X, Calculator } from 'lucide-react';
import { printMonthlyReport } from '../utils/printer.ts';

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
    const updatedData = {
      ...editingReport.data,
      netProfit: editingReport.data.totalSales - editingReport.data.totalExpenses
    };
    
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
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyReportsView;
