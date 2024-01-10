import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron';
export const UserInfo = () => {
  const { t } = useTranslation();
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
        <label htmlFor="">{t('cfr.userName')}：</label>
      </div>
      <Input disabled value={info.userName} style={{ width: '300px', marginBottom: '16px' }} />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">{t('cfr.realName')}：</label>
      </div>
      <Input disabled value={info.realName} style={{ width: '300px', marginBottom: '16px' }} />
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="">{t('cfr.join') + t('home.time')}：</label>
      </div>
      <Input disabled value={info.time} style={{ width: '300px', marginBottom: '16px' }} />
    </div>
  );
};

const rules: any = [{ type: 'string', min: 5, max: 16, required: true }];
export const UserInfoRight = () => {
  const { t } = useTranslation();
  const [info, setInfo] = useState<any>({});
  useEffect(() => {
    init();
  }, []);
  const init = () => {
    const data = JSON.parse(localStorage.getItem('user') || '') || {};
    setInfo(data);
    setUserInfo(res => {
      return {
        ...res,
        userName: data.userName,
      };
    });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({
    userName: '',
    originalPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [form] = Form.useForm();

  const onOpen = () => {
    form.setFieldsValue({
      ...userInfo,
    });
    setIsModalOpen(true);
  };
  const onModalOk = async () => {
    try {
      await form.validateFields();
      const dataParam = {
        ...info,
        newPassword: userInfo.password,
      };
      const data = await ipcRenderer.invoke('userOperate', {
        name: 'updateUserPassword',
        data: dataParam,
      });
      if (data) {
        message.success(t('history.dataUpdateSuccessful'));
        setIsModalOpen(false);
        const newUser = Object.assign({}, info, { password: data.password });
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        message.error(t('history.dataUpdateFailed'));
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
  const onModalCancel = () => {
    setUserInfo(res => {
      return {
        userName: info.userName,
      };
    });
    setIsModalOpen(false);
    form.resetFields();
  };
  return (
    <>
      <div>
        <Button style={{ width: '100%' }} onClick={onOpen}>
          {t('cfr.revise') + t('history.password')}
        </Button>
      </div>
      <Modal
        title={t('cfr.revise') + t('history.password')}
        open={isModalOpen}
        maskClosable={false}
        width={400}
        onOk={onModalOk}
        onCancel={onModalCancel}
        destroyOnClose={true}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="userName" label={t('cfr.userName')} required rules={rules}>
            <Input
              disabled={true}
              value={userInfo.userName || ''}
              maxLength={16}
              onChange={e => changeUserInfo('userName', e)}
            />
          </Form.Item>
          <Form.Item
            name="originalPassword"
            label={t('cfr.original') + t('history.password')}
            required
            rules={[
              ...rules,
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (info.password === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(t('cfr.originalPasswordErr'));
                },
              }),
            ]}
          >
            <Input.Password
              maxLength={16}
              value={userInfo.originalPassword || ''}
              onChange={e => changeUserInfo('originalPassword', e)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('cfr.new') + t('history.password')}
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
            label={t('cfr.new') + t('history.password') + t('home.confirm')}
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
        </Form>
      </Modal>
    </>
  );
};
