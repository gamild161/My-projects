
import React, { useState } from 'react';
import { DailyLog, MonthlyReport, Partner } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Landmark, FileText } from 'lucide-react';
import { printPartnerDebtsReport } from '../utils/printer.ts';

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
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">الأرصدة الصافية للشركاء</h3>
            <button 
              onClick={() => printPartnerDebtsReport(partnerBalances)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <FileText size={16} />
              تحميل تقرير PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {partnerBalances.map((p) => (
              <div key={p.name} className={`bg-white p-6 rounded-2xl shadow-sm border ${p.balance < 0 ? 'border-red-100 bg-red-50/10' : 'border-gray-100'} transition-all`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">{p.name}</span>
                </div>
                <p className={`text-2xl font-black ${p.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(p.balance).toLocaleString()} <span className="text-sm">ر.س</span>
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
        </div>
      </div>
    </div>
  );
};

export default PartnerDebtsView;
