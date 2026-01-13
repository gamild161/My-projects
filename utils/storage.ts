
export const STORAGE_KEYS = {
  SALES: 'enjaz_sales',
  EXPENSES: 'enjaz_expenses',
  DEDUCTIONS: 'enjaz_deductions',
  DAILY_LOGS: 'enjaz_daily_logs',
  MONTHLY_REPORTS: 'enjaz_monthly_reports',
  PARTNER_DEBTS: 'enjaz_partner_debts'
};

export const saveToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};
