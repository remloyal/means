import { useEffect, useState } from 'react';
import { Button, Input, InputNumber } from 'antd';
export const SecurityPolicy = () => {
  const [info, setInfo] = useState({
    number: 0,
    guardTime: 0,
    expiryTime: 0,
  });
  useEffect(() => {}, []);
  const init = () => {};
  const onNumber = (value: number | null) => {
    setInfo(item => {
      return { ...item, number: value || 0 };
    });
  };
  const onGuardTime = (value: number | null) => {
    setInfo(item => {
      return { ...item, guardTime: value || 0 };
    });
  };
  const onExpiryTime = (value: number | null) => {
    setInfo(item => {
      return { ...item, expiryTime: value || 0 };
    });
  };
  return (
    <div style={{ padding: '10px' }}>
      <div>
        <label htmlFor="">尝试登录次数：</label>
      </div>
      <InputNumber
        min={0}
        value={info.number}
        style={{ width: '300px', marginBottom: '16px' }}
        onChange={onNumber}
      />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">登录保护时间：</label>
      </div>
      <InputNumber
        min={0}
        value={info.guardTime}
        style={{ width: '300px', marginBottom: '16px' }}
        onChange={onGuardTime}
      />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">密码过期时间：</label>
      </div>
      <InputNumber
        min={0}
        value={info.expiryTime}
        style={{ width: '300px', marginBottom: '16px' }}
        onChange={onExpiryTime}
      />
      <div>提示: 0 表示禁用该设置</div>
    </div>
  );
};

export const SecurityPolicyRight = () => {
  return (
    <div>
      <Button style={{ width: '100%' }}>保存</Button>
    </div>
  );
};
