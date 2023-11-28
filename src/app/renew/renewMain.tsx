import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';
import '@/locale/index';
import { RecoilRoot } from 'recoil';

// window.eventBus = new EventEmitter();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');
