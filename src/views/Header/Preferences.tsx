import { ConfigProvider, Select, Tabs, TabsProps } from 'antd';

const Preferences = () => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '基本设置',
      children: <BasicSetting></BasicSetting>,
    },
    {
      key: '2',
      label: '云设置',
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
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };
  return (
    <>
      <div className="basic">
        <label htmlFor="">日期格式：</label>
        <Select
          defaultValue="chinese"
          style={{ width: 200 }}
          onChange={handleChange}
          options={[
            { value: 'chinese', label: '中文' },
            { value: 'english', label: 'English' },
          ]}
        />
      </div>
      <div className="basic">
        <label htmlFor="">时间格式：</label>
        <Select
          defaultValue="chinese"
          style={{ width: 200 }}
          onChange={handleChange}
          options={[{ value: 'HH:mm:ss', label: 'HH:mm:ss' }]}
        />
      </div>
      <div className="basic">
        <label htmlFor="">系统语言：</label>
        <Select
          defaultValue="chinese"
          style={{ width: 200 }}
          onChange={handleChange}
          options={[
            { value: 'chinese', label: '中文' },
            { value: 'english', label: 'English' },
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
