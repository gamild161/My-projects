
import React, { useState } from 'react';
import { DailyLog, MonthlyReport, Partner } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Landmark, FileText } from 'lucide-react';
import { printPartnerDebtsReport } from '../utils/printer';

interface PartnerDebtsViewProps {
  dailyLogs: DailyLog[];
  monthlyReports: MonthlyReport[];
  onSettle: (partner: Partner, amount: number, note: string) => void;
}

const PartnerDebtsView: React.FC<PartnerDebtsViewProps> = ({ dailyLogs, monthlyReports, onSettle }) => {
  const partners: Partner[] = ['حمد', 'فهد', 'جميل'];
  const [showSettleModal, setShowSettleModal] = useState<Partner | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('تسوية رصيد يدوي');

  // حساب الرصيد التراكمي: (مجموع الحصص المرحّلة)
  const partnerBalances = partners.map(name => {
    const totalEarnings = dailyLogs.reduce((acc, log) => acc + (log.partnerShares[name] || 0), 0);
    return { name, balance: totalEarnings };
  });

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6'];

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSettleModal && settleAmount) {
      onSettle(showSettleModal, parseFloat(settleAmount), settleNote);
      setShowSettleModal(null);
      setSettleAmount('');
      setSettleNote('تسوية رصيد يدوي');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ملخص الأرصدة */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">الأرصدة الصافية للشركاء</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => printPartnerDebtsReport(partnerBalances)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <FileText size={16} />
                تحميل تقرير PDF
              </button>
              <div className="flex gap-2 text-xs font-medium text-gray-400 italic">
                <RefreshCcw size={14} />
                يتم التحديث بعد كل ترحيل يومي
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {partnerBalances.map((p) => (
              <div key={p.name} className={`bg-white p-6 rounded-2xl shadow-sm border ${p.balance < 0 ? 'border-red-100 bg-red-50/10' : 'border-gray-100'} transition-all`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">{p.name}</span>
                  {p.balance >= 0 ? (
                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><ArrowUpRight size={16} /></div>
                  ) : (
                    <div className="bg-red-100 text-red-600 p-1.5 rounded-full"><ArrowDownRight size={16} /></div>
                  )}
                </div>
                <p className={`text-2xl font-black ${p.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(p.balance).toLocaleString()} <span className="text-sm">ر.س</span>
                </p>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  {p.balance >= 0 ? 'رصيد مستحق له' : 'دين مستحق عليه'}
                </p>
                <button 
                  onClick={() => setShowSettleModal(p.name)}
                  className="mt-6 w-full py-2.5 text-sm font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Landmark size={14} />
                  تسوية الآن
                </button>
              </div>
            ))}
          </div>

          {/* ديون بينية توضيحية */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-500" />
              كيفية تسوية الديون بين الشركاء
            </h4>
            <div className="space-y-3">
              {partnerBalances.filter(p => p.balance < 0).map(debtor => {
                const creditors = partnerBalances.filter(p => p.balance > 0);
                const totalPositive = creditors.reduce((a, b) => a + b.balance, 0);
                
                return debtor.balance < 0 && creditors.length > 0 ? (
                  <div key={debtor.name} className="text-sm bg-gray-50 p-4 rounded-xl">
                    <span className="font-bold text-red-600">{debtor.name}</span> مدين بمبلغ <span className="font-bold">{Math.abs(debtor.balance).toLocaleString()} ر.س</span> موزعة كالتالي:
                    <ul className="mt-2 space-y-1 mr-4 list-disc text-gray-600">
                      {creditors.map(creditor => {
                        const proportion = (creditor.balance / totalPositive) * Math.abs(debtor.balance);
                        return (
                          <li key={creditor.name}>
                            يدفع لـ <span className="font-bold text-emerald-600">{creditor.name}</span> مبلغ {proportion.toLocaleString(undefined, {maximumFractionDigits: 0})} ر.س
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null;
              })}
              {partnerBalances.every(p => p.balance >= 0) && (
                <p className="text-sm text-emerald-600 bg-emerald-50 p-4 rounded-xl font-medium text-center">
                  جميع الحسابات متوازنة، لا توجد ديون معلقة حالياً.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* الرسم البياني */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-6">توزيع الحصص الصافية</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={partnerBalances.map(p => ({ name: p.name, value: Math.max(0, p.balance) }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {partnerBalances.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 mb-1">إجمالي الأرباح المتوفرة للشركاء</p>
            <p className="text-xl font-black text-slate-800">
              {partnerBalances.reduce((a, b) => a + Math.max(0, b.balance), 0).toLocaleString()} ر.س
            </p>
          </div>
        </div>
      </div>

      {/* مودال التسوية */}
      {showSettleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <h3 className="text-xl font-bold">تسوية مالية: {showSettleModal}</h3>
              <p className="text-emerald-100 text-sm mt-1">إضافة مبلغ لتصفية الدين أو تعديل الرصيد</p>
            </div>
            <form onSubmit={handleSettleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المبلغ المدفوع (ر.س)</label>
                <input 
                  type="number" 
                  autoFocus
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-bold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظة التسوية</label>
                <input 
                  type="text" 
                  value={settleNote}
                  onChange={(e) => setSettleNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="مثال: سداد نقدي جزئي"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  تأكيد التسوية
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSettleModal(null)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDebtsView;
