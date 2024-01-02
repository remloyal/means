import { useEffect, useState, useContext, createContext } from 'react';
import { Button, Input, InputNumber, Modal, message } from 'antd';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

const person = {
  renew: '',
  event: null,
};
const SetInfoContext = new Proxy<any>(person, {
  get(target, propKey) {
    return target[propKey];
  },
  set(target, property, value, receiver) {
    target[property] = value;
    if (property == 'renew') {
      target.event();
    }
    return true;
  },
});

export const SecurityPolicy = () => {
  const { t } = useTranslation();
  const [info, setInfo] = useState({
    loginNumber: 0,
    guardTime: 0,
    expirationTime: 0,
  });
  const [policy, setPolicy] = useState<any>([]);
  useEffect(() => {
    init();
  }, []);
  const init = async () => {
    const data = await ipcRenderer.invoke('securityPolicy');
    setPolicy(data);
  };
  useEffect(() => {
    const obj = {
      loginNumber: 0,
      guardTime: 0,
      expirationTime: 0,
    };
    policy.map(item => {
      obj[item.name] = item.value;
    });
    setInfo(obj);
  }, [policy]);

  const onNumber = (value: number | null) => {
    setInfo(item => {
      return { ...item, loginNumber: value || 0 };
    });
  };

  const onGuardTime = (value: number | null) => {
    setInfo(item => {
      return { ...item, guardTime: value || 0 };
    });
  };
  const onExpiryTime = (value: number | null) => {
    setInfo(item => {
      return { ...item, expirationTime: value || 0 };
    });
  };

  const renew = async () => {
    const data = await ipcRenderer.invoke('securityPolicy', info);
    Modal.confirm({
      centered: true,
      width: 300,
      content: data ? t('history.dataUpdateSuccessful') : t('history.dataUpdateFailed'),
      icon: null,
      cancelButtonProps: { style: { display: 'none' } },
    });
  };
  SetInfoContext.event = renew;
  return (
    <div style={{ padding: '10px' }}>
      <div>
        <label htmlFor="">尝试登录次数：</label>
      </div>
      <InputNumber
        min={0}
        max={100}
        value={info.loginNumber}
        style={{ width: '200px', marginBottom: '16px' }}
        onChange={onNumber}
      />
      {t('cfr.order')}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">登录保护时间：</label>
      </div>
      <InputNumber
        min={0}
        max={100}
        value={info.guardTime}
        style={{ width: '200px', marginBottom: '16px' }}
        onChange={onGuardTime}
      />
      {t('cfr.minute')}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">密码过期时间：</label>
      </div>
      <InputNumber
        min={0}
        max={100}
        value={info.expirationTime}
        style={{ width: '200px', marginBottom: '16px' }}
        onChange={onExpiryTime}
      />
      {t('cfr.day')}
      <div>提示: 0 表示禁用该设置</div>
    </div>
  );
};

export const SecurityPolicyRight = () => {
  const onClick = () => {
    SetInfoContext.renew = Math.random().toString(36).slice(-8);
  };
  return (
    <div>
      <Button style={{ width: '100%' }} onClick={onClick}>
        保存
      </Button>
    </div>
  );
};
