import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
export const UserInfo = () => {
  const [info, setInfo] = useState({
    userName: '1',
    realName: '2',
    time: '3',
  });
  useEffect(() => {
    init();
  }, []);
  const init = () => {
    const data = JSON.parse(localStorage.getItem('user') || '');
    setInfo({
      userName: data.userName,
      realName: data.realName,
      time: data.createdAt,
    });
  };

  return (
    <div style={{ padding: '10px' }}>
      <div>
        <label htmlFor="">用户名：</label>
      </div>
      <Input disabled value={info.userName} style={{ width: '300px', marginBottom: '16px' }} />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">真实姓名：</label>
      </div>
      <Input disabled value={info.realName} style={{ width: '300px', marginBottom: '16px' }} />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">加入时间：</label>
      </div>
      <Input disabled value={info.time} style={{ width: '300px', marginBottom: '16px' }} />
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
