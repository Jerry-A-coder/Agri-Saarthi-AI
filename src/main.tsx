import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { swService } from './services/swService';

// Initialize Service Worker for offline field accessibility
swService.register().then(() => {
  // Precache critical data in background
  setTimeout(() => {
    swService.precacheCriticalFarmerData().catch(() => {});
  }, 1000);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

