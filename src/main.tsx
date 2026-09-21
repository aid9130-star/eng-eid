import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupApiInterceptor } from './lib/apiInterceptor.ts';

// Initialize hybrid API interceptor for hosting environments (cPanel, Netlify, Vercel, Node.js)
setupApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
