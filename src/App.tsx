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
import { dateFormat, language, pageHeight } from './stores';
import { Locale } from 'antd/es/locale';
import { useThrottle } from './utils/tool';

const languageData = {
  zh: zhCN,
  en: enUS,
};
let observer;
const App: React.FC = () => {
  const handle = useThrottle(getHight, 200);
  const [tongue, setTongue] = useRecoilState(language);
  const [locale, setLocal] = useState<Locale>(enUS);
  const [date, setDate] = useRecoilState(dateFormat);
  const [height, setHight] = useRecoilState(pageHeight);

  useEffect(() => {
    message.config({ prefixCls: 'antd-message', maxCount: 3, duration: 2 });
    setTongue(localStorage.getItem('language') || 'zh');
    setDate(localStorage.getItem('dateFormat') || 'YYYY-MM-DD');
    const element = document.getElementById('main');
    observer = new MutationObserver(mutationList => {
      handle();
    });

    observer.observe(element, {
      childList: true, // 子节点的变动（新增、删除或者更改）
      attributes: true, // 属性的变动
      attributeFilter: ['style'],
      characterData: false, // 节点内容或节点文本的变动
      subtree: true, // 是否将观察器应用于该节点的所有后代节点
    });
    return () => {
      observer.disconnect();
      observer = null;
    };
  }, []);

  useEffect(() => {
    setLocal(languageData[tongue || 'zh']);
  }, [tongue]);

  function getHight() {
    const element = document.getElementById('main');
    const height: any = window.getComputedStyle(element!)['height'];
    const axleHight = parseInt(height);
    console.log(axleHight);
    setHight(axleHight);
  }

  return (
    <ConfigProvider theme={appTheme} locale={locale}>
      <HashRouter>
        <Header />
        <div
          style={{
            padding: '14px',
            display: 'flex',
          }}
          id="main"
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
