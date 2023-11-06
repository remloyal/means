import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import EventEmitter from 'events';
import '@/utils/detectDevice';
import './locale/index';
import "./assets/icon/iconfont.css";
import { RecoilRoot } from 'recoil';

window.eventBus = new EventEmitter();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');
