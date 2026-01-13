
import { DailyLog, MonthlyReport, Partner, Expense, Deduction } from '../types.ts';

const getReportStyles = () => `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
    body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #064e3b; margin: 0; font-size: 24px; }
    .header p { color: #666; margin: 5px 0 0; }
    .section-title { background: #f3f4f6; padding: 10px; border-radius: 8px; font-weight: bold; margin-top: 25px; border-right: 4px solid #10b981; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: right; }
    th { background: #f9fafb; color: #374151; font-weight: bold; }
    .total-row { background: #ecfdf5; font-weight: bold; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    .amount { font-family: sans-serif; font-weight: bold; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
`;

export const printDailyReport = (log: DailyLog) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = `<html><head><title>تقرير يومي - ${log.date}</title>${getReportStyles()}</head><body><div class="header"><h1>مكتب إنجاز زين للمحاسبة</h1><p>تقرير النشاط اليومي بتاريخ: ${log.date}</p></div><div class="section-title">الملخص المالي</div><table><tr><th>إجمالي المبيعات</th><td class="amount">${log.totalSales.toLocaleString()} ر.س</td></tr><tr><th>إجمالي المصروفات</th><td class="amount">${log.totalExpenses.toLocaleString()} ر.س</td></tr><tr class="total-row"><th>صافي الربح</th><td class="amount">${log.netProfit.toLocaleString()} ر.س</td></tr></table><div class="section-title">توزيع أرباح الشركاء</div><table><thead><tr><th>اسم الشريك</th><th>نصيب الربح</th></tr></thead><tbody>${Object.entries(log.partnerShares).map(([name, share]) => `<tr><td>${name}</td><td class="amount">${(share as number).toLocaleString()} ر.س</td></tr>`).join('')}</tbody></table><div class="footer">نظام إنجاز زين للمحاسبة</div><script>window.onload = () => { window.print(); window.close(); };</script></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};

export const printMonthlyReport = (report: MonthlyReport) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = `<html><head><title>تقرير شهري - ${report.month}</title>${getReportStyles()}</head><body><div class="header"><h1>مكتب إنجاز زين للمحاسبة</h1><p>التقرير المالي الشهري لعام/شهر: ${report.month}</p></div><div class="section-title">الأداء المالي</div><table><tr><th>إجمالي المبيعات</th><td class="amount">${report.totalSales.toLocaleString()} ر.س</td></tr><tr><th>إجمالي المصروفات</th><td class="amount">${report.totalExpenses.toLocaleString()} ر.س</td></tr><tr class="total-row"><th>صافي الأرباح</th><td class="amount">${report.netProfit.toLocaleString()} ر.س</td></tr></table><div class="footer">نظام إنجاز زين</div><script>window.onload = () => { window.print(); window.close(); };</script></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};

export const printExpenseReport = (expenses: Expense[], month: string, total: number) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = `<html><head><title>كشف مصاريف - ${month}</title>${getReportStyles()}</head><body><div class="header"><h1>مكتب إنجاز زين للمحاسبة</h1><p>كشف المصروفات لشهر: ${month}</p></div><table><thead><tr><th>التاريخ</th><th>البيان</th><th>المبلغ</th></tr></thead><tbody>${expenses.map(exp => `<tr><td>${exp.date}</td><td>${exp.expenseType}</td><td class="amount">${exp.amount.toLocaleString()}</td></tr>`).join('')}<tr class="total-row"><td colspan="2">الإجمالي</td><td class="amount">${total.toLocaleString()} ر.س</td></tr></tbody></table><script>window.onload = () => { window.print(); window.close(); };</script></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};

export const printPartnerStatementReport = (partner: Partner, deductions: Deduction[], month: string, total: number) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = `<html><head><title>كشف حساب - ${partner}</title>${getReportStyles()}</head><body><div class="header"><h1>مكتب إنجاز زين للمحاسبة</h1><p>كشف حساب الشريك: <strong>${partner}</strong> عن شهر: ${month}</p></div><table><thead><tr><th>التاريخ</th><th>البيان</th><th>المبلغ</th></tr></thead><tbody>${deductions.map(d => `<tr><td>${d.date}</td><td>${d.deductionType}</td><td class="amount">${d.amount.toLocaleString()}</td></tr>`).join('')}<tr class="total-row"><td colspan="2">إجمالي المسحوبات</td><td class="amount">${total.toLocaleString()} ر.س</td></tr></tbody></table><script>window.onload = () => { window.print(); window.close(); };</script></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};

export const printPartnerDebtsReport = (partnerBalances: {name: string, balance: number}[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = `<html><head><title>أرصدة الشركاء</title>${getReportStyles()}</head><body><div class="header"><h1>مكتب إنجاز زين للمحاسبة</h1><p>تقرير حالة أرصدة الشركاء اللحظية</p></div><table><thead><tr><th>الشريك</th><th>الرصيد الصافي</th><th>الحالة</th></tr></thead><tbody>${partnerBalances.map(p => `<tr><td>${p.name}</td><td class="amount">${Math.abs(p.balance).toLocaleString()} ر.س</td><td>${p.balance >= 0 ? 'مستحق له' : 'دين عليه'}</td></tr>`).join('')}</tbody></table><script>window.onload = () => { window.print(); window.close(); };</script></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};
