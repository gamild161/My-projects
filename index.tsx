
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("إنجاز زين: محاولة بدء النظام...");

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // إخفاء شاشة التحميل فوراً
    if ((window as any).hideEnjazLoader) {
      (window as any).hideEnjazLoader();
    }
    console.log("إنجاز زين: تم تشغيل الواجهة بنجاح.");
  } catch (error) {
    console.error("إنجاز زين: حدث خطأ أثناء التشغيل:", error);
  }
}
