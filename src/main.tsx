
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// This adds a polyfill for smooth scrolling on Safari
if (!('scrollBehavior' in document.documentElement.style)) {
  // Using dynamic import with then() to avoid build issues
  import('scroll-behavior-polyfill').then(() => {
    console.log('Scroll behavior polyfill loaded');
  }).catch(error => {
    console.error('Failed to load scroll behavior polyfill:', error);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
