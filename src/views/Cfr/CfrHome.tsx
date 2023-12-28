import { MainBody, MainRight } from '@/components/main';
import { Radio, Tabs, TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserInfo, UserInfoRight } from './UserInfo';
import { UserManage, UserManageRight } from './UserManage';
import { PowerManage, PowerManageRight } from './PowerManage';
import { Endorsement, EndorsementRight } from './Endorsement';
import { SecurityPolicy, SecurityPolicyRight } from './SecurityPolicy';
import { AuditLog, AuditLogRight } from './AuditLog';
const Cfr: React.FC = () => {
  const [activeKey, setActiveKey] = useState('0');
  const onChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div className="summary">
      <MainBody style={{ position: 'relative', overflow: 'hidden' }}>
        <CfrMain onChange={onChange} />
      </MainBody>
      <MainRight>
        <CfrRight activeKey={activeKey} />
      </MainRight>
    </div>
  );
};

const CfrMain = ({ onChange }) => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState('1');

  const items: TabsProps['items'] = [
    {
      key: '0',
      label: `FDA 21 CFR Part 11  ${t('cfr.module')}`,
      children: <CfrProve></CfrProve>,
    },
    {
      key: '1',
      label: t('cfr.userInfo'),
      children: <UserInfo />,
    },
    {
      key: '2',
      label: t('cfr.userManage'),
      children: <UserManage />,
    },
    {
      key: '3',
      label: t('cfr.powerManage'),
      children: <PowerManage />,
    },
    {
      key: '4',
      label: t('cfr.endorsementManage'),
      children: <Endorsement />,
    },
    {
      key: '5',
      label: t('cfr.securityPolicy'),
      children: <SecurityPolicy />,
    },
    {
      key: '6',
      label: t('cfr.auditLog'),
      children: <AuditLog />,
    },
  ];

  return (
    <>
      <Tabs
        style={{ width: '100%', height: '100%' }}
        className="summary-chart"
        defaultActiveKey="0"
        items={items}
        onChange={key => {
          onChange(key);
        }}
        destroyInactiveTabPane={true}
      />
    </>
  );
};

const CfrRight = ({ activeKey }) => {
  const rightDom = [
    CfrHomeRight,
    UserInfoRight,
    UserManageRight,
    PowerManageRight,
    EndorsementRight,
    SecurityPolicyRight,
    AuditLogRight,
  ];
  return (
    <div className="cfr-right">
      {rightDom.map((Item, index) => {
        if (index != activeKey) return <span key={Math.random().toString(36).slice(-8)}></span>;
        return <Item key={index} />;
      })}
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

const CfrHomeRight = () => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const handleChangeCheck = e => {
    setChecked(!checked);
  };
  return (
    <Radio.Group value={checked}>
      <Radio onClick={handleChangeCheck} value={true} style={{ fontSize: '12px' }}>
        {t('cfr.cfrEnable')}
      </Radio>
    </Radio.Group>
  );
};

export default Cfr;
