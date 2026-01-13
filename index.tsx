
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const startApp = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
      if ((window as any).hideEnjazLoader) {
        (window as any).hideEnjazLoader();
      }
    }, 1000);
  }
};

startApp();
