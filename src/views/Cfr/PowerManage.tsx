import { useEffect, useState } from 'react';
import { Button, Input, Table, TableProps } from 'antd';
import { Transfer } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import { useTranslation } from 'react-i18next';
import { language, pageHeight, userInformation } from '@/stores';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ipcRenderer } from 'electron';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}

export const PowerManage = () => {
  const { t } = useTranslation();
  const [height, setHight] = useRecoilState(pageHeight);
  const [axle, setAxle] = useState<number>(500);
  const [userInfo, setUserInfo] = useState<RecordType[]>();
  const [userSelected, setUserSelected] = useRecoilState(userInformation);
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
    return () => {
      setUserSelected({});
    };
  }, []);

  const init = async () => {
    getUserInfo();
    const powerList = await ipcRenderer.invoke('userOperate', { name: 'queryPower' });
    if (powerList) {
      setMockData(powerList);
    }
  };

  const getUserInfo = async () => {
    const data = await ipcRenderer.invoke('userOperate', { name: 'queryUser' });
    setUserInfo(data);
  };

  const [mockData, setMockData] = useState<any[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  useEffect(() => {
    setMockData([...mockData]);
  }, [tongue]);

  useEffect(() => {
    if (userSelected?.data && userSelected.data.powerId) {
      const keys = userSelected.data.powerId.split(',').map(key => parseInt(key));
      setTargetKeys(keys);
    } else {
      setTargetKeys([]);
    }
  }, [userSelected]);

  const onChange = async (
    nextTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[]
  ) => {
    const newUserInfo = { ...userSelected.data, powerId: nextTargetKeys.toString() };
    const powerList = await ipcRenderer.invoke('userOperate', {
      name: 'updateUserPower',
      data: newUserInfo,
    });
    if (powerList) {
      setUserSelected({
        type: 'update',
        data: powerList,
      });
      getUserInfo();
    }
  };

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    // console.log('sourceSelectedKeys:', sourceSelectedKeys);
    // console.log('targetSelectedKeys:', targetSelectedKeys);
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const renderItem = item => {
    const customLabel = (
      <span className="custom-item">{item.translateKey ? t(item.translateKey) : item.name}</span>
    );
    return {
      label: customLabel, // for displayed item
      value: item.id, // for title and filter matching
    };
  };

  const handleRowClick = data => {
    setUserSelected({ type: 'setup', data });
    setSelectedKeys([]);
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
        style={{ height: `${axle}px`, borderBottom: '1px solid #D3D4D8', marginBottom: '46px' }}
        rowClassName={getRowClassName}
        onRow={record => {
          return {
            onClick: event => handleRowClick(record),
          };
        }}
      />
      <Transfer
        disabled={userSelected?.data ? (userSelected.data.userName ? false : true) : true}
        style={{ width: '100%' }}
        titles={[t('cfr.systemPermissions'), t('cfr.permissionObtained')]}
        dataSource={mockData}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        listStyle={{ width: '50%', height: 200 }}
        onChange={onChange}
        onSelectChange={onSelectChange}
        render={renderItem}
      />
    </>
  );
};

export const PowerManageRight = () => {
  return <></>;
};
