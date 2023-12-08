import React, { useEffect, useMemo, useState } from 'react';
import { Segmented, Space, Switch, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useRecoilValue } from 'recoil';
import { equipment, resize, screenList } from '@/stores';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}

const DataSheet = () => {
  const { t } = useTranslation();
  const device = useRecoilValue(equipment);
  const MultidUnit = {
    0: '\u2103',
    1: '\u2109',
  };

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
      title: MultidUnit[device?.record.multidUnit || 0],
      dataIndex: 'heat',
      width: 120,
      align: 'center',
    },
  ];

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

  const getData = (list: any = null) => {
    const todo = list || device?.csvData;
    if (todo) {
      const data: RecordType[] = todo.map((item, index) => ({
        id: index + 1,
        time: `${item.timeStamp}`,
        heat: MultidUnit[device?.record.multidUnit || 0] == '\u2109' ? `${item.f}` : `${item.c}`,
      }));
      setCsvData(data);
    } else {
      setCsvData([]);
    }
  };

  const getTitle = () => {
    if (device) {
      const data = `${device?.record.deviceType} (${device?.record.getsn})`;
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

  const todoList = useRecoilValue(screenList);
  useEffect(() => {
    if (todoList.length > 0) {
      getData(todoList);
    }
  }, [todoList]);

  return (
    <div style={{ padding: 0 }} className="tableTitle">
      <div style={{ paddingBottom: '10px', textAlign: 'center' }}>{title}</div>
      <Table
        bordered={false}
        virtual
        size="small"
        columns={columns}
        scroll={{ x: 100, y: axle || 500 }}
        rowKey="id"
        dataSource={csvData}
        pagination={false}
        rowClassName={getRowClassName}
      />
    </div>
  );
};

export default DataSheet;
