import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.log('[iOS] Unhandled promise rejection caught:', event.reason);
  
  // Always prevent these errors from breaking the app completely
  event.preventDefault();
  
  // Stop default error handling that causes black screen
  return false;
});

createRoot(document.getElementById("root")!).render(<App />);
