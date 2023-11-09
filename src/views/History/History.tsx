import { MainBody, MainRight } from '@/components/main';
import { equipment, resize } from '@/stores';
import { DatePicker, Select, Table, TableProps, Tooltip } from 'antd';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
const { RangePicker } = DatePicker;

const History: React.FC = () => {
  const [deviceList, setDeviceList] = useState<any[]>();

  const deviceListChange = data => {
    setDeviceList(data);
  };
  return (
    <div className="summary">
      <MainBody style={{ position: 'relative', overflow: 'hidden' }}>
        <HistoryMain deviceList={deviceList}></HistoryMain>
      </MainBody>
      <MainRight>
        <HistoryLift change={deviceListChange}></HistoryLift>
      </MainRight>
    </div>
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

const HistoryMain = ({ deviceList }) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState('\u2103');
  const columns: TableProps<RecordType>['columns'] = [
    // {
    //   title: t('home.serialNumber'),
    //   dataIndex: 'id',
    //   width: 30,
    //   align: 'center',
    // },
    {
      title: <span style={{ fontSize: '12px' }}>{t('history.cloudStorage')}</span>,
      dataIndex: 'cloudStorage',
      width: 50,
      align: 'center',
      render(value, record, index) {
        return (
          <Tooltip title={t('history.uploadPlatform')} destroyTooltipOnHide={true}>
            <i
              className="iconfont icon-yunduanshangchuan"
              style={{ fontSize: '20px', color: '#0078D7' }}
            ></i>
          </Tooltip>
        );
      },
    },
    {
      title: <span style={{ fontSize: '12px' }}>{t('left.equipmentModel')}</span>,
      dataIndex: 'type',
      width: 60,
      align: 'center',
    },
    {
      title: <span style={{ fontSize: '12px' }}>{t('history.dataName')}</span>,
      dataIndex: 'dataName',
      width: 180,
      align: 'center',
    },
    {
      title: <span style={{ fontSize: '12px' }}>{t('history.startTime')}</span>,
      dataIndex: 'startTime',
      width: 90,
      align: 'center',
    },
    {
      title: <span style={{ fontSize: '12px' }}>{t('history.currentNumberEntries')}</span>,
      dataIndex: 'dataCount',
      width: 60,
      align: 'center',
    },
    {
      title: <span style={{ fontSize: '12px' }}>{`S1(${t('left.maximumValue')})`}</span>,
      dataIndex: 'maxTemperature',
      width: 60,
      align: 'center',
      render(value: any, record: RecordType, index: number) {
        return (
          <span>
            {value}
            {unit}
          </span>
        );
      },
    },
    {
      title: <span style={{ fontSize: '12px' }}>{`S1(${t('left.minimumValue')})`}</span>,
      dataIndex: 'minTemperature',
      width: 60,
      align: 'center',
      render(value: any, record: RecordType, index: number) {
        return (
          <span>
            {value}
            {unit}
          </span>
        );
      },
    },
    {
      title: <span style={{ fontSize: '12px' }}>{t('history.localSave')}</span>,
      dataIndex: 'dataStorage_type',
      width: 60,
      align: 'center',
      render(value: any, record: RecordType, index: number) {
        return <span>{value == 0 ? '是' : '否'}</span>;
      },
    },
  ];

  const [axle, setAxle] = useState<number>(600);
  const resizeData = useRecoilValue(resize);
  const device = useRecoilValue(equipment);

  useEffect(() => {
    const Y = document.getElementsByClassName('summary-main')[0].clientHeight;
    if (!Y) return;
    if (resizeData >= 1500) {
      setAxle(Y - 100);
    } else {
      setAxle(Y - 140);
    }
  }, [resizeData]);

  useEffect(() => {
    setDeviceData(deviceList);
  }, [deviceList]);

  const getRowClassName = (record, index) => {
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };

  useEffect(() => {
    getData();
    ipcRenderer.on('renewDevice', async (event, data) => {
      console.log(data);
      if (data && data.length > 0) {
        setDeviceData(data);
      }
    });
  }, []);

  const [deviceData, setDeviceData] = useState([]);

  const getData = async () => {
    const data = await ipcRenderer.invoke('queryDevice');
    console.log(data);
    setDeviceData(data);
    const multidUnit = device?.record.multidUnit;
    if (parseInt(multidUnit) == 1) {
      setUnit('\u2109');
    } else {
      setUnit('\u2103');
    }
  };
  return (
    <>
      <div style={{ padding: 0 }} className="tableTitle">
        <Table
          bordered={false}
          virtual
          columns={columns}
          scroll={{ x: 100, y: axle }}
          rowKey="id"
          dataSource={deviceData}
          pagination={false}
          rowClassName={getRowClassName}
        />
      </div>
    </>
  );
};

const HistoryLift = ({ change }: { change: (data) => void }) => {
  const { t } = useTranslation();
  const timeChange = async (dates, dateStrings: [string, string]) => {
    const todo = await ipcRenderer.invoke('queryDevice', dateStrings);
    console.log(todo);
    
    change(todo);
  };
  const handleChange = value => {};
  return (
    <>
      <div style={{ paddingLeft: '4px', fontSize: '12px' }}>{t('history.timeOptions')}：</div>
      <RangePicker showTime size="small" onChange={timeChange} />
      <div style={{ paddingLeft: '4px', fontSize: '12px' }}>{t('history.quickView')}：</div>
      <div className="deploy-select" style={{ padding: '0' }}>
        <Select
          style={{ width: '100%' }}
          onChange={handleChange}
          popupClassName="deploy-select-popup"
          options={[
            { value: '30', label: '一个月' },
            { value: '90', label: '三个月' },
            { value: '180', label: '六个月' },
          ]}
        />
      </div>
    </>
  );
};

export default History;
