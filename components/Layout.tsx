
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  UserMinus, 
  History, 
  BarChart3, 
  Receipt,
  Settings,
  LogOut,
  ClipboardList,
  FileSpreadsheet
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart },
    { id: 'expenses', label: 'المصروفات', icon: Wallet },
    { id: 'expense_details', label: 'تفاصيل المصاريف الشهري', icon: ClipboardList },
    { id: 'deductions', label: 'خصميات الشركاء', icon: UserMinus },
    { id: 'partner_statements', label: 'كشوفات حساب الشركاء', icon: FileSpreadsheet },
    { id: 'daily', label: 'اليوميات', icon: History },
    { id: 'monthly', label: 'التقارير الشهرية', icon: BarChart3 },
    { id: 'debts', label: 'ديون الشركاء', icon: Receipt },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-['Cairo']">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full shadow-xl z-20 transition-all duration-300 overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-emerald-400">مكتب إنجاز زين</h1>
          <p className="text-xs text-slate-400 mt-1">نظام المحاسبة المتكامل</p>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 space-x-reverse text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2 text-sm">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <p className="text-gray-500 text-sm">أهلاً بك في نظام إنجاز زين المحاسبي</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">التاريخ الحالي:</span>
            <span className="text-emerald-600 font-bold">{new Date().toLocaleDateString('ar-EG')}</span>
          </div>
        </header>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
