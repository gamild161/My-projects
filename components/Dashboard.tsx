
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Sale, Expense, Deduction } from '../types.ts';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  deductions: Deduction[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, deductions }) => {
  const totalSales = sales.reduce((acc, s) => acc + s.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const data = [
    { name: 'المبيعات', value: totalSales },
    { name: 'المصروفات', value: totalExpenses },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const partnerDeductions = [
    { name: 'حمد', value: deductions.filter(d => d.partner === 'حمد').reduce((a, b) => a + b.amount, 0) },
    { name: 'فهد', value: deductions.filter(d => d.partner === 'فهد').reduce((a, b) => a + b.amount, 0) },
    { name: 'جميل', value: deductions.filter(d => d.partner === 'جميل').reduce((a, b) => a + b.amount, 0) },
  ];

  const PARTNER_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1 font-medium">إجمالي المبيعات</p>
          <p className="text-3xl font-bold text-gray-900">{totalSales.toLocaleString()} <span className="text-sm">ر.س</span></p>
          <div className="mt-4 w-full bg-emerald-50 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[100%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1 font-medium">إجمالي المصروفات</p>
          <p className="text-3xl font-bold text-red-600">{totalExpenses.toLocaleString()} <span className="text-sm">ر.س</span></p>
          <div className="mt-4 w-full bg-red-50 h-2 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-[100%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1 font-medium">صافي الربح</p>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {netProfit.toLocaleString()} <span className="text-sm">ر.س</span>
          </p>
          <div className="mt-4 w-full bg-blue-50 h-2 rounded-full overflow-hidden">
            <div className={`h-full ${netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'} w-[100%]`}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">تحليل الأداء المالي</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">توزيع خصميات الشركاء</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={partnerDeductions}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {partnerDeductions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PARTNER_COLORS[index % PARTNER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
