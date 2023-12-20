import { useEffect, useState } from 'react';
import { Button, Input, Table, TableProps } from 'antd';
import { Transfer } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import { useTranslation } from 'react-i18next';
import { pageHeight } from '@/stores';
import { useRecoilState } from 'recoil';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}

const mockData = Array.from({ length: 20 }).map((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
}));
const initialTargetKeys = mockData.filter(item => Number(item.key) > 10).map(item => item.key);
export const Endorsement = () => {
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
    setAxle(height - 300);
  }, [height]);
  const TransferData = () => {
    const [targetKeys, setTargetKeys] = useState(initialTargetKeys);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const onChange = (
      nextTargetKeys: string[],
      direction: TransferDirection,
      moveKeys: string[]
    ) => {
      console.log('targetKeys:', nextTargetKeys);
      console.log('direction:', direction);
      console.log('moveKeys:', moveKeys);
      setTargetKeys(nextTargetKeys);
    };

    const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
      console.log('sourceSelectedKeys:', sourceSelectedKeys);
      console.log('targetSelectedKeys:', targetSelectedKeys);
      setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

    const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {
      console.log('direction:', direction);
      console.log('target:', e.target);
    };

    return (
      <Transfer
        style={{ width: '100%' }}
        dataSource={mockData}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        listStyle={{ width: '50%', height: 200 }}
        onChange={onChange}
        onSelectChange={onSelectChange}
        onScroll={onScroll}
        render={item => item.title}
      />
    );
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
        dataSource={csvData}
        pagination={false}
        rowClassName={getRowClassName}
        style={{ height: `${axle}px`, borderBottom: '1px solid #D3D4D8', marginBottom: '10px' }}
      />
      <TransferData />
    </>
  );
};

export const EndorsementRight = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <Button style={{ width: '100%', margin: '10px 0' }}>新增签注</Button>
      <Button style={{ width: '100%', margin: '10px 0' }}>编辑签注</Button>
      <Button style={{ width: '100%', margin: '10px 0' }}>删除签注</Button>
    </div>
  );
};
