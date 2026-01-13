
export type Partner = 'حمد' | 'فهد' | 'جميل';

export interface Sale {
  id: string;
  customerName: string;
  amount: number;
  serviceType: string;
  orderNumber: string;
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  expenseType: string;
  date: string;
}

export interface Deduction {
  id: string;
  partner: Partner;
  amount: number;
  deductionType: string;
  date: string;
}

export interface DailyLog {
  date: string;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  partnerShares: Record<Partner, number>;
  deductions: Deduction[];
  sales: Sale[];
  expenses: Expense[];
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  partnerShares: Record<Partner, number>;
}

export interface PartnerDebt {
  partner: Partner;
  totalDebt: number;
}
