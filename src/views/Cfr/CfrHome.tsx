import { MainBody, MainRight } from '@/components/main';
import { Form, Input, Modal, Radio, Tabs, TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserInfo, UserInfoRight } from './UserInfo';
import { UserManage, UserManageRight } from './UserManage';
import { PowerManage, PowerManageRight } from './PowerManage';
import { Endorsement, EndorsementRight } from './Endorsement';
import { SecurityPolicy, SecurityPolicyRight } from './SecurityPolicy';
import { AuditLog, AuditLogRight } from './AuditLog';
import { ipcRenderer } from 'electron';

const isLogin = await ipcRenderer.invoke('userLog', { name: 'isLogin' });
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

  const items: TabsProps['items'] = [
    {
      key: '0',
      label: `FDA 21 CFR Part 11  ${t('cfr.module')}`,
      children: <CfrProve></CfrProve>,
    },
  ];
  const loginItems = [
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
  if (isLogin) {
    items.push(...loginItems);
  }
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
    // setChecked(!checked);
    if (checked == false) {
      Modal.confirm({
        centered: true,
        width: 300,
        content: t('cfr.operationText'),
        onOk(...args) {
          setChecked(!checked);
          setIsOpen(true);
        },
      });
    } else {
      setChecked(!checked);
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm();
  const [userInfo, setUserInfo] = useState<any>({
    confirmPassword: '',
    password: '',
    position: '',
    realName: '',
    userName: '',
  });
  const rules: any = [{ type: 'string', min: 5, max: 16, required: true }];
  const onclick = async () => {
    try {
      await form.validateFields();
      const data = await ipcRenderer.invoke('userOperate', { name: 'createAdmin', data: userInfo });
      if (data) {
        ipcRenderer.invoke('exitType', 3);
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const changeUserInfo = (key, e) => {
    setUserInfo(itme => {
      return { ...itme, [key]: e.target.value };
    });
  };
  useEffect(() => {
    setChecked(isLogin || false);
  }, []);
  return (
    <>
      <Radio.Group value={checked}>
        <Radio onClick={handleChangeCheck} value={true} style={{ fontSize: '12px' }}>
          {t('cfr.cfrEnable')}
        </Radio>
      </Radio.Group>
      <Modal
        title={t('cfr.initialization') + t('cfr.administrator')}
        open={isOpen}
        centered
        width={300}
        onCancel={() => {
          setIsOpen(false);
          setChecked(false);
        }}
        onOk={onclick}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="userName" label={t('cfr.userName')} required rules={rules}>
            <Input
              value={userInfo.userName || ''}
              maxLength={16}
              onChange={e => changeUserInfo('userName', e)}
            />
          </Form.Item>
          <Form.Item name="realName" label={t('cfr.realName')} required rules={rules}>
            <Input
              maxLength={16}
              value={userInfo.realName || ''}
              onChange={e => changeUserInfo('realName', e)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('history.password')}
            required
            rules={[{ max: 16, min: 6, required: true }]}
          >
            <Input.Password
              value={userInfo.password || ''}
              maxLength={16}
              onChange={e => changeUserInfo('password', e)}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('history.password') + t('home.confirm')}
            required
            rules={[
              { max: 16, min: 6, required: true },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(t('cfr.twoPassword'));
                },
              }),
            ]}
          >
            <Input.Password
              maxLength={16}
              value={userInfo.confirmPassword || ''}
              onChange={e => changeUserInfo('confirmPassword', e)}
            />
          </Form.Item>
          <Form.Item name="position" label={t('cfr.position')} required rules={rules}>
            <Input
              maxLength={16}
              value={userInfo.position || ''}
              onChange={e => changeUserInfo('position', e)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Cfr;
