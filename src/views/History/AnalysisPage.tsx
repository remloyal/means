import { ShareChart, createFoldLine, createSeries } from '@/components/echarts/DisplayCharts';
import { lang } from '@/config';
import { analysisState, deviceSelectKey, exportExcelTime, resize } from '@/stores';
import { color16 } from '@/utils/time';
import { Button, Modal, Spin, Table, TableProps, message } from 'antd';
import { ipcRenderer } from 'electron';
import { createRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

let exportState = false;

export const AnalysisPage = () => {
  const { t } = useTranslation();
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
  const exportExcel = async () => {
    if (exportState) return;
    exportState = true;
    const imgBaseData = await childRef.current.exportImage();
    const language = localStorage.getItem('language') || 'zh';
    try {
      const todo = await ipcRenderer.invoke('exportHistory', {
        key: currentKey,
        img: imgBaseData,
        lang: language,
      });
      if (todo) {
        exportState = false;
        console.log(todo);
        message.success(t('home.exportSuccess'));
      } else {
        exportState = false;
        message.error(t('home.exportFailed'));
      }
    } catch (error) {
      exportState = false;
      message.error(t('home.exportFailed'));
    }
    setTimeout(() => {
      setModalOpen(false);
    }, 1000);
  };
  useEffect(() => {
    if (exportTime) {
      setModalOpen(true);
      exportExcel();
    }
  }, [exportTime]);

  const [modalOpen, setModalOpen] = useState(false);

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
      <Modal
        centered
        open={modalOpen}
        width={200}
        closeIcon={null}
        footer={null}
        maskClosable={false}
      >
        <div
          style={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ height: 100, width: 100 }}>
            <Spin size="large" tip={`${t('home.processing')}...`} style={{ height: 100 }}>
              <div className="content" />
            </Spin>
          </div>
        </div>
      </Modal>
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
      title: <span className="span_12">{t('home.serialNumber')}</span>,
      dataIndex: 'id',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{index + 1}</span>;
      },
    },
    {
      title: <span className="span_12">{t('history.operate')}</span>,
      dataIndex: 'operate',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return (
          <span
            className="span_12"
            style={{ color: '#0000FF', cursor: 'pointer' }}
            onClick={() => ondelete(record)}
          >
            移除
          </span>
        );
      },
    },
    {
      title: <span className="span_12">{t('history.identify')}</span>,
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
      title: <span className="span_12">{t('history.recordName')}</span>,
      dataIndex: 'dataName',
      width: 80,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{value}</span>;
      },
    },
    {
      title: <span className="span_12">{t('history.recordNumber')}</span>,
      dataIndex: 'dataName',
      width: 80,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{value}</span>;
      },
    },
    {
      title: <span className="span_12">{t('history.dataPoints')}</span>,
      dataIndex: 'dataCount',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{value}</span>;
      },
    },
    {
      title: <span className="span_12">{t('history.duration')}</span>,
      dataIndex: 'duration',
      width: 40,
      align: 'center',
    },
    {
      title: <span className="span_12">{`${t('left.maximumValue')}(\u2103)`}</span>,
      dataIndex: 'max',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{record.temperature.max}</span>;
      },
    },
    {
      title: <span className="span_12">{`${t('left.minimumValue')}(\u2103)`}</span>,
      dataIndex: 'min',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{record.temperature.min}</span>;
      },
    },
    {
      title: <span className="span_12">{`${t('history.averageValue')}(\u2103)`}</span>,
      dataIndex: 'average',
      width: 30,
      align: 'center',
      render(value: any, record: any, index: number) {
        return <span className="span_12">{record.temperature.average}</span>;
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
        size="small"
        columns={columns}
        scroll={{ x: 1000, y: axle }}
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
    setTimeout(() => {
      setExportTime('');
    }, 500);
  };
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        width: '80%',
        height: '100%',
        backgroundColor: '#F0F1F5',
        transition: 'opacity 0.5s',
      }}
    >
      <Button onClick={handleClick} style={{ width: '100%' }}>
        {t('home.goBack')}
      </Button>
      <Button style={{ width: '100%', marginTop: '10px' }} onClick={exportExcel}>
        {t('home.exportData')}
      </Button>
    </div>
  );
};
