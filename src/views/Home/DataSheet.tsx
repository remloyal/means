import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

// @ts-nocheck
const MutationObserver = window.MutationObserver;
let observer;
const DataSheet = () => {
  const { t } = useTranslation();
  const device = useRecoilValue(equipment);
  const handle = useThrottle(setHight, 500);
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
      title: `${t('home.temperature')} (${MultidUnit[device?.record.multidUnit || 0]})`,
      dataIndex: 'heat',
      width: 120,
      align: 'center',
    },
  ];
  if (device?.record.highHumi != null && device?.record.lowHumi != null) {
    columns.push({
      title: `${t('home.humidity')} (%RH)`,
      dataIndex: 'humi',
      width: 120,
      align: 'center',
    });
  }

  const [title, setTitle] = useState('');
  const [csvData, setCsvData] = useState<RecordType[]>();
  useEffect(() => {
    getTitle();
    getData();
  }, [device]);

  const [axle, setAxle] = useState<number>(500);
  // const resizeData = useRecoilValue(resize);
  // useEffect(() => {
  //   const num = 500 + (resizeData.width - 1424) / 6;
  //   setAxle(num);
  // }, [resizeData]);
  function setHight() {
    const element = document.querySelector('.summary-main');
    const height: any = window.getComputedStyle(element!)['height'];
    const axleHight = parseInt(height) - 180;
    setAxle(axleHight);
  }

  useEffect(() => {
    const element = document.querySelector('.ant-tabs-content-holder');
    observer = new MutationObserver(mutationList => {
      // console.log(mutationList);
      // useThrottle(setHight, 500);
      handle();
    });

    observer.observe(element, {
      childList: true, // 子节点的变动（新增、删除或者更改）
      attributes: true, // 属性的变动
      attributeFilter: ['style'],
      characterData: false, // 节点内容或节点文本的变动
      subtree: true, // 是否将观察器应用于该节点的所有后代节点
    });
    return () => {
      observer.disconnect();
      observer = null;
    };
  }, []);
  const getData = (list: any = null) => {
    const todo = list || device?.csvData;
    if (todo) {
      const data: RecordType[] = todo.map((item, index) => ({
        id: index + 1,
        time: `${item.timeStamp}`,
        heat: MultidUnit[device?.record.multidUnit || 0] == '\u2109' ? `${item.f}` : `${item.c}`,
        humi: item.humi || 0,
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
        scroll={{ y: axle }}
        rowKey="id"
        dataSource={csvData}
        pagination={false}
        rowClassName={getRowClassName}
      />
    </div>
  );
};

/**
 * 函数节流
 * @param fn 执行函数 需要防抖的函数也就是你处理逻辑的地方
 * @param time 时间间隔
 * @param params 执行函数需要的参数
 * @param dep useCallback的依赖项
 * @returns
 */
export function useThrottle(fn, delay, dep = []) {
  const defaultData: { fn: any; pre: number } = { fn, pre: 0 };
  const { current = { fn: null, pre: 0 } } = useRef(defaultData);
  useEffect(() => {
    current.fn = fn;
  }, [fn]);
  return useCallback((...args) => {
    // 用时间间隔做限制
    const now = new Date().getTime();
    const timeDiff = now - (current?.pre || 0);
    if (timeDiff > delay) {
      current.pre = now;
      current.fn?.(...args);
    }
  }, dep);
}

export default DataSheet;
