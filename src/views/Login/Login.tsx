import { useTranslation } from 'react-i18next';
import './login.scss';
import brand from '@/assets/brand.png';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { language } from '@/stores';
import { ipcRenderer } from 'electron';

const Login = ({ onMain }) => {
  const { t, i18n } = useTranslation();
  const [userInfo, setUserInfo] = useState<any>({
    password: '',
    userName: '',
  });
  const [info, setInfo] = useState({
    loginNumber: 0,
    guardTime: 0,
    expirationTime: 0,
  });
  const [loginNumber, setLoginNumber] = useState(0);
  const [loginState, setloginState] = useState(false);

  const init = async () => {
    const data = await ipcRenderer.invoke('securityPolicy');
    const obj = {
      loginNumber: 0,
      guardTime: 0,
      expirationTime: 0,
    };
    data.map(item => {
      obj[item.name] = item.value;
    });
    setInfo(obj);
    setLoginNumber(obj.loginNumber - 1);
  };
  useEffect(() => {
    init();
    ipcRenderer.on('exitPrompt', (event, data) => {
      exit();
    });
    return () => {
      ipcRenderer.removeAllListeners('exitPrompt');
    };
  }, []);

  const [form] = Form.useForm();
  const changeUserInfo = (key, e) => {
    setUserInfo(itme => {
      return { ...itme, [key]: e.target.value };
    });
  };
  const rules: any = [{ type: 'string', min: 5, max: 16, required: true }];
  const [tongue, setTongue] = useRecoilState(language);
  const setLanguage = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
    setTongue(value);
    ipcRenderer.invoke('language', value);
    ipcRenderer.invoke('lang', value);
  };
  const onFinish = async (values: any) => {
    const data = await ipcRenderer.invoke('userOperate', { name: 'login', data: values });
    if (data) {
      const userInfo = { ...data, ...info, loginTime: new Date() };
      localStorage.setItem('user', JSON.stringify(userInfo));
      message.success(t('cfr.login') + t('cfr.success'));
      onMain();
    } else {
      Modal.error({
        content: t('cfr.loginErrText', { order: loginNumber }),
        centered: true,
        cancelButtonProps: { style: { display: 'none' } },
        onOk(...args) {
          if (loginNumber == 0) {
            setloginState(true);
            return;
          }
          setLoginNumber(loginNumber - 1);
        },
      });
    }
  };
  //   退出
  const exit = () => {
    ipcRenderer.invoke('exitType', 2);
  };
  return (
    <div
      id="main"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="login">
        <div className="image">
          <img src={brand} />
        </div>
        <div className="login-text">FDA 21 CFR</div>
        <Form
          form={form}
          layout="vertical"
          style={{
            padding: '0px 120px',
          }}
          onFinish={onFinish}
        >
          <Form.Item name="userName" label={t('cfr.userName')} required rules={rules}>
            <Input
              value={userInfo.userName || ''}
              maxLength={16}
              onChange={e => changeUserInfo('userName', e)}
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
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                style={{ width: '40%' }}
                disabled={loginState}
                type="primary"
                htmlType="submit"
              >
                {t('cfr.login')}
              </Button>
              <Button style={{ width: '40%' }} onClick={exit}>
                {t('home.cancellation')}
              </Button>
            </div>
          </Form.Item>
          <Form.Item>
            <label htmlFor="">{t('home.language')}：</label>
            <Select
              defaultValue={tongue}
              style={{ width: 100 }}
              onChange={setLanguage}
              size="small"
              options={[
                { value: 'zh', label: '简体中文' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
