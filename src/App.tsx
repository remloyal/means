import { ConfigProvider, Button } from 'antd';
import React, { Suspense, useEffect, useState } from 'react';
import appTheme from '@/theme/App';
import '@/App.scss';
import './views/view.scss';

import { HashRouter, Outlet } from 'react-router-dom';
import Router from './router/index';
import Header from './views/Header/Header';
import Left from './views/Left/Left';

import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

import { useRecoilState } from 'recoil';
import { language } from './stores';
import { Locale } from 'antd/es/locale';

const languageData = {
  zh_CN: zhCN,
  en_US: enUS,
};

const App: React.FC = () => {
  const [tongue, setTongue] = useRecoilState(language);
  const [locale, setLocal] = useState<Locale>(enUS);

  useEffect(() => {
    setTongue(localStorage.getItem('language') || 'zh_CN');
  }, []);

  useEffect(() => {
    setLocal(languageData[tongue] || zhCN);
  }, [tongue]);

  return (
    <ConfigProvider theme={appTheme} locale={locale}>
      <HashRouter>
        <Header />
        <div
          style={{
            padding: '14px',
            display: 'flex',
          }}
        >
          <Left></Left>
          <Suspense>
            <Router />
          </Suspense>
        </div>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
