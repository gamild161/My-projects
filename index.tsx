
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Enjaz Zein System: Booting...");

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // التأكد من إخفاء الشاشة بعد استقرار التطبيق
  setTimeout(() => {
    console.log("Enjaz Zein System: Ready.");
    if ((window as any).hideEnjazLoader) {
      (window as any).hideEnjazLoader();
    }
  }, 1500);
} else {
  console.error("Enjaz Zein System: Root container not found!");
}
