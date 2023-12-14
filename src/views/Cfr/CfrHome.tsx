import { MainBody, MainRight } from '@/components/main';
import { Radio, Tabs, TabsProps } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Cfr: React.FC = () => {
  return (
    <div className="summary">
      <MainBody style={{ position: 'relative', overflow: 'hidden' }}>
        <CfrMain />
      </MainBody>
      <MainRight>
        <CfrRight />
      </MainRight>
    </div>
  );
};

const CfrMain = () => {
  const { t } = useTranslation();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `FDA 21 CFR Part 11  ${t('cfr.module')}`,
      children: <CfrProve></CfrProve>,
    },
    // {
    //   key: '2',
    //   label: t('home.dataSheet'),
    //   children: <div />,
    // },
    // {
    //   key: '3',
    //   label: t('home.signature'),
    //   children: 'Content of Tab Pane 3',
    // },
  ];
  return (
    <>
      <Tabs
        style={{ width: '100%', height: '100%' }}
        className="summary-chart"
        defaultActiveKey="1"
        items={items}
        destroyInactiveTabPane={false}
      />
    </>
  );
};
const CfrRight = () => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const handleChangeCheck = e => {
    setChecked(!checked);
  };
  return (
    <div className="cfr-right">
      <Radio.Group value={checked}>
        <Radio onClick={handleChangeCheck} value={true} style={{ fontSize: '12px' }}>
          {t('cfr.cfrEnable')}
        </Radio>
      </Radio.Group>
    </div>
  );
};

const CfrProve = () => {
  const { t } = useTranslation();
  return (
    <div className="cfr-prove" style={{ padding: '10px', lineHeight: '2' }}>
      <div>&nbsp;&nbsp; &nbsp; {t('cfr.cfrText1')}</div>
      <div>&nbsp;&nbsp; &nbsp; {t('cfr.cfrText2')}</div>
      <div>&nbsp;&nbsp; &nbsp; {t('cfr.cfrText3')}</div>
    </div>
  );
};

export default Cfr;
