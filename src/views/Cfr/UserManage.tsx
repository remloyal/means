import { useEffect, useState } from 'react';
import { Button, Input, Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { pageHeight } from '@/stores';
import { useRecoilState } from 'recoil';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}
export const UserManage = () => {
  const { t } = useTranslation();
  const [height, setHight] = useRecoilState(pageHeight);
  const [axle, setAxle] = useState<number>(500);
  const [csvData, setCsvData] = useState<RecordType[]>();
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: t('cfr.userName'),
      dataIndex: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.realName'),
      dataIndex: 'time',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.position'),
      dataIndex: 'heat',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.type'),
      dataIndex: 'heat',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.state'),
      dataIndex: 'heat',
      width: 60,
      align: 'center',
    },
  ];
  const getRowClassName = (record, index) => {
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };

  useEffect(() => {
    console.log(height);
    setAxle(height - 150);
  }, [height]);

  return (
    <Table
      bordered={false}
      virtual
      size="small"
      columns={columns}
      scroll={{ y: axle }}
      rowKey="id"
      dataSource={csvData}
      pagination={false}
      rowClassName={getRowClassName}
    />
  );
};

export const UserManageRight = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <Button style={{ width: '100%', margin: '10px 0' }}>新增用户</Button>
      <Button style={{ width: '100%', margin: '10px 0' }}>修改用户</Button>
      <Button style={{ width: '100%', margin: '10px 0' }}>锁定用户</Button>
      <Button style={{ width: '100%', margin: '10px 0' }}>解锁用户</Button>
      <Button style={{ width: '100%', margin: '10px 0' }}>重置用户</Button>
    </div>
  );
};
