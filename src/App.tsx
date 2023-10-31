import { ConfigProvider, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import appTheme from '@/theme/App';
import '@/App.scss';
import './views/view.scss';

import { RouterProvider } from 'react-router-dom';
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
      <Header />
      <div
        style={{
          padding: '14px',
          display: 'flex',
        }}
      >
        <Left></Left>
        <RouterProvider router={Router} />
      </div>
    </ConfigProvider>
  );
};

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [csvData, setCsvData] = useState<null | any>(null);

  window.eventBus.on('friggaDevice:in', csvData => {
    setIsConnected(true);
    // console.count("frigga:in")
    // console.log("frigga:in", csvData)
    setCsvData(csvData);
  });

  window.eventBus.on('friggaDevice:out', (...datas) => {
    setIsConnected(false);
    // console.log("frigga:out", datas)
  });
  {
    isConnected ? (
      <>
        <div>frigga 已接入</div>
        {csvData
          ? csvData.map(({ timeStamp, c }, i) => (
              <div key={i}>
                <div
                  style={{
                    width: 300,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ width: 50 }}>时间：</span>
                  <span style={{ width: 150 }}>{timeStamp}</span>
                  <span style={{ width: 50 }}>温度：</span>
                  <span style={{ width: 50 }}>{c}</span>
                </div>
              </div>
            ))
          : null}
      </>
    ) : (
      <div>frigga 未接入</div>
    );
  }
};

export default App;
