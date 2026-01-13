
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // إخفاء شاشة التحميل فور نجاح التشغيل
    setTimeout(() => {
      if ((window as any).hideEnjazLoader) {
        (window as any).hideEnjazLoader();
      }
    }, 500);
  }
};

// تشغيل التطبيق
startApp();
