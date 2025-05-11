
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// This adds a polyfill for smooth scrolling on Safari
if (!('scrollBehavior' in document.documentElement.style)) {
  import('scroll-behavior-polyfill')
}

createRoot(document.getElementById("root")!).render(<App />);
