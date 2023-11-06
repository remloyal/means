import React, { useEffect, useMemo, useState } from 'react';
import { Segmented, Space, Switch, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useRecoilValue } from 'recoil';
import { equipment, resize } from '@/stores';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}

const DataSheet = () => {
  const { t } = useTranslation();
  //   const data = useMemo(() => getData(count), [count]);
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: t('home.serialNumber'),
      dataIndex: 'id',
      width: 30,
      align: 'center',
    },
    {
      title: t('home.time'),
      dataIndex: 'time',
      width: 120,
      align: 'center',
    },
    {
      title: '(\u2103)',
      dataIndex: 'heat',
      width: 120,
      align: 'center',
    },
  ];
  const device = useRecoilValue(equipment);
  const [title, setTitle] = useState('');
  const [csvData, setCsvData] = useState<RecordType[]>();
  useEffect(() => {
    getTitle();
    getData();
  }, [device]);

  const [axle, setAxle] = useState<number>(500);
  const resizeData = useRecoilValue(resize);
  useEffect(() => {
    const num = 500 + (resizeData.width - 1424) / 6;
    setAxle(num);
  }, [resizeData]);

  const getData = () => {
    const todo = device?.csvData;
    if (todo) {
      const data: RecordType[] = todo.map((item, index) => ({
        id: index + 1,
        time: `${item.timeStamp}`,
        heat: `${item.c}`,
      }));
      setCsvData(data);
    } else {
      setCsvData([]);
    }
  };

  const getTitle = () => {
    if (device) {
      const data = `${device?.record.deviceType} ${device?.record.getsn}`;
      setTitle(data);
    } else {
      setTitle('');
    }
  };

  const getRowClassName = (record, index) => {
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };
  return (
    <div style={{ padding: 0 }} className="tableTitle">
      <div style={{ paddingBottom: '10px' }}>{title}</div>
      <Table
        bordered={false}
        virtual
        columns={columns}
        scroll={{ x: 100, y: axle }}
        rowKey="id"
        dataSource={csvData}
        pagination={false}
        rowClassName={getRowClassName}
      />
    </div>
  );
};

export default DataSheet;
