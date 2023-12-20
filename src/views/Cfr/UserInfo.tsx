import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
export const UserInfo = () => {
  const [info, setInfo] = useState({
    userName: '1',
    realName: '2',
    time: '3',
  });
  useEffect(() => {}, []);
  const init = () => {};
  return (
    <div style={{ padding: '10px' }}>
      <div>
        <label htmlFor="">用户名：</label>
      </div>
      <Input disabled value={info.userName} style={{ width: '300px', marginBottom: '16px' }} />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">真实姓名：</label>
      </div>
      <Input disabled value={info.userName} style={{ width: '300px', marginBottom: '16px' }} />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">加入时间：</label>
      </div>
      <Input disabled value={info.userName} style={{ width: '300px', marginBottom: '16px' }} />
    </div>
  );
};

export const UserInfoRight = () => {
  return (
    <div>
      <Button style={{ width: '100%' }}>修改密码</Button>
    </div>
  );
};
