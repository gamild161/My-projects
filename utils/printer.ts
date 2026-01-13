
import { DailyLog, MonthlyReport, Partner, Expense, Deduction } from '../types';

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
    .debt-row { background: #fef2f2; }
    .profit-row { background: #f0fdf4; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    .amount { font-family: sans-serif; font-weight: bold; }
    .text-red { color: #ef4444; }
    .text-amber { color: #b45309; }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
`;

export const printDailyReport = (log: DailyLog) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>تقرير يومي - ${log.date}</title>
        ${getReportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>مكتب إنجاز زين للمحاسبة</h1>
          <p>تقرير النشاط اليومي بتاريخ: ${log.date}</p>
        </div>

        <div class="section-title">الملخص المالي</div>
        <table>
          <tr>
            <th>إجمالي المبيعات</th>
            <td class="amount">${log.totalSales.toLocaleString()} ر.س</td>
          </tr>
          <tr>
            <th>إجمالي المصروفات</th>
            <td class="amount text-red">${log.totalExpenses.toLocaleString()} ر.س</td>
          </tr>
          <tr class="total-row">
            <th>صافي الربح</th>
            <td class="amount">${log.netProfit.toLocaleString()} ر.س</td>
          </tr>
        </table>

        <div class="section-title">توزيع أرباح الشركاء</div>
        <table>
          <thead>
            <tr>
              <th>اسم الشريك</th>
              <th>نصيب الربح (بعد الخصميات)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(log.partnerShares).map(([name, share]) => `
              <tr>
                <td>${name}</td>
                <td class="amount">${(share as number).toLocaleString()} ر.س</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          تم إنتاج هذا التقرير آلياً بواسطة نظام إنجاز زين للمحاسبة - ${new Date().toLocaleString('ar-EG')}
        </div>
        <script>
          window.onload = () => { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printMonthlyReport = (report: MonthlyReport) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>تقرير شهري - ${report.month}</title>
        ${getReportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>مكتب إنجاز زين للمحاسبة</h1>
          <p>التقرير المالي الشهري لعام/شهر: ${report.month}</p>
        </div>

        <div class="section-title">الأداء المالي الشهري</div>
        <table>
          <tr>
            <th>إجمالي المبيعات الشهرية</th>
            <td class="amount">${report.totalSales.toLocaleString()} ر.س</td>
          </tr>
          <tr>
            <th>إجمالي المصروفات الشهرية</th>
            <td class="amount">${report.totalExpenses.toLocaleString()} ر.س</td>
          </tr>
          <tr class="total-row">
            <th>صافي الأرباح القابلة للتوزيع</th>
            <td class="amount">${report.netProfit.toLocaleString()} ر.س</td>
          </tr>
        </table>

        <div class="section-title">مستحقات الشركاء النهائية</div>
        <table>
          <thead>
            <tr>
              <th>الشريك</th>
              <th>المبلغ المستحق</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(report.partnerShares).map(([name, share]) => `
              <tr>
                <td>${name}</td>
                <td class="amount">${(share as number).toLocaleString()} ر.س</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          نظام إنجاز زين - التقارير الشهرية الختامية
        </div>
        <script>
          window.onload = () => { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printExpenseReport = (expenses: Expense[], month: string, total: number) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>كشف مصاريف - ${month}</title>
        ${getReportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>مكتب إنجاز زين للمحاسبة</h1>
          <p>كشف تفصيلي بالمصروفات التشغيلية لشهر: ${month}</p>
        </div>

        <div class="section-title">سجل المصروفات</div>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>البيان (نوع الصرف)</th>
              <th>المبلغ (ر.س)</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr>
                <td>${exp.date}</td>
                <td>${exp.expenseType}</td>
                <td class="amount text-red">${exp.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2">إجمالي المصروفات للفترة</td>
              <td class="amount text-red">${total.toLocaleString()} ر.س</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          تم إنتاج هذا الكشف لأغراض التدقيق المالي - مكتب إنجاز زين
        </div>
        <script>
          window.onload = () => { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printPartnerStatementReport = (partner: Partner, deductions: Deduction[], month: string, total: number) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>كشف حساب - ${partner}</title>
        ${getReportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>مكتب إنجاز زين للمحاسبة</h1>
          <p>كشف حساب تفصيلي للشريك: <strong>${partner}</strong></p>
          <p>عن فترة شهر: ${month}</p>
        </div>

        <div class="section-title">سجل السلف والخصميات الشخصية</div>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>البيان (نوع الخصم)</th>
              <th>المبلغ (ر.س)</th>
            </tr>
          </thead>
          <tbody>
            ${deductions.map(d => `
              <tr>
                <td>${d.date}</td>
                <td>${d.deductionType}</td>
                <td class="amount text-amber">${d.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2">إجمالي المسحوبات للفترة</td>
              <td class="amount text-amber">${total.toLocaleString()} ر.س</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 60px; display: flex; justify-content: space-around;">
          <div style="text-align: center; border-top: 1px solid #333; padding-top: 10px; width: 150px;">توقيع المحاسب</div>
          <div style="text-align: center; border-top: 1px solid #333; padding-top: 10px; width: 150px;">توقيع الشريك</div>
        </div>

        <div class="footer">
          صدر هذا الكشف من نظام إنجاز زين المحاسبي بتاريخ ${new Date().toLocaleDateString('ar-EG')}
        </div>
        <script>
          window.onload = () => { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printPartnerDebtsReport = (partnerBalances: {name: string, balance: number}[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>تقرير أرصدة وديون الشركاء</title>
        ${getReportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>مكتب إنجاز زين للمحاسبة</h1>
          <p>تقرير حالة أرصدة الشركاء بتاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        <div class="section-title">الأرصدة الصافية للشركاء</div>
        <table>
          <thead>
            <tr>
              <th>الشريك</th>
              <th>الرصيد الصافي</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${partnerBalances.map(p => `
              <tr class="${p.balance < 0 ? 'debt-row' : 'profit-row'}">
                <td>${p.name}</td>
                <td class="amount">${Math.abs(p.balance).toLocaleString()} ر.س</td>
                <td>${p.balance >= 0 ? 'رصيد مستحق له (ربح)' : 'دين مستحق عليه'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">ملخص الديون البينية</div>
        <div style="margin-top: 15px; font-size: 14px;">
          ${partnerBalances.filter(p => p.balance < 0).length === 0 
            ? '<p style="text-align: center; color: #10b981;">لا توجد ديون معلقة حالياً. جميع الحسابات في حالة ربح.</p>'
            : partnerBalances.filter(p => p.balance < 0).map(debtor => {
                const creditors = partnerBalances.filter(p => p.balance > 0);
                const totalPositive = creditors.reduce((a, b) => a + b.balance, 0);
                if (totalPositive === 0) return '';
                
                return `
                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                    الشريك <strong>${debtor.name}</strong> ملزم بسداد مبلغ <strong>${Math.abs(debtor.balance).toLocaleString()} ر.س</strong> كالتالي:
                    <ul style="margin-top: 8px; padding-right: 20px;">
                      ${creditors.map(creditor => {
                        const proportion = (creditor.balance / totalPositive) * Math.abs(debtor.balance);
                        return `<li>دفع مبلغ <strong>${proportion.toLocaleString(undefined, {maximumFractionDigits: 0})} ر.س</strong> للشريك <strong>${creditor.name}</strong></li>`;
                      }).join('')}
                    </ul>
                  </div>
                `;
              }).join('')
          }
        </div>

        <div class="footer">
          تقرير رسمي من نظام إنجاز زين - هذا التقرير يعبر عن الحالة اللحظية للأرصدة بناءً على البيانات المرحلة.
        </div>
        <script>
          window.onload = () => { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
