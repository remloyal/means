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
import { dateFormat, heatUnit, language } from './stores';
import { Locale } from 'antd/es/locale';
import dayjs from 'dayjs';
// import { TempUnitEnum } from '@type/store/storeType';
zhCN.Calendar!.lang.shortWeekDays = '日_一_二_三_四_五_六'.split('_');
zhCN.Calendar!.lang.shortMonths = '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_');
const languageData = {
  zh: zhCN,
  en: enUS,
};
const tempUnit = localStorage.getItem('tempUnit') || '℃';

const App: React.FC = () => {
  const [tongue, setTongue] = useRecoilState(language);
  const [locale, setLocal] = useState<Locale>(enUS);
  const [date, setDate] = useRecoilState(dateFormat);
  const [temperatureUnit, setTemperatureUnit] = useRecoilState<string>(heatUnit);

  useEffect(() => {
    message.config({ prefixCls: 'antd-message', maxCount: 3, duration: 2 });
    setTongue(localStorage.getItem('language') || 'zh');
    setDate(localStorage.getItem('dateFormat') || 'YYYY-MM-DD');
    setLocal(languageData[tongue || 'zh']);
    setTemperatureUnit(tempUnit);
  }, []);

  useEffect(() => {
    setLocal(languageData[tongue || 'zh']);
    if (tongue == 'en') {
      dayjs.locale('en');
    } else {
      dayjs.locale('zh-cn');
    }
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
