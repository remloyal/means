import { useEffect, useState } from 'react';
import { Button, Input, Table, TableProps, Modal, message, List, Typography, Checkbox } from 'antd';
import { Transfer } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import { useTranslation } from 'react-i18next';
import { language, pageHeight, signInformation, userInformation } from '@/stores';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ipcRenderer } from 'electron';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/es/checkbox/Group';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}

export const Endorsement = () => {
  const { t } = useTranslation();
  const [height, setHight] = useRecoilState(pageHeight);
  const [axle, setAxle] = useState<number>(500);
  const [userInfo, setUserInfo] = useState<RecordType[]>();
  const [userSelected, setUserSelected] = useRecoilState(userInformation);
  const [signSelected, setSignSelected] = useRecoilState(signInformation);

  const tongue = useRecoilValue(language);
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
    setAxle(height - 330);
  }, [height]);
  useEffect(() => {
    init();
    initSignList();
    return () => {
      setUserSelected({});
      setSignSelected({ type: '', data: {} });
    };
  }, []);
  useEffect(() => {
    if (userSelected?.data && userSelected?.type == 'update') {
      init();
    }
  }, [userSelected]);

  useEffect(() => {
    if (signSelected?.data && signSelected?.type == 'update') {
      initSignList();
      init();
    }
  }, [signSelected]);

  const init = async () => {
    const data = await ipcRenderer.invoke('userOperate', { name: 'queryUser', data: {} });
    if (data) {
      setUserInfo(data);
    }
  };
  const initSignList = async () => {
    const signData = await ipcRenderer.invoke('userOperate', { name: 'getSign', data: {} });
    if (signData) {
      setSignList(signData);
    }
  };
  const handleRowClick = data => {
    setSignKeyList(
      data.endorsementId != '' ? data.endorsementId.split(',').map(item => parseInt(item)) : []
    );
    setUserSelected({ type: 'setup', data });
  };

  // 签注列表
  const [signList, setSignList] = useState<any[]>([]);
  const [signKeyList, setSignKeyList] = useState<any[]>([]);
  const [signAllKey, setSignAllKey] = useState<any[]>([]);
  const [signClick, setSignClick] = useState<any>({
    data: {},
    index: null,
  });

  const onClickList = (item, index) => {
    setSignClick({
      data: item,
      index,
    });
    setSignSelected({ type: 'setup', data: item });
  };

  const onCheckboxChange = async e => {
    let keyList: any = [];
    if (e.target.checked) {
      keyList = [...signKeyList, e.target.value];
    } else {
      keyList = signKeyList.filter(item => item !== e.target.value);
    }
    setSignKeyList(keyList);
    await ipcRenderer.invoke('userOperate', {
      name: 'updateUserEndorsement',
      data: {
        ...userSelected.data,
        endorsementId: keyList.toString(),
      },
    });
    init();
  };

  return (
    <>
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
        style={{ height: `${axle}px`, borderBottom: '1px solid #D3D4D8', marginBottom: '46px' }}
        onRow={record => {
          return {
            onClick: event => handleRowClick(record),
          };
        }}
      />
      <List
        bordered
        dataSource={signList}
        style={{ height: '200px', width: '100%', overflow: 'auto' }}
        size="small"
        renderItem={(item, index) => (
          <>
            <List.Item style={{ padding: 0 }}>
              <List.Item.Meta
                avatar={
                  <Checkbox
                    style={{ width: '10px', height: '40px', padding: '10px' }}
                    disabled={userSelected?.data && userSelected?.data.userName ? false : true}
                    checked={signKeyList.includes(item.id)}
                    value={item.id}
                    onChange={onCheckboxChange}
                  ></Checkbox>
                }
                description={
                  <div
                    style={{
                      color: '#000',
                      backgroundColor: signClick.index == index ? 'var(--bg-right-color)' : '',
                      padding: '10px',
                    }}
                    onClick={() => {
                      onClickList(item, index);
                    }}
                  >
                    {item.name}
                  </div>
                }
              ></List.Item.Meta>
            </List.Item>
          </>
        )}
      />
    </>
  );
};

