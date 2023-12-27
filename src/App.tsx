import { ConfigProvider, Button, message } from 'antd';
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
import { dateFormat, language } from './stores';
import { Locale } from 'antd/es/locale';

const languageData = {
  zh: zhCN,
  en: enUS,
};

const App: React.FC = () => {
  const [tongue, setTongue] = useRecoilState(language);
  const [locale, setLocal] = useState<Locale>(enUS);
  const [date, setDate] = useRecoilState(dateFormat);

  useEffect(() => {
    message.config({ prefixCls: 'antd-message', maxCount: 3, duration: 2 });
    setTongue(localStorage.getItem('language') || 'zh');
    setDate(localStorage.getItem('dateFormat') || 'YYYY-MM-DD');
  }, []);

  useEffect(() => {
    setLocal(languageData[tongue || 'zh']);
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
