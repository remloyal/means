import { language } from '@/stores';
import { ConfigProvider, Modal, Select, Tabs, TabsProps } from 'antd';
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
    {
      key: '2',
      label: t('header.cloudSettings'),
      children: <CloudSetting></CloudSetting>,
    },
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

// 基本设置
const BasicSetting = () => {
  const [tongue, setTongue] = useRecoilState(language);

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };
  const { t, i18n } = useTranslation();
  const setLanguage = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
    setTongue(value);
  };

  return (
    <>
      <div className="basic">
        <label htmlFor="">{t('header.dateFormat')}：</label>
        <Select
          defaultValue="chinese"
          style={{ width: 200 }}
          onChange={handleChange}
          options={[
            { value: 'zh', label: '中文' },
            { value: 'en', label: 'en_US' },
          ]}
        />
      </div>
      <div className="basic">
        <label htmlFor="">{t('header.timeFormat')}：</label>
        <Select
          defaultValue="chinese"
          style={{ width: 200 }}
          onChange={handleChange}
          options={[{ value: 'HH:mm:ss', label: 'HH:mm:ss' }]}
        />
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

// 云设置
const CloudSetting = () => {
  return <></>;
};

export default Preferences;
