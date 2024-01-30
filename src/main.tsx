import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import EventEmitter from 'events';
import '@/utils/detectDevice';
import './locale/index';
import './assets/icon/iconfont.css';
import { RecoilRoot } from 'recoil';
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs';
import { ipcRenderer } from 'electron';

// 缩放系数
const ratio = (await ipcRenderer.invoke('windowDisplay')) || 1;

const px2rem = px2remTransformer({
  rootValue: 14 / ratio, // 32px = 1rem; @default 16
});
window.eventBus = new EventEmitter();
window.eventBus.setMaxListeners(100);
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <StyleProvider transformers={[px2rem]}>
        <App />
      </StyleProvider>
    </RecoilRoot>
  </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');
