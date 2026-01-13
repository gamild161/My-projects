
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SalesView from './components/SalesView';
import ExpensesView from './components/ExpensesView';
import DeductionsView from './components/DeductionsView';
import DailyLogsView from './components/DailyLogsView';
import MonthlyReportsView from './components/MonthlyReportsView';
import MonthlyExpensesDetailView from './components/MonthlyExpensesDetailView';
import PartnerAccountStatementView from './components/PartnerAccountStatementView';
import PartnerDebtsView from './components/PartnerDebtsView';
import SettingsView from './components/SettingsView';
import { Sale, Expense, Deduction, DailyLog, MonthlyReport, PartnerDebt, Partner } from './types';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from './utils/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [sales, setSales] = useState<Sale[]>(() => getFromStorage(STORAGE_KEYS.SALES, []));
  const [expenses, setExpenses] = useState<Expense[]>(() => getFromStorage(STORAGE_KEYS.EXPENSES, []));
  const [deductions, setDeductions] = useState<Deduction[]>(() => getFromStorage(STORAGE_KEYS.DEDUCTIONS, []));
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => getFromStorage(STORAGE_KEYS.DAILY_LOGS, []));
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>(() => getFromStorage(STORAGE_KEYS.MONTHLY_REPORTS, []));
  const [debts, setDebts] = useState<PartnerDebt[]>(() => getFromStorage(STORAGE_KEYS.PARTNER_DEBTS, [
    { partner: 'حمد', totalDebt: 0 },
    { partner: 'فهد', totalDebt: 0 },
    { partner: 'جميل', totalDebt: 0 },
  ]));

  useEffect(() => saveToStorage(STORAGE_KEYS.SALES, sales), [sales]);
  useEffect(() => saveToStorage(STORAGE_KEYS.EXPENSES, expenses), [expenses]);
  useEffect(() => saveToStorage(STORAGE_KEYS.DEDUCTIONS, deductions), [deductions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.DAILY_LOGS, dailyLogs), [dailyLogs]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MONTHLY_REPORTS, monthlyReports), [monthlyReports]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PARTNER_DEBTS, debts), [debts]);

  const onArchiveDay = (customDate?: string) => {
    if (sales.length === 0 && expenses.length === 0 && deductions.length === 0) {
      alert("لا توجد بيانات لترحيلها حالياً.");
      return;
    }

    const totalSales = sales.reduce((a, b) => a + b.amount, 0);
    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const netProfit = totalSales - totalExpenses;
    const share = netProfit / 3;

    const archiveDate = customDate || new Date().toISOString().split('T')[0];

    const newLog: DailyLog = {
      date: archiveDate,
      totalSales,
      totalExpenses,
      netProfit,
      partnerShares: {
        'حمد': share - deductions.filter(d => d.partner === 'حمد').reduce((a, b) => a + b.amount, 0),
        'فهد': share - deductions.filter(d => d.partner === 'فهد').reduce((a, b) => a + b.amount, 0),
        'جميل': share - deductions.filter(d => d.partner === 'جميل').reduce((a, b) => a + b.amount, 0),
      },
      deductions: [...deductions],
      sales: [...sales],
      expenses: [...expenses],
    };

    setDailyLogs(prev => [newLog, ...prev].slice(0, 100));
    setSales([]);
    setExpenses([]);
    setDeductions([]);
    alert(`تم ترحيل البيانات بنجاح بتاريخ ${archiveDate}!`);
  };

  const onGenerateMonthly = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const logsThisMonth = dailyLogs.filter(log => log.date.startsWith(currentMonth));
    
    if (logsThisMonth.length === 0) {
      alert("لا توجد يوميات مرحلة لهذا الشهر لإنتاج تقرير.");
      return;
    }

    if (monthlyReports.some(r => r.month === currentMonth)) {
      if (!window.confirm("يوجد تقرير مصدر لهذا الشهر بالفعل، هل تريد إصدار تقرير جديد؟")) return;
    }

    const report: MonthlyReport = {
      month: currentMonth,
      totalSales: logsThisMonth.reduce((a, b) => a + b.totalSales, 0),
      totalExpenses: logsThisMonth.reduce((a, b) => a + b.totalExpenses, 0),
      netProfit: logsThisMonth.reduce((a, b) => a + b.netProfit, 0),
      partnerShares: {
        'حمد': logsThisMonth.reduce((a, b) => a + b.partnerShares['حمد'], 0),
        'فهد': logsThisMonth.reduce((a, b) => a + b.partnerShares['فهد'], 0),
        'جميل': logsThisMonth.reduce((a, b) => a + b.partnerShares['جميل'], 0),
      }
    };

    setMonthlyReports(prev => [report, ...prev].slice(0, 24));
    alert("تم إصدار التقرير الشهري وحفظه في الأرشيف!");
  };

  const onResetAllData = () => {
    localStorage.clear();
    setSales([]);
    setExpenses([]);
    setDeductions([]);
    setDailyLogs([]);
    setMonthlyReports([]);
    setDebts([
      { partner: 'حمد', totalDebt: 0 },
      { partner: 'فهد', totalDebt: 0 },
      { partner: 'جميل', totalDebt: 0 },
    ]);
    setActiveTab('dashboard');
    alert("تم مسح كافة البيانات بنجاح.");
  };

  const onSettle = (partner: Partner, amount: number, note: string) => {
    const settlement: Deduction = {
      id: Date.now().toString(),
      partner,
      amount: -amount,
      deductionType: `تسوية: ${note}`,
      date: new Date().toISOString().split('T')[0]
    };
    setDeductions([settlement, ...deductions]);
    alert(`تم تسجيل تسوية مبلغ ${amount} ر.س لصالح ${partner}.`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard sales={sales} expenses={expenses} deductions={deductions} />;
      case 'sales': return <SalesView sales={sales} setSales={setSales} />;
      case 'expenses': return <ExpensesView expenses={expenses} setExpenses={setExpenses} />;
      case 'expense_details': return <MonthlyExpensesDetailView currentExpenses={expenses} dailyLogs={dailyLogs} setExpenses={setExpenses} setDailyLogs={setDailyLogs} />;
      case 'deductions': return <DeductionsView deductions={deductions} setDeductions={setDeductions} />;
      case 'partner_statements': return <PartnerAccountStatementView currentDeductions={deductions} dailyLogs={dailyLogs} setDeductions={setDeductions} setDailyLogs={setDailyLogs} />;
      case 'daily': return <DailyLogsView dailyLogs={dailyLogs} onArchiveDay={onArchiveDay} setDailyLogs={setDailyLogs} />;
      case 'monthly': return <MonthlyReportsView monthlyReports={monthlyReports} onGenerateMonthly={onGenerateMonthly} setMonthlyReports={setMonthlyReports} />;
      case 'debts': return <PartnerDebtsView dailyLogs={dailyLogs} monthlyReports={monthlyReports} onSettle={onSettle} />;
      case 'settings': return <SettingsView onResetAllData={onResetAllData} />;
      default: return <Dashboard sales={sales} expenses={expenses} deductions={deductions} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