export const EndorsementRight = () => {
  const { t } = useTranslation();
  const [endorsementText, setEndorsementText] = useState('');
  const [signSelected, setSignSelected] = useRecoilState(signInformation);
  const [title, setTitle] = useState(0);

  const confirm = (type = 0) => {
    if (type == 1) {
      setEndorsementText(signSelected.data.name);
    } else {
      setEndorsementText('');
    }
    setTitle(type);
    setIsModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  async function onModalOk(e): Promise<void> {
    if (endorsementText.length == 0) {
      message.error(t('cfr.fillEndorsement'));
      return;
    }
    if (title == 0) {
      addEndorsement();
    } else {
      updateEndorsement();
    }
  }

  function onModalCancel(e): void {
    setIsModalOpen(false);
  }

  // 添加签注
  const addEndorsement = async () => {
    // 查询是否存在
    const oldData = await ipcRenderer.invoke('userOperate', {
      name: 'getSign',
      data: {
        name: endorsementText,
      },
    });
    if (oldData) {
      message.error(t('cfr.endorsementExists'));
    } else {
      const data = await ipcRenderer.invoke('userOperate', {
        name: 'addOrUpdateSign',
        data: {
          name: endorsementText,
        },
      });
      if (data) {
        message.success(t('cfr.add') + t('cfr.endorsement') + t('cfr.success'));
        setIsModalOpen(false);
        setSignSelected({
          type: 'update',
          data: {
            ...signSelected.data,
          },
        });
      } else {
        message.error(t('cfr.add') + t('cfr.fail'));
      }
    }
  };

  // 修改签注
  const updateEndorsement = async () => {
    // 查询是否存在
    const oldData = await ipcRenderer.invoke('userOperate', {
      name: 'getSign',
      data: {
        name: endorsementText,
      },
    });
    if (oldData) {
      message.error(t('cfr.endorsementExists'));
      return;
    }
    const data = await ipcRenderer.invoke('userOperate', {
      name: 'updateSign',
      data: {
        ...signSelected.data,
        name: endorsementText,
      },
    });
    if (data) {
      message.success(t('cfr.edit') + t('cfr.endorsement') + t('cfr.success'));
      setIsModalOpen(false);
      setSignSelected({ data, type: 'update' });
    } else {
      message.error(t('cfr.edit') + t('cfr.fail'));
    }
  };

  // 删除签注
  const deleteEndorsement = async () => {
    // console.log(signSelected);
    Modal.confirm({
      title: t('cfr.delete') + t('cfr.endorsement'),
      content: t('cfr.deleteEndorsement', { name: signSelected?.data.name }),
      centered: true,
      async onOk() {
        const data = await ipcRenderer.invoke('userOperate', {
          name: 'deleteSign',
          data: signSelected?.data,
        });
        if (data) {
          setSignSelected({
            type: 'update',
            data: {},
          });
          message.success(t('cfr.delete') + t('cfr.endorsement') + t('cfr.success'));
        } else {
          message.error(t('cfr.delete') + t('cfr.endorsement') + t('cfr.fail'));
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <Button style={{ width: '100%', margin: '10px 0' }} onClick={() => confirm(0)}>
        {t('cfr.add') + t('cfr.endorsement')}
      </Button>
      <Button
        style={{ width: '100%', margin: '10px 0' }}
        onClick={() => confirm(1)}
        disabled={signSelected?.data ? (signSelected?.data.id ? false : true) : true}
      >
        {t('cfr.edit') + t('cfr.endorsement')}
      </Button>
      <Button
        style={{ width: '100%', margin: '10px 0' }}
        disabled={signSelected?.data ? (signSelected?.data.id ? false : true) : true}
        onClick={deleteEndorsement}
      >
        {t('cfr.delete') + t('cfr.endorsement')}
      </Button>
      <Modal
        title={
          title == 0 ? t('cfr.add') + t('cfr.endorsement') : t('cfr.edit') + t('cfr.endorsement')
        }
        open={isModalOpen}
        maskClosable={false}
        width={400}
        onOk={onModalOk}
        onCancel={onModalCancel}
        destroyOnClose={true}
        centered
      >
        <Input
          maxLength={20}
          value={endorsementText}
          onChange={e => {
            setEndorsementText(e.target.value);
          }}
        ></Input>
      </Modal>
    </div>
  );
};
