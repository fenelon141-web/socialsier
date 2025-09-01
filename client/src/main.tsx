import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.log('[iOS] Unhandled promise rejection caught:', event.reason);
  
  // For iOS, prevent errors from breaking the app
  const isIOSNative = (window as any).Capacitor?.isNativePlatform();
  if (isIOSNative) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
