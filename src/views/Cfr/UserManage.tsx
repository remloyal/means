import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Table, TableProps, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { pageHeight, userInformation } from '@/stores';
import { useRecoilState } from 'recoil';
import { ipcRenderer } from 'electron';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}
export const UserManage = () => {
  const { t } = useTranslation();
  const [height, setHight] = useRecoilState(pageHeight);
  const [axle, setAxle] = useState<number>(500);
  const [userInfo, setUserInfo] = useState<RecordType[]>();
  const [userSelected, setUserSelected] = useRecoilState(userInformation);

  const typeList = [t('cfr.administrator'), t('cfr.users')];
  const stateList = [t('cfr.normal'), t('cfr.lock')];
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: t('cfr.userName'),
      dataIndex: 'userName',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.realName'),
      dataIndex: 'realName',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.position'),
      dataIndex: 'position',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.type'),
      dataIndex: 'type',
      width: 60,
      align: 'center',
      render(value, record, index) {
        return <span>{typeList[value || 1]}</span>;
      },
    },
    {
      title: t('cfr.state'),
      dataIndex: 'state',
      width: 60,
      align: 'center',
      render(value, record, index) {
        return <span>{stateList[value || 0]}</span>;
      },
    },
  ];
  const getRowClassName = (record, index) => {
    if (userSelected?.data && record.id == userSelected?.data.id) {
      return 'clickRow';
    }
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };
  useEffect(() => {
    setAxle(height - 150);
  }, [height]);
  useEffect(() => {
    init();
    return () => {
      setUserSelected({});
    };
  }, []);
  useEffect(() => {
    if (userSelected?.data && userSelected?.type == 'update') {
      init();
    }
  }, [userSelected]);
  const init = async () => {
    const data = await ipcRenderer.invoke('userOperate', { name: 'queryUser' });
    setUserInfo(data);
  };

  const handleRowClick = data => {
    setUserSelected({ type: 'setup', data });
  };
  return (
    <Table
      bordered={false}
      virtual
      size="small"
      columns={columns}
      scroll={{ y: axle }}
      rowKey="id"
      dataSource={userInfo}
      pagination={false}
      rowClassName={getRowClassName}
      onRow={record => {
        return {
          onClick: event => handleRowClick(record),
        };
      }}
    />
  );
};

