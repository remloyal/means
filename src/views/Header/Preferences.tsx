import { dateFormat, language } from '@/stores';
import { ConfigProvider, Modal, Select, Tabs, TabsProps } from 'antd';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

const Preferences = () => {
  const onChange = (key: string) => {
    console.log(key);
  };
  const { t, i18n } = useTranslation();
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('header.basicSettings'),
      children: <BasicSetting></BasicSetting>,
    },
    // {
    //   key: '2',
    //   label: t('header.cloudSettings'),
    //   children: <CloudSetting></CloudSetting>,
    // },
  ];

  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              inkBarColor: '#f4860f',
              itemActiveColor: '#f4860f',
              itemSelectedColor: '#f4860f',
            },
          },
        }}
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </ConfigProvider>
    </div>
  );
};

const options = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
  { value: 'YY-MM-DD', label: 'YY-MM-DD' },
  { value: 'DD-MM-YY', label: 'DD-MM-YY' },
  { value: 'MM-DD-YY', label: 'MM-DD-YY' },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YY/MM/DD', label: 'YY/MM/DD' },
  { value: 'DD/MM/YY', label: 'DD/MM/YY' },
  { value: 'MM/DD/YY', label: 'MM/DD/YY' },
];

// 基本设置
const BasicSetting = () => {
  const [tongue, setTongue] = useRecoilState(language);

  const { t, i18n } = useTranslation();
  const setLanguage = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
    setTongue(value);
    ipcRenderer.invoke('language', value);
  };

  const DateComponent = () => {
    const [date, setDate] = useRecoilState(dateFormat);
    const [time, setTime] = useState('');
    const handleChange = (value: string) => {
      console.log(`selected ${value}`);
      Modal.confirm({
        // title: 'Do you Want to delete these items?',
        content: t('header.restartNow'),
        onOk() {
          localStorage.setItem('dateFormat', value);
          setDate(value);
          setTime(dayjs(new Date()).format(value));
          ipcRenderer.send('window-reset');
        },
        onCancel() {
          setDate(`${date}`);
        },
      });

      // setDate(value);
      // localStorage.setItem('dateFormat', value);
      // setTime(dayjs(new Date()).format(value));
      showModal();
    };
    useEffect(() => {
      setTime(
        dayjs(new Date().getTime()).format(localStorage.getItem('dateFormat') || 'YYYY-MM-DD')
      );
    }, []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleOk = () => {
      setIsModalOpen(false);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };
    return (
      <>
        <Select
          defaultValue={localStorage.getItem('dateFormat') || 'YYYY-MM-DD'}
          style={{ width: 200 }}
          onChange={handleChange}
          options={options}
        />
        <span style={{ marginLeft: '20px' }}>
          示例
          <span style={{ marginLeft: '20px' }}>{time}</span>
        </span>
      </>
    );
  };

  return (
    <>
      <div className="basic">
        <label htmlFor="">{t('header.dateFormat')}：</label>
        <DateComponent />
      </div>
      <div className="basic">
        <label htmlFor="">{t('header.timeFormat')}：</label>
        <Select
          defaultValue="HH:mm:ss"
          style={{ width: 200 }}
          options={[{ value: 'HH:mm:ss', label: 'HH:mm:ss' }]}
        />
        <span style={{ marginLeft: '20px' }}>
          示例
          <TimeComponent />
        </span>
      </div>
      <div className="basic">
        <label htmlFor="">{t('header.systemLanguage')}：</label>
        <Select
          defaultValue={tongue}
          style={{ width: 200 }}
          onChange={setLanguage}
          options={[
            { value: 'zh_CN', label: '中文' },
            { value: 'en_US', label: 'en_US' },
          ]}
        />
      </div>
    </>
  );
};
const TimeComponent = () => {
  const [timer, setTimer] = useState<any>('');
  const [refresh, setRefresh] = useState<number>(0);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRefresh(r => r + 1);
      setTimer(dayjs(new Date().getTime()).format('HH:mm:ss'));
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [refresh]);

  return <span style={{ marginLeft: '20px' }}>{timer}</span>;
};

// 云设置
const CloudSetting = () => {
  return <></>;
};

export default Preferences;
