import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  
  // Prevent the default browser behavior 
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