export const UserManageRight = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSelected, setUserSelected] = useRecoilState(userInformation);
  const [title, setTitle] = useState(0);
  const titleList = [t('cfr.newUsers'), t('cfr.modifyUsers')];

  const createUser = () => {
    setTitle(0);
    setIsModalOpen(true);
  };

  const modifyUser = () => {
    form.setFieldsValue({
      ...userSelected.data,
      confirmPassword: userSelected.data.password,
    });
    setUserInfo(userSelected.data);
    setTitle(1);
    setIsModalOpen(true);
  };
  const [userInfo, setUserInfo] = useState<any>({
    confirmPassword: '',
    password: '',
    position: '',
    realName: '',
    userName: '',
  });
  const [form] = Form.useForm();
  const changeUserInfo = (key, e) => {
    setUserInfo(itme => {
      return { ...itme, [key]: e.target.value };
    });
  };

  const onModalOk = async () => {
    try {
      await form.validateFields();
      if (title == 0) {
        createUserInfo();
      } else {
        modifyUserInfo();
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const onModalCancel = () => {
    setUserInfo({});
    setIsModalOpen(false);
    form.resetFields();
  };
  // 创建用户
  const createUserInfo = async () => {
    const data = await ipcRenderer.invoke('userOperate', {
      name: 'queryUserByName',
      data: userInfo,
    });
    if (data) {
      message.error('用户名已存在');
    } else {
      await ipcRenderer.invoke('userOperate', { name: 'createUser', data: userInfo });
      setUserInfo({});
      form.resetFields();
      setUserSelected({
        type: 'update',
        data: userSelected.data || {},
      });
      setIsModalOpen(false);
    }
  };

  // 修改用户
  const modifyUserInfo = async () => {
    const data = await ipcRenderer.invoke('userOperate', { name: 'createUser', data: userInfo });
    setUserInfo({});
    form.resetFields();
    setUserSelected({
      type: 'update',
      data,
    });
    setIsModalOpen(false);
  };
  const rules: any = [{ type: 'string', min: 5, required: true }];

  const [modifyState, setModifyState] = useState(true);

  useEffect(() => {
    if (userSelected?.data && userSelected?.data?.id) {
      modifyState == true && setModifyState(false);
    } else {
      setModifyState(true);
    }
  }, [userSelected]);

  // 锁定用户
  const lockUser = async () => {
    const data = await ipcRenderer.invoke('userOperate', {
      name: 'lockUser',
      data: {
        ...userSelected?.data,
        state: '1',
      },
    });
    if (data) {
      setUserSelected({
        type: 'update',
        data,
      });
      message.success(t('cfr.lock') + t('cfr.users') + t('cfr.success'));
    } else {
      message.success(t('cfr.lock') + t('cfr.users') + t('cfr.fail'));
    }
  };

  // 解锁用户
  const unlockUser = async () => {
    const data = await ipcRenderer.invoke('userOperate', {
      name: 'lockUser',
      data: {
        ...userSelected?.data,
        state: '0',
      },
    });
    if (data) {
      setUserSelected({
        type: 'update',
        data,
      });
      message.success(t('cfr.unlock') + t('cfr.users') + t('cfr.success'));
    } else {
      message.success(t('cfr.unlock') + t('cfr.users') + t('cfr.fail'));
    }
  };

  // 重置用户
  const resetUser = async () => {
    Modal.confirm({
      title: t('cfr.resetting') + t('history.password'),
      content: t('cfr.resetPasswordText', { userName: userSelected?.data.userName }),
      centered: true,
      async onOk() {
        console.log('OK');
        const data = await ipcRenderer.invoke('userOperate', {
          name: 'resetUser',
          data: {
            ...userSelected?.data,
          },
        });
        if (data) {
          setUserSelected({
            type: 'update',
            data,
          });
          message.success(t('cfr.userResetSuccess'));
        } else {
          message.success(t('cfr.resetting') + t('cfr.fail'));
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <Button style={{ width: '100%', margin: '10px 0' }} onClick={createUser}>
        {t('cfr.newUsers')}
      </Button>
      <Button
        disabled={modifyState}
        style={{ width: '100%', margin: '10px 0' }}
        onClick={modifyUser}
      >
        {t('cfr.modifyUsers')}
      </Button>
      <Button
        disabled={userSelected?.data ? (userSelected?.data.state == 1 ? true : false) : false}
        style={{ width: '100%', margin: '10px 0' }}
        onClick={lockUser}
      >
        {t('cfr.lock') + t('cfr.users')}
      </Button>
      <Button
        disabled={userSelected?.data ? (userSelected?.data.state == 0 ? true : false) : false}
        style={{ width: '100%', margin: '10px 0' }}
        onClick={unlockUser}
      >
        {t('cfr.unlock') + t('cfr.users')}
      </Button>
      <Button
        disabled={userSelected?.data ? false : true}
        style={{ width: '100%', margin: '10px 0' }}
        onClick={resetUser}
      >
        {t('cfr.resetting') + t('history.password')}
      </Button>
      <Modal
        title={titleList[title || 0]}
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
              disabled={title == 1}
              value={userInfo.userName || ''}
              onChange={e => changeUserInfo('userName', e)}
            />
          </Form.Item>
          <Form.Item name="realName" label={t('cfr.realName')} required rules={rules}>
            <Input
              disabled={title == 1}
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
              max={16}
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
              max={16}
              value={userInfo.confirmPassword || ''}
              onChange={e => changeUserInfo('confirmPassword', e)}
            />
          </Form.Item>
          <Form.Item name="position" label={t('cfr.position')} required rules={rules}>
            <Input value={userInfo.position || ''} onChange={e => changeUserInfo('position', e)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
