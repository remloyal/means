import { ShareChart, createFoldLine, createSeries } from '@/components/echarts/DisplayCharts';
import { analysisState, deviceSelectKey, exportExcelTime, resize } from '@/stores';
import { color16 } from '@/utils/time';
import { Button, Modal, Spin, Table, TableProps, message } from 'antd';
import { ipcRenderer } from 'electron';
import { createRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

let exportState = false;

export const AnalysisPage = () => {
  const [deviceListKey, setDeviceListKey] = useRecoilState(deviceSelectKey);
  const graph = useRef(null);
  const [option, setOption] = useState({});
  const [data, setData] = useState([]);
  // 存储当前 key
  const [currentKey, setCurrentKey] = useState([]);

  useEffect(() => {
    initData();
  }, []);
  const initData = async () => {
    const todo = await ipcRenderer.invoke('queryHistoryDevice', deviceListKey);
    setConfig(todo);
    setCurrentKey(deviceListKey);
  };

  const setConfig = record => {
    const seriesList: any = [];
    for (let index = 0; index < record.length; index++) {
      const element = record[index];
      if (!element.color) {
        element.color = color16();
      }
      const series = getConfig(element.csvData, element.gentsn, element.color);
      seriesList.push(series);
    }
    const optionData = createFoldLine(seriesList);
    setOption({ ...optionData });
    setData(record);
  };
  const getConfig = (item, name, color) => {
    const valueList: any = [];
    for (let index = 0; index < item.length; index++) {
      const element = item[index];
      valueList.push([element.timeStamp, parseFloat(element.c)]);
    }
    const data = createSeries(valueList, color, name);
    return data;
  };
  const ondelete = item => {
    const record: any[] = [...data];
    const filtrate = record.filter(res => res.id !== item.id);
    const keys = currentKey.filter(res => res !== item.id);
    setConfig(filtrate);
    setCurrentKey(keys);
  };
  const childRef = createRef<any>();
  const [exportTime, setExportTime] = useRecoilState(exportExcelTime);
  const [messageApi, contextHolder] = message.useMessage();
  const exportExcel = async () => {
    if (exportState) return;
    exportState = true;
    const imgBaseData = await childRef.current.exportImage();
    const todo = await ipcRenderer.invoke('exportHistory', { key: currentKey, img: imgBaseData });
    if (todo) {
      messageApi.open({
        type: 'success',
        content: 'This is a success message',
      });
      exportState = false;
      console.log(todo);
    } else {
      messageApi.open({
        type: 'error',
        content: 'This is a error message',
      });
    }
    messageApi.destroy();
  };
  useEffect(() => {
    if (exportTime) {
      exportExcel();
    }
  }, [exportTime]);
  return (
    <>
      <div className="summary-graph" ref={graph} style={{ height: '450px' }}>
        <ShareChart
          option={option}
          parent={graph}
          style={{ zIndex: 20 }}
          hight={450}
          ref={childRef}
        ></ShareChart>
      </div>
      <AnalysisTable data={data} ondelete={ondelete} />
    </>
  );
};

interface RecordType {
  id: number;
  cloudStorage: string;
  type: string;
  datanName: string | number;
  startTime: string | number;
  dataConunt: string | number;
  maxTemperature: string | number;
  minTemperature: string | number;
}
export const AnalysisTable = ({ data, ondelete }) => {
  const { t } = useTranslation();
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: <span className="span_10">{t('home.serialNumber')}</span>,
      dataIndex: 'id',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{index + 1}</span>;
      },
    },
    {
      title: <span className="span_10">{t('history.operate')}</span>,
      dataIndex: 'operate',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return (
          <span
            className="span_10"
            style={{ color: '#0000FF', cursor: 'pointer' }}
            onClick={() => ondelete(record)}
          >
            移除
          </span>
        );
      },
    },
    {
      title: <span className="span_10">{t('history.identify')}</span>,
      dataIndex: 'identifying',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return (
          <span
            style={{
              backgroundColor: record.color,
              padding: '2px 6px',
              color: '#FFFFFF',
              fontSize: '10px',
            }}
          >
            {record.id}
          </span>
        );
      },
    },
    {
      title: <span className="span_10">{t('history.recordName')}</span>,
      dataIndex: 'dataName',
      width: 80,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{value}</span>;
      },
    },
    {
      title: <span className="span_10">{t('history.recordNumber')}</span>,
      dataIndex: 'dataName',
      width: 80,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{value}</span>;
      },
    },
    {
      title: <span className="span_10">{t('history.dataPoints')}</span>,
      dataIndex: 'dataCount',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{value}</span>;
      },
    },
    {
      title: <span className="span_10">{t('history.duration')}</span>,
      dataIndex: 'cloudStorage',
      width: 40,
      align: 'center',
    },
    {
      title: <span className="span_10">{`${t('left.maximumValue')}(\u2103)`}</span>,
      dataIndex: 'max',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{record.temperature.max}</span>;
      },
    },
    {
      title: <span className="span_10">{`${t('left.minimumValue')}(\u2103)`}</span>,
      dataIndex: 'min',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{record.temperature.min}</span>;
      },
    },
    {
      title: <span className="span_10">{`${t('history.averageValue')}(\u2103)`}</span>,
      dataIndex: 'average',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_10">{record.temperature.average}</span>;
      },
    },
  ];

  const [axle, setAxle] = useState<number>(300);
  const [deviceRecord, setDeviceRecord] = useState([]);
  const resizeData = useRecoilValue(resize);

  useEffect(() => {
    const Y = document.getElementsByClassName('summary-main')[0].clientHeight;
    if (!Y) return;
    if (resizeData >= 1500) {
      setAxle(Y - 400);
    } else {
      setAxle(Y - 540);
    }
  }, [resizeData]);

  useEffect(() => {
    setDeviceRecord(data);
  }, [data]);
  const getRowClassName = (record, index) => {
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };

  return (
    <div>
      <Table
        bordered
        virtual
        columns={columns}
        scroll={{ x: 100, y: axle }}
        rowKey="id"
        dataSource={deviceRecord}
        pagination={false}
        rowClassName={getRowClassName}
      />
    </div>
  );
};

export const AnalysisPageLeft = () => {
  const { t } = useTranslation();
  const [pageState, setPageState] = useRecoilState(analysisState);
  const [exportTime, setExportTime] = useRecoilState(exportExcelTime);
  const handleClick = () => {
    setPageState(true);
    setExportTime('');
  };
  const exportExcel = async () => {
    setExportTime(new Date().getTime().toString());
  };
  return (
    <>
      <Button onClick={handleClick} style={{ width: '100%' }}>
        {t('home.goBack')}
      </Button>
      <Button style={{ width: '100%', marginTop: '10px' }} onClick={exportExcel}>
        导出Excel
      </Button>
    </>
  );
};
